import { Router } from 'express';
import { saludController } from '../controllers/salud.controller';

export const saludRoutes = Router();

saludRoutes.get('/', saludController.obtenerEstado);
