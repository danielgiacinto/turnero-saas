import { Router } from 'express';
import { horarioController } from '../controllers/horario.controller';
import { autenticarStaff, requerirComercio } from '../middlewares/auth.middleware';
import { requerirSuscripcionActiva } from '../middlewares/suscripcion.middleware';

export const horarioRoutes = Router();

// Admin y profesional gestionan horarios; el alcance (propio vs. del equipo) se valida en el servicio.
horarioRoutes.use(autenticarStaff, requerirComercio, requerirSuscripcionActiva);

horarioRoutes.get('/usuario/:usuarioId', horarioController.listar);
horarioRoutes.post('/', horarioController.crear);
horarioRoutes.put('/:id', horarioController.actualizar);
horarioRoutes.delete('/:id', horarioController.eliminar);
