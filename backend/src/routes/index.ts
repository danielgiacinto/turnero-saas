import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { saludRoutes } from './salud.routes';
import { turnoRoutes } from './turno.routes';

export const routes = Router();

routes.use('/salud', saludRoutes);
routes.use('/auth', authRoutes);
routes.use('/turnos', turnoRoutes);
