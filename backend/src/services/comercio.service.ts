import { Comercio, TipoRubro } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ActualizarComercioDto } from '../dtos/comercio.dto';
import { ErrorNoEncontrado, ErrorValidacion } from '../utils/error-app';

const RUBROS_VALIDOS = new Set<string>(Object.values(TipoRubro));

export interface ComercioDetalle {
  id: string;
  nombre: string;
  url: string;
  barrio: string;
  rubro: TipoRubro;
  direccion: string | null;
  estado_suscripcion: Comercio['estado_suscripcion'];
  logo_url: string | null;
  fecha_vencimiento: Date;
}

function aComercioDetalle(comercio: Comercio): ComercioDetalle {
  return {
    id: comercio.id,
    nombre: comercio.nombre,
    url: comercio.url,
    barrio: comercio.barrio,
    rubro: comercio.rubro,
    direccion: comercio.direccion,
    estado_suscripcion: comercio.estado_suscripcion,
    logo_url: comercio.logo_url,
    fecha_vencimiento: comercio.fecha_vencimiento,
  };
}

function normalizarUrl(url: string): string {
  return url.trim().toLowerCase();
}

export const comercioService = {
  async obtenerDelComercio(comercioId: string): Promise<ComercioDetalle> {
    const comercio = await prisma.comercio.findUnique({ where: { id: comercioId } });
    if (!comercio) {
      throw new ErrorNoEncontrado('Comercio no encontrado.');
    }
    return aComercioDetalle(comercio);
  },

  async actualizarDelComercio(
    comercioId: string,
    dto: ActualizarComercioDto,
  ): Promise<ComercioDetalle> {
    const nombre = dto.nombre.trim();
    const url = normalizarUrl(dto.url);
    const barrio = dto.barrio.trim();
    const direccion = dto.direccion.trim();
    const rubro = dto.rubro;

    if (!nombre || !url || !barrio || !direccion) {
      throw new ErrorValidacion('Completá todos los campos obligatorios.');
    }

    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(url)) {
      throw new ErrorValidacion(
        'La URL solo puede tener minúsculas, números y guiones (ej. mi-comercio).',
      );
    }

    if (!RUBROS_VALIDOS.has(rubro)) {
      throw new ErrorValidacion('El rubro indicado no es válido.');
    }

    const urlEnUso = await prisma.comercio.findFirst({
      where: { url, NOT: { id: comercioId } },
    });
    if (urlEnUso) {
      throw new ErrorValidacion('La URL del comercio ya está en uso.');
    }

    const nombreEnUso = await prisma.comercio.findFirst({
      where: {
        nombre: { equals: nombre, mode: 'insensitive' },
        NOT: { id: comercioId },
      },
    });
    if (nombreEnUso) {
      throw new ErrorValidacion('Ya existe un comercio registrado con ese nombre.');
    }

    const actualizado = await prisma.comercio.update({
      where: { id: comercioId },
      data: { nombre, url, barrio, rubro, direccion },
    });

    return aComercioDetalle(actualizado);
  },
};
