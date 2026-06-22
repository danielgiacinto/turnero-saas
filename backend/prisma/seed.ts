import { PrismaClient, EstadoSuscripcion, RolUsuario, TipoRubro } from '@prisma/client';
import { hashearPassword } from '../src/utils/password.util';
import { env } from '../src/config/env';

const prisma = new PrismaClient();

/**
 * Datos de prueba para desarrollo (idempotente).
 *   - Comercio demo
 *   - Admin/dueño con credenciales + login Google: dgiacinto@cuos.com.ar
 *     (google_id se vincula en el primer login con Google, por coincidencia de email)
 *   - Invitación pendiente para sumar un profesional: danielgiacinto@gmail.com
 */
async function main(): Promise<void> {
  const URL_COMERCIO = 'peluqueria-centro-demo';
  const EMAIL_ADMIN = 'dgiacinto@cuos.com.ar';
  const PASSWORD_ADMIN = 'Demo1234!';
  const EMAIL_INVITADO = 'danielgiacinto@gmail.com';
  const TOKEN_INVITACION = 'invitacion-demo-token-0001';

  const en30Dias = new Date();
  en30Dias.setDate(en30Dias.getDate() + 30);

  const en7Dias = new Date();
  en7Dias.setDate(en7Dias.getDate() + 7);

  const comercio = await prisma.comercio.upsert({
    where: { url: URL_COMERCIO },
    update: {},
    create: {
      nombre: 'Peluquería Centro Demo',
      url: URL_COMERCIO,
      estado_suscripcion: EstadoSuscripcion.activa,
      direccion: 'Av. Siempreviva 742',
      barrio: 'Centro',
      rubro: TipoRubro.barberia,
      fecha_vencimiento: en30Dias,
    },
  });

  const passwordHash = await hashearPassword(PASSWORD_ADMIN);

  const admin = await prisma.usuario.upsert({
    where: { email: EMAIL_ADMIN },
    update: {
      comercio_id: comercio.id,
      rol: RolUsuario.admin,
      password: passwordHash,
      activo: true,
      email_verificado: true,
      email_verificado_fecha: new Date(),
    },
    create: {
      comercio_id: comercio.id,
      nombre: 'Daniel Giacinto',
      email: EMAIL_ADMIN,
      password: passwordHash,
      rol: RolUsuario.admin,
      telefono: null,
      email_verificado: true,
      email_verificado_fecha: new Date(),
    },
  });

  const invitacionExistente = await prisma.invitacion.findUnique({
    where: { token: TOKEN_INVITACION },
  });

  if (!invitacionExistente) {
    await prisma.invitacion.create({
      data: {
        comercio_id: comercio.id,
        email: EMAIL_INVITADO,
        token: TOKEN_INVITACION,
        expiration: en7Dias,
      },
    });
  }

  console.log('Seed completado:');
  console.log(`  Comercio: ${comercio.nombre} (/${comercio.url})`);
  console.log(`  Admin:    ${admin.email} / password: ${PASSWORD_ADMIN}`);
  console.log(`  Invitación pendiente: ${EMAIL_INVITADO}`);
  console.log(`  Link invitación: ${env.frontendUrl}/auth/invitacion/${TOKEN_INVITACION}`);
}

main()
  .catch((error) => {
    console.error('Error en el seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
