import { RolUsuario, Usuario } from '@prisma/client';
import { prisma } from '../config/prisma';
import { GuardarHorarioDto } from '../dtos/horario.dto';
import {
  ErrorNoAutorizado,
  ErrorNoEncontrado,
  ErrorValidacion,
} from '../utils/error-app';

export interface ContextoSolicitante {
  usuarioId: string;
  rol: RolUsuario;
  comercioId: string;
}

export interface HorarioDetalle {
  id: string;
  usuario_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

const REGEX_HORA = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function horaAFecha(valor: string): Date {
  const coincidencia = REGEX_HORA.exec(String(valor ?? '').trim());
  if (!coincidencia) {
    throw new ErrorValidacion('La hora debe tener formato HH:mm.');
  }
  const horas = Number(coincidencia[1]);
  const minutos = Number(coincidencia[2]);
  return new Date(Date.UTC(1970, 0, 1, horas, minutos, 0));
}

function fechaAHora(fecha: Date): string {
  const horas = String(fecha.getUTCHours()).padStart(2, '0');
  const minutos = String(fecha.getUTCMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

function aMinutos(fecha: Date): number {
  return fecha.getUTCHours() * 60 + fecha.getUTCMinutes();
}

function aHorarioDetalle(horario: {
  id: string;
  usuario_id: string;
  dia_semana: number;
  hora_inicio: Date;
  hora_fin: Date;
}): HorarioDetalle {
  return {
    id: horario.id,
    usuario_id: horario.usuario_id,
    dia_semana: horario.dia_semana,
    hora_inicio: fechaAHora(horario.hora_inicio),
    hora_fin: fechaAHora(horario.hora_fin),
  };
}

/** Valida que el solicitante pueda gestionar los horarios del usuario objetivo. */
async function asegurarAccesoUsuario(
  ctx: ContextoSolicitante,
  usuarioId: string,
): Promise<Usuario> {
  const usuario = await prisma.usuario.findFirst({
    where: { id: usuarioId, comercio_id: ctx.comercioId },
  });
  if (!usuario) {
    throw new ErrorNoEncontrado('No encontramos ese usuario en tu comercio.');
  }
  if (ctx.rol !== RolUsuario.admin && usuario.id !== ctx.usuarioId) {
    throw new ErrorNoAutorizado('Solo podés gestionar tus propios horarios.');
  }
  return usuario;
}

function validarRango(inicio: Date, fin: Date): void {
  if (aMinutos(inicio) >= aMinutos(fin)) {
    throw new ErrorValidacion('La hora de fin debe ser posterior a la de inicio.');
  }
}

function validarDia(diaSemana: number): void {
  if (!Number.isInteger(diaSemana) || diaSemana < 0 || diaSemana > 6) {
    throw new ErrorValidacion('El día de la semana no es válido.');
  }
}

/** Verifica que la nueva franja no se solape con otras del mismo usuario y día. */
async function asegurarSinSolapamiento(
  usuarioId: string,
  diaSemana: number,
  inicio: Date,
  fin: Date,
  excluirHorarioId?: string,
): Promise<void> {
  const existentes = await prisma.horario.findMany({
    where: {
      usuario_id: usuarioId,
      dia_semana: diaSemana,
      ...(excluirHorarioId ? { NOT: { id: excluirHorarioId } } : {}),
    },
  });

  const nuevoInicio = aMinutos(inicio);
  const nuevoFin = aMinutos(fin);

  const haySolapamiento = existentes.some((h) => {
    const iniExistente = aMinutos(h.hora_inicio);
    const finExistente = aMinutos(h.hora_fin);
    return nuevoInicio < finExistente && iniExistente < nuevoFin;
  });

  if (haySolapamiento) {
    throw new ErrorValidacion('La franja se superpone con otro horario de ese día.');
  }
}

function resolverUsuarioObjetivo(ctx: ContextoSolicitante, dto: GuardarHorarioDto): string {
  if (ctx.rol === RolUsuario.admin && dto.usuario_id) {
    return dto.usuario_id;
  }
  return ctx.usuarioId;
}

export const horarioService = {
  async listarDeUsuario(ctx: ContextoSolicitante, usuarioId: string): Promise<HorarioDetalle[]> {
    await asegurarAccesoUsuario(ctx, usuarioId);
    const horarios = await prisma.horario.findMany({
      where: { usuario_id: usuarioId },
      orderBy: [{ dia_semana: 'asc' }, { hora_inicio: 'asc' }],
    });
    return horarios.map(aHorarioDetalle);
  },

  async crear(ctx: ContextoSolicitante, dto: GuardarHorarioDto): Promise<HorarioDetalle> {
    const usuarioId = resolverUsuarioObjetivo(ctx, dto);
    await asegurarAccesoUsuario(ctx, usuarioId);

    validarDia(dto.dia_semana);
    const inicio = horaAFecha(dto.hora_inicio);
    const fin = horaAFecha(dto.hora_fin);
    validarRango(inicio, fin);
    await asegurarSinSolapamiento(usuarioId, dto.dia_semana, inicio, fin);

    const creado = await prisma.horario.create({
      data: {
        usuario_id: usuarioId,
        dia_semana: dto.dia_semana,
        hora_inicio: inicio,
        hora_fin: fin,
      },
    });

    return aHorarioDetalle(creado);
  },

  async actualizar(
    ctx: ContextoSolicitante,
    horarioId: string,
    dto: GuardarHorarioDto,
  ): Promise<HorarioDetalle> {
    const horario = await prisma.horario.findUnique({ where: { id: horarioId } });
    if (!horario) {
      throw new ErrorNoEncontrado('No encontramos ese horario.');
    }
    await asegurarAccesoUsuario(ctx, horario.usuario_id);

    validarDia(dto.dia_semana);
    const inicio = horaAFecha(dto.hora_inicio);
    const fin = horaAFecha(dto.hora_fin);
    validarRango(inicio, fin);
    await asegurarSinSolapamiento(horario.usuario_id, dto.dia_semana, inicio, fin, horarioId);

    const actualizado = await prisma.horario.update({
      where: { id: horarioId },
      data: {
        dia_semana: dto.dia_semana,
        hora_inicio: inicio,
        hora_fin: fin,
      },
    });

    return aHorarioDetalle(actualizado);
  },

  async eliminar(ctx: ContextoSolicitante, horarioId: string): Promise<{ mensaje: string }> {
    const horario = await prisma.horario.findUnique({ where: { id: horarioId } });
    if (!horario) {
      throw new ErrorNoEncontrado('No encontramos ese horario.');
    }
    await asegurarAccesoUsuario(ctx, horario.usuario_id);

    await prisma.horario.delete({ where: { id: horarioId } });

    return { mensaje: 'Horario eliminado correctamente.' };
  },
};
