import { Cliente, EstadoTurno, OrigenReserva } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ErrorNoEncontrado, ErrorValidacion } from '../utils/error-app';

export interface ClientePublico {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

export interface ClienteListado extends ClientePublico {
  total_turnos: number;
  ultimo_turno: string | null;
}

export interface TurnoCliente {
  id: string;
  fecha_hora: string;
  estado: EstadoTurno;
  origen_reserva: OrigenReserva;
  duracion_minutos: number;
  servicio: { id: string; nombre: string };
  profesional: { id: string; nombre: string };
}

export interface ClienteDetalle extends ClientePublico {
  email_verificado: boolean;
  telefono_verificado: boolean;
  total_turnos: number;
  turnos: TurnoCliente[];
}

export interface DatosClienteDto {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
}

function aClientePublico(cliente: Cliente): ClientePublico {
  return {
    id: cliente.id,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    email: cliente.email,
    telefono: cliente.telefono,
  };
}

function normalizarEmail(email: string): string {
  return String(email ?? '').trim().toLowerCase();
}

function normalizarBusqueda(valor: string): string {
  return String(valor ?? '').trim();
}

export const clienteService = {
  /** Búsqueda exacta por email (los clientes son globales a la plataforma). */
  async buscarPorEmail(email: string): Promise<ClientePublico | null> {
    const emailNormalizado = normalizarEmail(email);
    if (!emailNormalizado) {
      throw new ErrorValidacion('Ingresá un email para buscar.');
    }
    const cliente = await prisma.cliente.findUnique({ where: { email: emailNormalizado } });
    return cliente ? aClientePublico(cliente) : null;
  },

  /**
   * Clientes que tuvieron al menos un turno en el comercio.
   * Opcionalmente filtra por nombre, apellido, email o teléfono.
   */
  async listarDelComercio(comercioId: string, busqueda?: string): Promise<ClienteListado[]> {
    const q = normalizarBusqueda(busqueda ?? '');

    const clientes = await prisma.cliente.findMany({
      where: {
        turnos: { some: { comercio_id: comercioId } },
        ...(q
          ? {
              OR: [
                { nombre: { contains: q, mode: 'insensitive' } },
                { apellido: { contains: q, mode: 'insensitive' } },
                { email: { contains: q, mode: 'insensitive' } },
                { telefono: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        turnos: {
          where: { comercio_id: comercioId },
          orderBy: { fecha_hora: 'desc' },
          select: { id: true, fecha_hora: true },
        },
      },
      orderBy: [{ apellido: 'asc' }, { nombre: 'asc' }],
    });

    // TODO: si el volumen crece, reemplazar por agregación (count + max fecha) sin traer todos los turnos.
    return clientes.map((c) => ({
      ...aClientePublico(c),
      total_turnos: c.turnos.length,
      ultimo_turno: c.turnos[0]?.fecha_hora.toISOString() ?? null,
    }));
  },

  /** Detalle del cliente con historial de turnos del comercio. */
  async obtenerDetalle(comercioId: string, clienteId: string): Promise<ClienteDetalle> {
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      include: {
        turnos: {
          where: { comercio_id: comercioId },
          orderBy: { fecha_hora: 'desc' },
          include: {
            servicio: { select: { id: true, nombre: true, duracion_minutos: true } },
            profesional: { select: { id: true, nombre: true } },
          },
        },
      },
    });

    if (!cliente || cliente.turnos.length === 0) {
      // Sin turnos en este comercio no se expone el cliente (privacidad multi-tenant).
      throw new ErrorNoEncontrado('No encontramos ese cliente en tu comercio.');
    }

    return {
      ...aClientePublico(cliente),
      email_verificado: cliente.email_verificado,
      telefono_verificado: cliente.telefono_verificado,
      total_turnos: cliente.turnos.length,
      turnos: cliente.turnos.map((t) => ({
        id: t.id,
        fecha_hora: t.fecha_hora.toISOString(),
        estado: t.estado,
        origen_reserva: t.origen_reserva,
        duracion_minutos: t.servicio.duracion_minutos,
        servicio: { id: t.servicio.id, nombre: t.servicio.nombre },
        profesional: t.profesional,
      })),
    };
  },

  /**
   * Alta de cliente desde el panel (sin OTP).
   * Rechaza si el email ya está registrado (el listado/detalle se usan para clientes existentes).
   */
  async crear(dto: DatosClienteDto): Promise<ClientePublico> {
    const email = normalizarEmail(dto.email);
    const nombre = String(dto.nombre ?? '').trim();
    const apellido = String(dto.apellido ?? '').trim();
    const telefono = String(dto.telefono ?? '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ErrorValidacion('Ingresá un email válido para el cliente.');
    }
    if (!nombre || !apellido || !telefono) {
      throw new ErrorValidacion('Completá nombre, apellido y teléfono del cliente.');
    }

    const existente = await prisma.cliente.findUnique({ where: { email } });
    if (existente) {
      throw new ErrorValidacion('Ya existe un cliente registrado con ese email.');
    }

    const creado = await prisma.cliente.create({
      data: { nombre, apellido, email, telefono },
    });
    return aClientePublico(creado);
  },

  /** Actualiza datos de un cliente que ya tiene turnos en el comercio. */
  async actualizar(
    comercioId: string,
    clienteId: string,
    dto: DatosClienteDto,
  ): Promise<ClientePublico> {
    const tieneTurnos = await prisma.turno.count({
      where: { comercio_id: comercioId, cliente_id: clienteId },
    });
    if (tieneTurnos === 0) {
      throw new ErrorNoEncontrado('No encontramos ese cliente en tu comercio.');
    }

    const nombre = String(dto.nombre ?? '').trim();
    const apellido = String(dto.apellido ?? '').trim();
    const telefono = String(dto.telefono ?? '').trim();
    const email = normalizarEmail(dto.email);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ErrorValidacion('Ingresá un email válido para el cliente.');
    }
    if (!nombre || !apellido || !telefono) {
      throw new ErrorValidacion('Completá nombre, apellido y teléfono del cliente.');
    }

    const emailEnUso = await prisma.cliente.findFirst({
      where: { email, NOT: { id: clienteId } },
    });
    if (emailEnUso) {
      throw new ErrorValidacion('Ya existe otro cliente con ese email.');
    }

    const actualizado = await prisma.cliente.update({
      where: { id: clienteId },
      data: { nombre, apellido, telefono, email },
    });
    return aClientePublico(actualizado);
  },

  /**
   * Devuelve el cliente existente por email o lo crea con los datos recibidos.
   * Los clientes creados desde el panel no requieren OTP.
   */
  async obtenerOCrear(dto: DatosClienteDto): Promise<ClientePublico> {
    const email = normalizarEmail(dto.email);
    const nombre = String(dto.nombre ?? '').trim();
    const apellido = String(dto.apellido ?? '').trim();
    const telefono = String(dto.telefono ?? '').trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ErrorValidacion('Ingresá un email válido para el cliente.');
    }

    const existente = await prisma.cliente.findUnique({ where: { email } });
    if (existente) {
      return aClientePublico(existente);
    }

    if (!nombre || !apellido || !telefono) {
      throw new ErrorValidacion('Completá nombre, apellido y teléfono del cliente.');
    }

    const creado = await prisma.cliente.create({
      data: { nombre, apellido, email, telefono },
    });

    return aClientePublico(creado);
  },
};
