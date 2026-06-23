import './inicializar-zona-horaria';
import { PrismaClient } from '@prisma/client';

import { env } from './env';
import { ZONA_HORARIA } from './inicializar-zona-horaria';
import { agregarZonaHorariaUrl } from '../utils/url-base-datos.util';

const prismaClienteGlobal = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const databaseUrl = agregarZonaHorariaUrl(env.databaseUrl, ZONA_HORARIA);

export const prisma =
  prismaClienteGlobal.prisma ??
  new PrismaClient({
    datasources: databaseUrl ? { db: { url: databaseUrl } } : undefined,
    log: env.esDesarrollo ? ['warn', 'error'] : ['error'],
  });

if (!env.esProduccion) {
  prismaClienteGlobal.prisma = prisma;
}
