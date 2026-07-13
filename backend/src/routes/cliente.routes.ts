import { Router } from 'express';
import { clienteController } from '../controllers/cliente.controller';
import { autenticarStaff, requerirComercio } from '../middlewares/auth.middleware';
import { requerirSuscripcionActiva } from '../middlewares/suscripcion.middleware';

export const clienteRoutes = Router();

clienteRoutes.use(autenticarStaff, requerirComercio, requerirSuscripcionActiva);

clienteRoutes.get('/buscar', clienteController.buscar);
