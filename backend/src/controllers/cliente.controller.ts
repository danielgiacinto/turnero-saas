import { NextFunction, Request, Response } from 'express';
import { clienteService } from '../services/cliente.service';
import { respuestaExito } from '../utils/respuesta.util';
import { ErrorValidacion } from '../utils/error-app';

export const clienteController = {
  async buscar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const email = String(req.query.email ?? '');
      if (!email) {
        throw new ErrorValidacion('Indicá el email a buscar.');
      }
      const resultado = await clienteService.buscarPorEmail(email);
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },
};
