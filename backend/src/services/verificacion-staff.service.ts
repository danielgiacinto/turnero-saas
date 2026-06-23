import { CanalVerificacion, PropositoVerificacion, Usuario } from '@prisma/client';
import { prisma } from '../config/prisma';
import { compararPassword, hashearPassword } from '../utils/password.util';
import { generarCodigoOtp } from '../utils/otp.util';
import { ahora, sumarMinutos } from '../utils/fecha.util';
import { ErrorValidacion } from '../utils/error-app';
import { emailService } from './email.service';

const OTP_LONGITUD = 6;
const OTP_EXPIRACION_MINUTOS = 10;
const OTP_MAX_INTENTOS = 5;
const OTP_REENVIO_SEGUNDOS = 60;

function normalizarEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Verificación de correo del staff (dueño) al registrarse con email + contraseña.
 * Usa la tabla `verificaciones` con `proposito = registro_staff`.
 */
export const verificacionStaffService = {
  /**
   * Genera un OTP para el usuario, invalida los pendientes previos y lo persiste hasheado.
   * Devuelve el código en claro para enviarlo por email (en dev se loguea por consola).
   */
  async generarOtpRegistro(usuarioId: string, email: string): Promise<string> {
    await prisma.verificacion.deleteMany({
      where: {
        usuario_id: usuarioId,
        proposito: PropositoVerificacion.registro_staff,
        usado_fecha: null,
      },
    });

    const codigo = generarCodigoOtp(OTP_LONGITUD);
    const codigoHash = await hashearPassword(codigo);
    const expiraFecha = sumarMinutos(OTP_EXPIRACION_MINUTOS);

    await prisma.verificacion.create({
      data: {
        usuario_id: usuarioId,
        email: normalizarEmail(email),
        codigo_hash: codigoHash,
        proposito: PropositoVerificacion.registro_staff,
        canal: CanalVerificacion.email,
        max_intentos: OTP_MAX_INTENTOS,
        expira_fecha: expiraFecha,
      },
    });

    await emailService.enviarCodigoVerificacionStaff(normalizarEmail(email), codigo);

    return codigo;
  },

  /**
   * Valida el OTP del usuario. Si es correcto, marca el código como usado y el email como verificado
   * (en una transacción) y devuelve el usuario actualizado.
   */
  async validarOtpRegistro(email: string, codigo: string): Promise<Usuario> {
    const emailNormalizado = normalizarEmail(email);
    const usuario = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });

    if (!usuario) {
      throw new ErrorValidacion('No encontramos una cuenta con ese correo.');
    }

    if (usuario.email_verificado) {
      throw new ErrorValidacion('La cuenta ya está verificada. Iniciá sesión.');
    }

    const verificacion = await prisma.verificacion.findFirst({
      where: {
        usuario_id: usuario.id,
        proposito: PropositoVerificacion.registro_staff,
        usado_fecha: null,
      },
      orderBy: { created_at: 'desc' },
    });

    if (!verificacion) {
      throw new ErrorValidacion('No hay un código de verificación pendiente. Pedí uno nuevo.');
    }

    if (verificacion.expira_fecha < ahora()) {
      throw new ErrorValidacion('El código expiró. Pedí uno nuevo.');
    }

    if (verificacion.intentos >= verificacion.max_intentos) {
      throw new ErrorValidacion('Superaste el máximo de intentos. Pedí un código nuevo.');
    }

    const codigoValido = await compararPassword(codigo, verificacion.codigo_hash);

    if (!codigoValido) {
      await prisma.verificacion.update({
        where: { id: verificacion.id },
        data: { intentos: { increment: 1 } },
      });
      throw new ErrorValidacion('Código incorrecto.');
    }

    const [, usuarioActualizado] = await prisma.$transaction([
      prisma.verificacion.update({
        where: { id: verificacion.id },
        data: { usado_fecha: ahora() },
      }),
      prisma.usuario.update({
        where: { id: usuario.id },
        data: { email_verificado: true, email_verificado_fecha: ahora() },
      }),
    ]);

    return usuarioActualizado;
  },

  /**
   * Reenvía un nuevo OTP si la cuenta existe y no está verificada, respetando el rate limit.
   * Devuelve el código en claro (para envío por email / log en dev).
   */
  async reenviarOtpRegistro(email: string): Promise<string> {
    const emailNormalizado = normalizarEmail(email);
    const usuario = await prisma.usuario.findUnique({ where: { email: emailNormalizado } });

    if (!usuario) {
      throw new ErrorValidacion('No encontramos una cuenta con ese correo.');
    }

    if (usuario.email_verificado) {
      throw new ErrorValidacion('La cuenta ya está verificada. Iniciá sesión.');
    }

    const ultima = await prisma.verificacion.findFirst({
      where: {
        usuario_id: usuario.id,
        proposito: PropositoVerificacion.registro_staff,
      },
      orderBy: { created_at: 'desc' },
    });

    if (ultima) {
      const segundosDesdeUltima = (Date.now() - ultima.created_at.getTime()) / 1000;
      if (segundosDesdeUltima < OTP_REENVIO_SEGUNDOS) {
        const restante = Math.ceil(OTP_REENVIO_SEGUNDOS - segundosDesdeUltima);
        throw new ErrorValidacion(`Esperá ${restante} segundos antes de pedir otro código.`);
      }
    }

    return this.generarOtpRegistro(usuario.id, emailNormalizado);
  },
};
