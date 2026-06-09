import dotenv from 'dotenv';
import path from 'path';

/**
 * Variables requeridas en backend/.env (no se sube a Git):
 *   PORT, NODE_ENV, DATABASE_URL, DIRECT_URL
 * Ver schema.prisma → datasource db para detalle de conexión Supabase.
 */
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requerirEnv(nombre: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre} en backend/.env`);
  }
  return valor;
}

const entorno = process.env.NODE_ENV ?? 'development';

export const env = {
  puerto: Number(process.env.PORT) || 3000,
  entorno,
  esProduccion: entorno === 'production',
  esDesarrollo: entorno !== 'production',
  databaseUrl: process.env.DATABASE_URL ?? '',
};

/** Usar en scripts o al iniciar cuando la BD es obligatoria */
export function obtenerDatabaseUrl(): string {
  return requerirEnv('DATABASE_URL', process.env.DATABASE_URL);
}
