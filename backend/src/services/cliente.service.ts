import { Cliente } from '@prisma/client';
import { prisma } from '../config/prisma';
import { ErrorValidacion } from '../utils/error-app';

export interface ClientePublico {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
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
