import { EstadoTurno, OrigenReserva, RolUsuario } from '@prisma/client';
import { prisma } from '../config/prisma';
import { CrearTurnoDto } from '../dtos/turno.dto';
import { clienteService } from './cliente.service';
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

export interface TurnoListado {
  id: string;
  fecha_hora: string;
  estado: EstadoTurno;
  origen_reserva: OrigenReserva;
  duracion_minutos: number;
  servicio: { id: string; nombre: string };
  profesional: { id: string; nombre: string };
  cliente: { id: string; nombre: string; apellido: string; email: string; telefono: string };
}

export interface StaffAtencion {
  id: string;
  nombre: string;
  rol: RolUsuario;
}

const REGEX_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const REGEX_HORA = /^([01]?\d|2[0-3]):([0-5]\d)$/;

// TODO: cuando haya comercios en otras zonas horarias, resolver la zona por comercio.
// Hoy fecha/hora se interpretan en la zona horaria del servidor (Argentina).
function combinarFechaHora(fecha: string, hora: string): Date {
  if (!REGEX_FECHA.test(fecha)) {
    throw new ErrorValidacion('La fecha debe tener formato YYYY-MM-DD.');
  }
  if (!REGEX_HORA.test(hora)) {
    throw new ErrorValidacion('La hora debe tener formato HH:mm.');
  }
  const resultado = new Date(`${fecha}T${hora.padStart(5, '0')}:00`);
  if (Number.isNaN(resultado.getTime())) {
    throw new ErrorValidacion('La fecha u hora indicadas no son válidas.');
  }
  return resultado;
}

function rangoDelDia(fecha: string): { desde: Date; hasta: Date } {
  const desde = combinarFechaHora(fecha, '00:00');
  const hasta = new Date(desde);
  hasta.setDate(hasta.getDate() + 1);
  return { desde, hasta };
}

function horaLocal(fecha: Date): string {
  const horas = String(fecha.getHours()).padStart(2, '0');
  const minutos = String(fecha.getMinutes()).padStart(2, '0');
  return `${horas}:${minutos}`;
}

function horaTimeAMinutos(hora: Date): number {
  return hora.getUTCHours() * 60 + hora.getUTCMinutes();
}

function minutosAHora(minutos: number): string {
  const horas = String(Math.floor(minutos / 60)).padStart(2, '0');
  const mins = String(minutos % 60).padStart(2, '0');
  return `${horas}:${mins}`;
}

const ESTADOS_OCUPAN_AGENDA: EstadoTurno[] = [
  EstadoTurno.pendiente_verificacion,
  EstadoTurno.pendiente,
  EstadoTurno.completo,
];

function resolverProfesionalObjetivo(
  ctx: ContextoSolicitante,
  profesionalId?: string | null,
): string {
  if (ctx.rol === RolUsuario.admin && profesionalId) {
    return profesionalId;
  }
  return ctx.usuarioId;
}

async function asegurarProfesionalDelComercio(
  ctx: ContextoSolicitante,
  profesionalId: string,
): Promise<void> {
  const profesional = await prisma.usuario.findFirst({
    where: { id: profesionalId, comercio_id: ctx.comercioId, activo: true },
  });
  if (!profesional) {
    throw new ErrorNoEncontrado('No encontramos ese profesional en tu comercio.');
  }
  if (ctx.rol !== RolUsuario.admin && profesionalId !== ctx.usuarioId) {
    throw new ErrorNoAutorizado('Solo podés operar sobre tu propia agenda.');
  }
}

/** Turnos que ocupan agenda del profesional en el día, con su duración. */
async function ocupacionDelDia(
  profesionalId: string,
  fecha: string,
): Promise<{ inicio: number; fin: number }[]> {
  const { desde, hasta } = rangoDelDia(fecha);
  const turnos = await prisma.turno.findMany({
    where: {
      profesional_id: profesionalId,
      estado: { in: ESTADOS_OCUPAN_AGENDA },
      fecha_hora: { gte: desde, lt: hasta },
    },
    include: { servicio: { select: { duracion_minutos: true } } },
  });

  return turnos.map((t) => {
    const [h, m] = horaLocal(t.fecha_hora).split(':').map(Number);
    const inicio = h * 60 + m;
    return { inicio, fin: inicio + t.servicio.duracion_minutos };
  });
}

export const turnoService = {
  /** Staff que atiende turnos (admin + profesionales activos) para el selector de agenda. */
  async listarStaffAtencion(ctx: ContextoSolicitante): Promise<StaffAtencion[]> {
    const usuarios = await prisma.usuario.findMany({
      where: {
        comercio_id: ctx.comercioId,
        activo: true,
        rol: { in: [RolUsuario.admin, RolUsuario.profesional] },
      },
      orderBy: [{ rol: 'asc' }, { nombre: 'asc' }],
      select: { id: true, nombre: true, rol: true },
    });
    return usuarios;
  },

  async listarDelDia(
    ctx: ContextoSolicitante,
    params: { profesionalId?: string; fecha: string },
  ): Promise<TurnoListado[]> {
    return this.listarRango(ctx, {
      profesionalId: params.profesionalId,
      desde: params.fecha,
      hasta: params.fecha,
    });
  },

  async listarRango(
    ctx: ContextoSolicitante,
    params: { profesionalId?: string; desde: string; hasta: string },
  ): Promise<TurnoListado[]> {
    const profesionalId = resolverProfesionalObjetivo(ctx, params.profesionalId);
    await asegurarProfesionalDelComercio(ctx, profesionalId);

    const { desde } = rangoDelDia(params.desde);
    const { hasta } = rangoDelDia(params.hasta);

    if (hasta <= desde) {
      throw new ErrorValidacion('El rango de fechas no es válido.');
    }
    const DIAS_MAXIMOS = 31;
    if (hasta.getTime() - desde.getTime() > DIAS_MAXIMOS * 24 * 60 * 60 * 1000) {
      throw new ErrorValidacion(`El rango no puede superar los ${DIAS_MAXIMOS} días.`);
    }

    const turnos = await prisma.turno.findMany({
      where: {
        comercio_id: ctx.comercioId,
        profesional_id: profesionalId,
        fecha_hora: { gte: desde, lt: hasta },
      },
      orderBy: { fecha_hora: 'asc' },
      include: {
        servicio: { select: { id: true, nombre: true, duracion_minutos: true } },
        profesional: { select: { id: true, nombre: true } },
        cliente: {
          select: { id: true, nombre: true, apellido: true, email: true, telefono: true },
        },
      },
    });

    return turnos.map((t) => ({
      id: t.id,
      fecha_hora: t.fecha_hora.toISOString(),
      estado: t.estado,
      origen_reserva: t.origen_reserva,
      duracion_minutos: t.servicio.duracion_minutos,
      servicio: { id: t.servicio.id, nombre: t.servicio.nombre },
      profesional: t.profesional,
      cliente: t.cliente,
    }));
  },

  /** Slots libres del profesional para un servicio y fecha, cruzando horarios y turnos existentes. */
  async disponibilidad(
    ctx: ContextoSolicitante,
    params: { profesionalId?: string; servicioId: string; fecha: string },
  ): Promise<{ hora: string }[]> {
    const profesionalId = resolverProfesionalObjetivo(ctx, params.profesionalId);
    await asegurarProfesionalDelComercio(ctx, profesionalId);

    const servicio = await prisma.servicio.findFirst({
      where: { id: params.servicioId, comercio_id: ctx.comercioId },
    });
    if (!servicio) {
      throw new ErrorNoEncontrado('No encontramos ese servicio en tu comercio.');
    }

    if (!REGEX_FECHA.test(params.fecha)) {
      throw new ErrorValidacion('La fecha debe tener formato YYYY-MM-DD.');
    }

    const diaSemana = combinarFechaHora(params.fecha, '00:00').getDay();

    const franjas = await prisma.horario.findMany({
      where: { usuario_id: profesionalId, dia_semana: diaSemana },
      orderBy: { hora_inicio: 'asc' },
    });

    if (franjas.length === 0) {
      return [];
    }

    const ocupados = await ocupacionDelDia(profesionalId, params.fecha);
    const duracion = servicio.duracion_minutos;
    const slots: { hora: string }[] = [];

    for (const franja of franjas) {
      const inicioFranja = horaTimeAMinutos(franja.hora_inicio);
      const finFranja = horaTimeAMinutos(franja.hora_fin);

      for (let inicio = inicioFranja; inicio + duracion <= finFranja; inicio += duracion) {
        const fin = inicio + duracion;
        const pisado = ocupados.some((o) => inicio < o.fin && o.inicio < fin);
        if (!pisado) {
          slots.push({ hora: minutosAHora(inicio) });
        }
      }
    }

    return slots;
  },

  async crear(ctx: ContextoSolicitante, dto: CrearTurnoDto): Promise<TurnoListado> {
    const profesionalId = resolverProfesionalObjetivo(ctx, dto.profesional_id);
    await asegurarProfesionalDelComercio(ctx, profesionalId);

    const servicio = await prisma.servicio.findFirst({
      where: { id: dto.servicio_id, comercio_id: ctx.comercioId },
    });
    if (!servicio) {
      throw new ErrorNoEncontrado('No encontramos ese servicio en tu comercio.');
    }

    const fechaHora = combinarFechaHora(dto.fecha, dto.hora);
    if (fechaHora.getTime() < Date.now()) {
      throw new ErrorValidacion('No se puede agendar un turno en el pasado.');
    }

    // El turno debe caer dentro de una franja horaria del profesional.
    const diaSemana = fechaHora.getDay();
    const franjas = await prisma.horario.findMany({
      where: { usuario_id: profesionalId, dia_semana: diaSemana },
    });

    const [horaTurno, minutoTurno] = dto.hora.split(':').map(Number);
    const inicioTurno = horaTurno * 60 + minutoTurno;
    const finTurno = inicioTurno + servicio.duracion_minutos;

    const dentroDeFranja = franjas.some(
      (f) => inicioTurno >= horaTimeAMinutos(f.hora_inicio) && finTurno <= horaTimeAMinutos(f.hora_fin),
    );
    if (!dentroDeFranja) {
      throw new ErrorValidacion('El horario elegido está fuera de la disponibilidad del profesional.');
    }

    const ocupados = await ocupacionDelDia(profesionalId, dto.fecha);
    const pisado = ocupados.some((o) => inicioTurno < o.fin && o.inicio < finTurno);
    if (pisado) {
      throw new ErrorValidacion('El profesional ya tiene un turno en ese horario.');
    }

    const cliente = await clienteService.obtenerOCrear(dto.cliente);

    const creado = await prisma.turno.create({
      data: {
        comercio_id: ctx.comercioId,
        cliente_id: cliente.id,
        profesional_id: profesionalId,
        servicio_id: servicio.id,
        estado: EstadoTurno.pendiente,
        origen_reserva: OrigenReserva.panel_staff,
        creado_por_usuario_id: ctx.usuarioId,
        fecha_hora: fechaHora,
      },
      include: {
        servicio: { select: { id: true, nombre: true, duracion_minutos: true } },
        profesional: { select: { id: true, nombre: true } },
        cliente: {
          select: { id: true, nombre: true, apellido: true, email: true, telefono: true },
        },
      },
    });

    return {
      id: creado.id,
      fecha_hora: creado.fecha_hora.toISOString(),
      estado: creado.estado,
      origen_reserva: creado.origen_reserva,
      duracion_minutos: creado.servicio.duracion_minutos,
      servicio: { id: creado.servicio.id, nombre: creado.servicio.nombre },
      profesional: creado.profesional,
      cliente: creado.cliente,
    };
  },

  async cancelar(ctx: ContextoSolicitante, turnoId: string): Promise<{ mensaje: string }> {
    const turno = await prisma.turno.findFirst({
      where: { id: turnoId, comercio_id: ctx.comercioId },
    });
    if (!turno) {
      throw new ErrorNoEncontrado('No encontramos ese turno.');
    }
    if (ctx.rol !== RolUsuario.admin && turno.profesional_id !== ctx.usuarioId) {
      throw new ErrorNoAutorizado('Solo podés cancelar turnos de tu propia agenda.');
    }
    if (turno.estado === EstadoTurno.cancelado) {
      throw new ErrorValidacion('El turno ya está cancelado.');
    }
    if (turno.estado === EstadoTurno.completo) {
      throw new ErrorValidacion('No se puede cancelar un turno ya completado.');
    }

    await prisma.turno.update({
      where: { id: turnoId },
      data: { estado: EstadoTurno.cancelado },
    });

    return { mensaje: 'Turno cancelado correctamente.' };
  },
};
