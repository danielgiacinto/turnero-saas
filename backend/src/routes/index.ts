import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { comercioRoutes } from './comercio.routes';
import { servicioRoutes } from './servicio.routes';
import { saludRoutes } from './salud.routes';
import { turnoRoutes } from './turno.routes';

export const routes = Router();

routes.use('/salud', saludRoutes);
routes.use('/auth', authRoutes);
routes.use('/comercio', comercioRoutes);
routes.use('/servicios', servicioRoutes);
routes.use('/turnos', turnoRoutes);
