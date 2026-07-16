import { NextFunction, Request, Response } from 'express';
import { clienteService } from '../services/cliente.service';
import { respuestaExito } from '../utils/respuesta.util';
import { ErrorNoAutorizado, ErrorValidacion } from '../utils/error-app';

function requerirComercioId(req: Request): string {
  if (!req.usuario?.comercio_id) {
    throw new ErrorNoAutorizado('El usuario no está asociado a un comercio.');
  }
  return req.usuario.comercio_id;
}

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

  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comercioId = requerirComercioId(req);
      const busqueda = req.query.q ? String(req.query.q) : undefined;
      const resultado = await clienteService.listarDelComercio(comercioId, busqueda);
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async obtener(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comercioId = requerirComercioId(req);
      const resultado = await clienteService.obtenerDetalle(comercioId, String(req.params.id));
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      requerirComercioId(req);
      const { nombre, apellido, email, telefono } = req.body ?? {};
      if (!nombre || !apellido || !email || !telefono) {
        throw new ErrorValidacion('Completá nombre, apellido, email y teléfono.');
      }
      const resultado = await clienteService.crear(req.body);
      respuestaExito(res, resultado, 201);
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const comercioId = requerirComercioId(req);
      const { nombre, apellido, email, telefono } = req.body ?? {};
      if (!nombre || !apellido || !email || !telefono) {
        throw new ErrorValidacion('Completá nombre, apellido, email y teléfono.');
      }
      const resultado = await clienteService.actualizar(
        comercioId,
        String(req.params.id),
        req.body,
      );
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },
};
