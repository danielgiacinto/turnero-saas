import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { autenticarStaff, requerirRol } from '../middlewares/auth.middleware';
import { RolUsuario } from '@prisma/client';

export const authRoutes = Router();

const staffRoutes = Router();

staffRoutes.post('/registro', authController.registro);
staffRoutes.post('/verificar-email', authController.verificarEmail);
staffRoutes.post('/reenviar-codigo', authController.reenviarCodigo);
staffRoutes.post('/login', authController.login);
staffRoutes.post('/google', authController.loginGoogle);
staffRoutes.get('/me', autenticarStaff, authController.perfil);
staffRoutes.post('/invitar', autenticarStaff, requerirRol(RolUsuario.admin), authController.invitar);
staffRoutes.get('/invitacion/:token', authController.obtenerInvitacion);
staffRoutes.post('/invitacion/:token/completar', authController.completarInvitacion);

authRoutes.use('/staff', staffRoutes);
