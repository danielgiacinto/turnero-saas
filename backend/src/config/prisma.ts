import { PrismaClient } from '@prisma/client';
import { env } from './env';

const prismaClienteGlobal = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  prismaClienteGlobal.prisma ??
  new PrismaClient({
    log: env.esDesarrollo ? ['warn', 'error'] : ['error'],
  });

if (!env.esProduccion) {
  prismaClienteGlobal.prisma = prisma;
}
