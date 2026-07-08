import { ModalidadServicio, Servicio } from '@prisma/client';
import { prisma } from '../config/prisma';
import { GuardarServicioDto } from '../dtos/servicio.dto';
import { ErrorNoEncontrado, ErrorValidacion } from '../utils/error-app';

const MODALIDADES_VALIDAS = new Set<string>(Object.values(ModalidadServicio));

export interface ServicioDetalle {
  id: string;
  nombre: string;
  duracion_minutos: number;
  precio: number;
  modalidad: ModalidadServicio;
}

function aServicioDetalle(servicio: Servicio): ServicioDetalle {
  return {
    id: servicio.id,
    nombre: servicio.nombre,
    duracion_minutos: servicio.duracion_minutos,
    precio: Number(servicio.precio),
    modalidad: servicio.modalidad,
  };
}

function normalizarDatos(dto: GuardarServicioDto): {
  nombre: string;
  duracion_minutos: number;
  precio: number;
  modalidad: ModalidadServicio;
} {
  const nombre = String(dto.nombre ?? '').trim();
  const duracion_minutos = Number(dto.duracion_minutos);
  const precio = Number(dto.precio);
  const modalidad = dto.modalidad;

  if (!nombre) {
    throw new ErrorValidacion('El nombre del servicio es obligatorio.');
  }

  if (!Number.isInteger(duracion_minutos) || duracion_minutos <= 0) {
    throw new ErrorValidacion('La duración debe ser un número de minutos mayor a cero.');
  }

  if (!Number.isFinite(precio) || precio < 0) {
    throw new ErrorValidacion('El precio debe ser un número mayor o igual a cero.');
  }

  if (!MODALIDADES_VALIDAS.has(modalidad)) {
    throw new ErrorValidacion('La modalidad indicada no es válida.');
  }

  return { nombre, duracion_minutos, precio, modalidad };
}

async function assertNombreDisponible(
  comercioId: string,
  nombre: string,
  excluirServicioId?: string,
): Promise<void> {
  const existente = await prisma.servicio.findFirst({
    where: {
      comercio_id: comercioId,
      nombre: { equals: nombre, mode: 'insensitive' },
      ...(excluirServicioId ? { NOT: { id: excluirServicioId } } : {}),
    },
  });
  if (existente) {
    throw new ErrorValidacion('Ya existe un servicio con ese nombre en tu comercio.');
  }
}

export const servicioService = {
  async listarDelComercio(comercioId: string): Promise<ServicioDetalle[]> {
    const servicios = await prisma.servicio.findMany({
      where: { comercio_id: comercioId },
      orderBy: { nombre: 'asc' },
    });
    return servicios.map(aServicioDetalle);
  },

  async crearEnComercio(comercioId: string, dto: GuardarServicioDto): Promise<ServicioDetalle> {
    const datos = normalizarDatos(dto);
    await assertNombreDisponible(comercioId, datos.nombre);

    const creado = await prisma.servicio.create({
      data: { comercio_id: comercioId, ...datos },
    });

    return aServicioDetalle(creado);
  },

  async actualizarEnComercio(
    comercioId: string,
    servicioId: string,
    dto: GuardarServicioDto,
  ): Promise<ServicioDetalle> {
    const servicio = await prisma.servicio.findFirst({
      where: { id: servicioId, comercio_id: comercioId },
    });
    if (!servicio) {
      throw new ErrorNoEncontrado('No encontramos ese servicio en tu comercio.');
    }

    const datos = normalizarDatos(dto);
    await assertNombreDisponible(comercioId, datos.nombre, servicioId);

    const actualizado = await prisma.servicio.update({
      where: { id: servicioId },
      data: datos,
    });

    return aServicioDetalle(actualizado);
  },
};
