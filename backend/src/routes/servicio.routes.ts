import { Router } from 'express';
import { RolUsuario } from '@prisma/client';
import { servicioController } from '../controllers/servicio.controller';
import { autenticarStaff, requerirComercio, requerirRol } from '../middlewares/auth.middleware';
import { requerirSuscripcionActiva } from '../middlewares/suscripcion.middleware';

export const servicioRoutes = Router();

servicioRoutes.use(autenticarStaff, requerirComercio, requerirSuscripcionActiva);

// Cualquier staff del comercio puede ver el listado (profesional incluido).
servicioRoutes.get('/', servicioController.listar);

// Alta y edición: solo el dueño (admin).
servicioRoutes.post('/', requerirRol(RolUsuario.admin), servicioController.crear);
servicioRoutes.put('/:id', requerirRol(RolUsuario.admin), servicioController.actualizar);
