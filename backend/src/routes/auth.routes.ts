import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { autenticarStaff, requerirComercio, requerirRol } from '../middlewares/auth.middleware';
import { requerirSuscripcionActiva } from '../middlewares/suscripcion.middleware';
import { RolUsuario } from '@prisma/client';

export const authRoutes = Router();

const staffRoutes = Router();

staffRoutes.get('/disponibilidad-comercio', authController.disponibilidadComercio);
staffRoutes.post('/registro', authController.registro);
staffRoutes.post('/verificar-email', authController.verificarEmail);
staffRoutes.post('/reenviar-codigo', authController.reenviarCodigo);
staffRoutes.post('/login', authController.login);
staffRoutes.post('/google', authController.loginGoogle);
staffRoutes.get('/me', autenticarStaff, authController.perfil);
staffRoutes.get(
  '/profesionales',
  autenticarStaff,
  requerirRol(RolUsuario.admin),
  requerirComercio,
  requerirSuscripcionActiva,
  authController.listarProfesionales,
);
staffRoutes.delete(
  '/profesionales/:id',
  autenticarStaff,
  requerirRol(RolUsuario.admin),
  requerirComercio,
  requerirSuscripcionActiva,
  authController.eliminarProfesional,
);
staffRoutes.post(
  '/invitar',
  autenticarStaff,
  requerirRol(RolUsuario.admin),
  requerirSuscripcionActiva,
  authController.invitar,
);
staffRoutes.delete(
  '/invitaciones/:id',
  autenticarStaff,
  requerirRol(RolUsuario.admin),
  requerirComercio,
  requerirSuscripcionActiva,
  authController.cancelarInvitacion,
);
staffRoutes.get('/invitacion/:token', authController.obtenerInvitacion);
staffRoutes.post('/invitacion/:token/completar', authController.completarInvitacion);

authRoutes.use('/staff', staffRoutes);
