import { Router } from 'express';
import { turnoController } from '../controllers/turno.controller';
import { autenticarStaff, requerirComercio } from '../middlewares/auth.middleware';
import { requerirSuscripcionActiva } from '../middlewares/suscripcion.middleware';

export const turnoRoutes = Router();

// Agenda del panel: admin gestiona cualquier agenda del comercio; profesional solo la propia
// (el alcance se valida en el servicio).
turnoRoutes.use(autenticarStaff, requerirComercio, requerirSuscripcionActiva);

turnoRoutes.get('/staff', turnoController.listarStaff);
turnoRoutes.get('/disponibilidad', turnoController.disponibilidad);
turnoRoutes.get('/', turnoController.listar);
turnoRoutes.post('/', turnoController.crear);
turnoRoutes.patch('/:id/cancelar', turnoController.cancelar);
