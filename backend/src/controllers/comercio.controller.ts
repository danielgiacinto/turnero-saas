import { NextFunction, Request, Response } from 'express';
import { comercioService } from '../services/comercio.service';
import { respuestaExito } from '../utils/respuesta.util';
import { ErrorNoAutorizado, ErrorValidacion } from '../utils/error-app';

function requerirCampos(origen: Record<string, unknown>, campos: string[]): void {
  const faltantes = campos.filter((campo) => {
    const valor = origen[campo];
    return valor === undefined || valor === null || valor === '';
  });
  if (faltantes.length > 0) {
    throw new ErrorValidacion(`Faltan campos obligatorios: ${faltantes.join(', ')}.`);
  }
}

export const comercioController = {
  async obtener(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario?.comercio_id) {
        throw new ErrorNoAutorizado('El usuario no está asociado a un comercio.');
      }
      const resultado = await comercioService.obtenerDelComercio(req.usuario.comercio_id);
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario?.comercio_id) {
        throw new ErrorNoAutorizado('El usuario no está asociado a un comercio.');
      }
      requerirCampos(req.body, ['nombre', 'url', 'barrio', 'rubro', 'direccion']);
      const resultado = await comercioService.actualizarDelComercio(
        req.usuario.comercio_id,
        req.body,
      );
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },
};
