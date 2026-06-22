import dotenv from 'dotenv';
import path from 'path';

/**
 * Variables requeridas en backend/.env (no se sube a Git):
 *   PORT, NODE_ENV, DATABASE_URL, DIRECT_URL
 *   JWT_SECRET, JWT_EXPIRES_IN, GOOGLE_CLIENT_ID, FRONTEND_URL
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
  jwtSecret: process.env.JWT_SECRET ?? 'turnero-dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? '',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
  smtpHost: process.env.SMTP_HOST ?? '',
  smtpPort: Number(process.env.SMTP_PORT) || 587,
  smtpUser: process.env.SMTP_USER ?? '',
  smtpPass: process.env.SMTP_PASS ?? '',
  emailFrom: process.env.EMAIL_FROM ?? 'Turnero <no-reply@localhost>',
};

export function smtpEstaConfigurado(): boolean {
  return Boolean(env.smtpHost && env.smtpUser && env.smtpPass);
}

/** Usar en scripts o al iniciar cuando la BD es obligatoria */
export function obtenerDatabaseUrl(): string {
  return requerirEnv('DATABASE_URL', process.env.DATABASE_URL);
}

/** Secreto JWT obligatorio fuera de desarrollo */
export function obtenerJwtSecret(): string {
  if (env.esProduccion) {
    return requerirEnv('JWT_SECRET', process.env.JWT_SECRET);
  }
  return env.jwtSecret;
}
