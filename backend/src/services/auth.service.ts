import { randomBytes } from 'crypto';
import { Comercio, EstadoInvitacion, RolUsuario, Usuario } from '@prisma/client';
import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { compararPassword, hashearPassword } from '../utils/password.util';
import { generarJwt } from '../utils/jwt.util';
import { ahora, sumarDias } from '../utils/fecha.util';
import {
  ErrorEmailNoVerificado,
  ErrorNoAutorizado,
  ErrorNoEncontrado,
  ErrorValidacion,
} from '../utils/error-app';
import { verificacionStaffService } from './verificacion-staff.service';
import {
  CompletarInvitacionDto,
  InvitarStaffDto,
  LoginCredencialesDto,
  LoginGoogleDto,
  ReenviarCodigoDto,
  DisponibilidadComercioDto,
  RegistroComercioDto,
  VerificarEmailDto,
} from '../dtos/auth.dto';

const clienteGoogle = env.googleClientId ? new OAuth2Client(env.googleClientId) : null;

export interface UsuarioPublico {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  comercio_id: string | null;
}

export interface ComercioPublico {
  id: string;
  nombre: string;
  url: string;
}

export interface ResultadoAutenticacion {
  token: string;
  usuario: UsuarioPublico;
  comercio: ComercioPublico | null;
}

export interface ResultadoRegistroPendiente {
  requiere_verificacion: true;
  email: string;
  mensaje: string;
  /** Solo en desarrollo, cuando SMTP no está configurado. */
  codigo_desarrollo?: string;
}

export interface ResultadoReenvioCodigo {
  email: string;
  mensaje: string;
  /** Solo en desarrollo, cuando SMTP no está configurado. */
  codigo_desarrollo?: string;
}

function aUsuarioPublico(usuario: Usuario): UsuarioPublico {
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
    comercio_id: usuario.comercio_id,
  };
}

function aComercioPublico(comercio: Comercio | null): ComercioPublico | null {
  if (!comercio) {
    return null;
  }
  return { id: comercio.id, nombre: comercio.nombre, url: comercio.url };
}

function emitirToken(usuario: Usuario): string {
  return generarJwt({
    sub: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    comercio_id: usuario.comercio_id,
  });
}

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** Enmascara un email para mostrarlo sin revelarlo por completo (ej. d***@dominio.com). */
function enmascararEmail(email: string): string {
  const [local, dominio] = email.split('@');
  if (!dominio || local.length === 0) {
    return email;
  }
  const visible = local.slice(0, 1);
  return `${visible}***@${dominio}`;
}

function datosEmailVerificado(): { email_verificado: true; email_verificado_fecha: Date } {
  return {
    email_verificado: true,
    email_verificado_fecha: ahora(),
  };
}

async function verificarTokenGoogle(idToken: string): Promise<{ email: string; googleId: string }> {
  if (!clienteGoogle) {
    throw new ErrorValidacion('Login con Google no está configurado (falta GOOGLE_CLIENT_ID).');
  }

  const ticket = await clienteGoogle.verifyIdToken({
    idToken,
    audience: env.googleClientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.email || !payload.sub) {
    throw new ErrorNoAutorizado('Token de Google inválido.');
  }

  return { email: normalizarEmail(payload.email), googleId: payload.sub };
}

async function assertUrlComercioDisponible(url: string): Promise<void> {
  const urlExistente = await prisma.comercio.findUnique({ where: { url } });
  if (urlExistente) {
    throw new ErrorValidacion('La URL del comercio ya está en uso.');
  }
}

async function assertNombreComercioDisponible(nombre: string): Promise<void> {
  const nombreExistente = await prisma.comercio.findFirst({
    where: { nombre: { equals: nombre.trim(), mode: 'insensitive' } },
  });
  if (nombreExistente) {
    throw new ErrorValidacion('Ya existe un comercio registrado con ese nombre.');
  }
}

export const authService = {
  async verificarDisponibilidadComercio(params: {
    url?: string;
    nombre?: string;
  }): Promise<DisponibilidadComercioDto> {
    const resultado: DisponibilidadComercioDto = {
      url_disponible: true,
      nombre_disponible: true,
    };

    const url = params.url?.trim().toLowerCase();
    if (url) {
      const urlExistente = await prisma.comercio.findUnique({ where: { url } });
      resultado.url_disponible = !urlExistente;
    }

    const nombre = params.nombre?.trim();
    if (nombre) {
      const nombreExistente = await prisma.comercio.findFirst({
        where: { nombre: { equals: nombre, mode: 'insensitive' } },
      });
      resultado.nombre_disponible = !nombreExistente;
    }

    return resultado;
  },

  async registrarComercioConAdmin(dto: RegistroComercioDto): Promise<ResultadoRegistroPendiente> {
    const email = normalizarEmail(dto.email);
    const url = dto.url.trim().toLowerCase();
    const nombreComercio = dto.nombreComercio.trim();

    await assertUrlComercioDisponible(url);
    await assertNombreComercioDisponible(nombreComercio);

    const emailExistente = await prisma.usuario.findUnique({ where: { email } });
    if (emailExistente) {
      throw new ErrorValidacion('Ya existe un usuario con ese email.');
    }

    const passwordHash = await hashearPassword(dto.password);
    const fechaVencimiento = sumarDias(30);

    const admin = await prisma.$transaction(async (tx) => {
      const comercio = await tx.comercio.create({
        data: {
          nombre: nombreComercio,
          url,
          estado_suscripcion: 'pendiente',
          barrio: dto.barrio.trim(),
          rubro: dto.rubro,
          direccion: dto.direccion.trim(),
          fecha_vencimiento: fechaVencimiento,
        },
      });

      return tx.usuario.create({
        data: {
          comercio_id: comercio.id,
          nombre: dto.nombreAdmin.trim(),
          email,
          password: passwordHash,
          rol: RolUsuario.admin,
          telefono: dto.telefono.trim(),
        },
      });
    });

    const codigo = await verificacionStaffService.generarOtpRegistro(admin.id, email);

    return {
      requiere_verificacion: true,
      email: enmascararEmail(email),
      mensaje: 'Te enviamos un código a tu correo para activar la cuenta.',
      ...(env.esDesarrollo && { codigo_desarrollo: codigo }),
    };
  },

  async verificarEmailStaff(dto: VerificarEmailDto): Promise<ResultadoAutenticacion> {
    const usuario = await verificacionStaffService.validarOtpRegistro(dto.email, dto.codigo);

    const comercio = usuario.comercio_id
      ? await prisma.comercio.findUnique({ where: { id: usuario.comercio_id } })
      : null;

    return {
      token: emitirToken(usuario),
      usuario: aUsuarioPublico(usuario),
      comercio: aComercioPublico(comercio),
    };
  },

  async reenviarCodigoStaff(dto: ReenviarCodigoDto): Promise<ResultadoReenvioCodigo> {
    const codigo = await verificacionStaffService.reenviarOtpRegistro(dto.email);
    return {
      email: enmascararEmail(normalizarEmail(dto.email)),
      mensaje: 'Te enviamos un nuevo código a tu correo.',
      ...(env.esDesarrollo && { codigo_desarrollo: codigo }),
    };
  },

  async loginCredenciales(dto: LoginCredencialesDto): Promise<ResultadoAutenticacion> {
    const email = normalizarEmail(dto.email);
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { comercio: true },
    });

    if (!usuario || !usuario.password) {
      throw new ErrorNoAutorizado('Email o contraseña incorrectos.');
    }

    if (!usuario.activo) {
      throw new ErrorNoAutorizado('La cuenta está desactivada.');
    }

    const passwordValido = await compararPassword(dto.password, usuario.password);
    if (!passwordValido) {
      throw new ErrorNoAutorizado('Email o contraseña incorrectos.');
    }

    if (!usuario.email_verificado) {
      throw new ErrorEmailNoVerificado(enmascararEmail(usuario.email));
    }

    return {
      token: emitirToken(usuario),
      usuario: aUsuarioPublico(usuario),
      comercio: aComercioPublico(usuario.comercio),
    };
  },

  async loginGoogle(dto: LoginGoogleDto): Promise<ResultadoAutenticacion> {
    const { email, googleId } = await verificarTokenGoogle(dto.idToken);

    let usuario = await prisma.usuario.findUnique({
      where: { google_id: googleId },
      include: { comercio: true },
    });

    if (!usuario) {
      const porEmail = await prisma.usuario.findUnique({
        where: { email },
        include: { comercio: true },
      });

      if (!porEmail) {
        throw new ErrorNoAutorizado(
          'No existe una cuenta para este email de Google. Pedí una invitación o registrá tu comercio.',
        );
      }

      usuario = await prisma.usuario.update({
        where: { id: porEmail.id },
        data: {
          google_id: googleId,
          ...datosEmailVerificado(),
        },
        include: { comercio: true },
      });
    } else if (!usuario.email_verificado) {
      usuario = await prisma.usuario.update({
        where: { id: usuario.id },
        data: datosEmailVerificado(),
        include: { comercio: true },
      });
    }

    if (!usuario.activo) {
      throw new ErrorNoAutorizado('La cuenta está desactivada.');
    }

    return {
      token: emitirToken(usuario),
      usuario: aUsuarioPublico(usuario),
      comercio: aComercioPublico(usuario.comercio),
    };
  },

  async obtenerSesion(usuarioId: string): Promise<{ usuario: UsuarioPublico; comercio: ComercioPublico | null }> {
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      include: { comercio: true },
    });

    if (!usuario || !usuario.activo) {
      throw new ErrorNoAutorizado('Sesión inválida.');
    }

    if (!usuario.email_verificado) {
      throw new ErrorEmailNoVerificado(enmascararEmail(usuario.email));
    }

    return {
      usuario: aUsuarioPublico(usuario),
      comercio: aComercioPublico(usuario.comercio),
    };
  },

  async listarProfesionales(comercioId: string): Promise<{
    profesionales: {
      id: string;
      nombre: string;
      email: string;
      telefono: string | null;
      activo: boolean;
      email_verificado: boolean;
      matricula_profesional: string | null;
    }[];
    invitaciones_pendientes: { id: string; email: string; expiration: Date }[];
  }> {
    const [profesionales, invitaciones_pendientes] = await Promise.all([
      prisma.usuario.findMany({
        where: { comercio_id: comercioId, rol: RolUsuario.profesional },
        orderBy: { nombre: 'asc' },
        select: {
          id: true,
          nombre: true,
          email: true,
          telefono: true,
          activo: true,
          email_verificado: true,
          matricula_profesional: true,
        },
      }),
      prisma.invitacion.findMany({
        where: {
          comercio_id: comercioId,
          estado: EstadoInvitacion.pendiente,
          expiration: { gt: ahora() },
        },
        orderBy: { created_at: 'desc' },
        select: { id: true, email: true, expiration: true },
      }),
    ]);

    return { profesionales, invitaciones_pendientes };
  },

  async crearInvitacion(
    comercioId: string,
    dto: InvitarStaffDto,
  ): Promise<{ token: string; email: string; link: string }> {
    const email = normalizarEmail(dto.email);

    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      throw new ErrorValidacion('Ya existe un usuario registrado con ese email.');
    }

    const invitacionPendiente = await prisma.invitacion.findFirst({
      where: { comercio_id: comercioId, email, estado: EstadoInvitacion.pendiente },
    });
    if (invitacionPendiente) {
      throw new ErrorValidacion('Ya hay una invitación pendiente para ese email.');
    }

    const token = randomBytes(32).toString('hex');
    const expiration = sumarDias(7);

    await prisma.invitacion.create({
      data: { comercio_id: comercioId, email, token, expiration },
    });

    return {
      token,
      email,
      link: `${env.frontendUrl}/auth/invitacion/${token}`,
    };
  },

  async obtenerInvitacionPorToken(token: string): Promise<{ email: string; comercio: ComercioPublico }> {
    const invitacion = await prisma.invitacion.findUnique({
      where: { token },
      include: { comercio: true },
    });

    if (!invitacion || invitacion.estado === EstadoInvitacion.aceptada) {
      throw new ErrorNoEncontrado('La invitación no existe o ya fue utilizada.');
    }

    if (invitacion.estado === EstadoInvitacion.expirada || invitacion.expiration < ahora()) {
      if (invitacion.estado !== EstadoInvitacion.expirada) {
        await prisma.invitacion.update({
          where: { id: invitacion.id },
          data: { estado: EstadoInvitacion.expirada },
        });
      }
      throw new ErrorValidacion('La invitación expiró.');
    }

    return {
      email: invitacion.email,
      comercio: aComercioPublico(invitacion.comercio)!,
    };
  },

  async completarInvitacion(
    token: string,
    dto: CompletarInvitacionDto,
  ): Promise<ResultadoAutenticacion> {
    const invitacion = await prisma.invitacion.findUnique({ where: { token } });

    if (!invitacion || invitacion.estado !== EstadoInvitacion.pendiente) {
      throw new ErrorValidacion('La invitación no es válida o ya fue utilizada.');
    }

    if (invitacion.expiration < ahora()) {
      await prisma.invitacion.update({
        where: { id: invitacion.id },
        data: { estado: EstadoInvitacion.expirada },
      });
      throw new ErrorValidacion('La invitación expiró.');
    }

    if (!dto.password && !dto.idToken) {
      throw new ErrorValidacion('Debés definir una contraseña o registrarte con Google.');
    }

    let googleId: string | null = null;
    if (dto.idToken) {
      const datosGoogle = await verificarTokenGoogle(dto.idToken);
      if (datosGoogle.email !== invitacion.email) {
        throw new ErrorValidacion('El email de Google no coincide con el de la invitación.');
      }
      googleId = datosGoogle.googleId;
    }

    const passwordHash = dto.password ? await hashearPassword(dto.password) : null;

    const usuario = await prisma.$transaction(async (tx) => {
      const nuevoUsuario = await tx.usuario.create({
        data: {
          comercio_id: invitacion.comercio_id,
          nombre: dto.nombre,
          email: invitacion.email,
          password: passwordHash,
          google_id: googleId,
          rol: RolUsuario.profesional,
          telefono: dto.telefono ?? null,
          ...datosEmailVerificado(),
        },
        include: { comercio: true },
      });

      await tx.invitacion.update({
        where: { id: invitacion.id },
        data: { estado: EstadoInvitacion.aceptada, usuario_id: nuevoUsuario.id },
      });

      return nuevoUsuario;
    });

    return {
      token: emitirToken(usuario),
      usuario: aUsuarioPublico(usuario),
      comercio: aComercioPublico(usuario.comercio),
    };
  },
};
