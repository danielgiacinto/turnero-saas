import { crearApp } from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const app = crearApp();

async function iniciarServidor(): Promise<void> {
  app.listen(env.puerto, () => {
    console.log(`API escuchando en http://localhost:${env.puerto}/api`);
  });

  if (!env.databaseUrl) {
    console.warn('DATABASE_URL no configurada. Copiá backend/.env.example a backend/.env');
    return;
  }

  try {
    await prisma.$connect();
    console.log('Conexión a PostgreSQL establecida.');
  } catch (error) {
    console.warn('No se pudo conectar a PostgreSQL. El endpoint /api/salud sigue disponible.');
    console.warn(error);
  }
}

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

iniciarServidor();
