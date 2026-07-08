import { Router } from 'express';
import { RolUsuario } from '@prisma/client';
import { comercioController } from '../controllers/comercio.controller';
import { autenticarStaff, requerirComercio, requerirRol } from '../middlewares/auth.middleware';
import { requerirSuscripcionActiva } from '../middlewares/suscripcion.middleware';

export const comercioRoutes = Router();

comercioRoutes.use(autenticarStaff, requerirComercio);

comercioRoutes.get('/', requerirRol(RolUsuario.admin), comercioController.obtener);
comercioRoutes.put(
  '/',
  requerirRol(RolUsuario.admin),
  requerirSuscripcionActiva,
  comercioController.actualizar,
);
