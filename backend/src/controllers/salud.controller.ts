import { Request, Response } from 'express';
import { respuestaExito } from '../utils/respuesta.util';

export const saludController = {
  obtenerEstado(_req: Request, res: Response): Response {
    return respuestaExito(res, {
      estado: 'ok',
      timestamp: new Date().toISOString(),
    });
  },
};
