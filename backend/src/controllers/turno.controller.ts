import { NextFunction, Request, Response } from 'express';
import { ContextoSolicitante, turnoService } from '../services/turno.service';
import { respuestaExito, respuestaMensaje } from '../utils/respuesta.util';
import { ErrorNoAutorizado, ErrorValidacion } from '../utils/error-app';

function obtenerContexto(req: Request): ContextoSolicitante {
  if (!req.usuario?.comercio_id) {
    throw new ErrorNoAutorizado('El usuario no está asociado a un comercio.');
  }
  return {
    usuarioId: req.usuario.sub,
    rol: req.usuario.rol,
    comercioId: req.usuario.comercio_id,
  };
}

export const turnoController = {
  async listarStaff(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ctx = obtenerContexto(req);
      const resultado = await turnoService.listarStaffAtencion(ctx);
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ctx = obtenerContexto(req);
      const fecha = String(req.query.fecha ?? '');
      const desde = String(req.query.desde ?? '') || fecha;
      const hasta = String(req.query.hasta ?? '') || desde;
      if (!desde) {
        throw new ErrorValidacion('Indicá la fecha o el rango de la agenda (YYYY-MM-DD).');
      }
      const profesionalId = req.query.profesional_id
        ? String(req.query.profesional_id)
        : undefined;
      const resultado = await turnoService.listarRango(ctx, { profesionalId, desde, hasta });
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async disponibilidad(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ctx = obtenerContexto(req);
      const fecha = String(req.query.fecha ?? '');
      const servicioId = String(req.query.servicio_id ?? '');
      if (!fecha || !servicioId) {
        throw new ErrorValidacion('Indicá servicio y fecha para consultar disponibilidad.');
      }
      const profesionalId = req.query.profesional_id
        ? String(req.query.profesional_id)
        : undefined;
      const resultado = await turnoService.disponibilidad(ctx, {
        profesionalId,
        servicioId,
        fecha,
      });
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ctx = obtenerContexto(req);
      const { servicio_id, fecha, hora, cliente } = req.body ?? {};
      if (!servicio_id || !fecha || !hora || !cliente?.email) {
        throw new ErrorValidacion('Faltan datos obligatorios del turno o del cliente.');
      }
      const resultado = await turnoService.crear(ctx, req.body);
      respuestaExito(res, resultado, 201);
    } catch (error) {
      next(error);
    }
  },

  async cancelar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ctx = obtenerContexto(req);
      const resultado = await turnoService.cancelar(ctx, String(req.params.id));
      respuestaMensaje(res, resultado.mensaje);
    } catch (error) {
      next(error);
    }
  },
};
