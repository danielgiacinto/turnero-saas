import { PrismaClient } from '@prisma/client';

const prismaClienteGlobal = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

export const prisma =
  prismaClienteGlobal.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  prismaClienteGlobal.prisma = prisma;
}
