import dotenv from 'dotenv';

dotenv.config();

export const env = {
  puerto: Number(process.env.PORT) || 3000,
  entorno: process.env.NODE_ENV ?? 'development',
  esProduccion: process.env.NODE_ENV === 'production',
  databaseUrl: process.env.DATABASE_URL ?? '',
};
