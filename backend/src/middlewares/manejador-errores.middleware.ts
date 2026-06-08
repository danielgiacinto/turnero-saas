import { NextFunction, Request, Response } from 'express';
import { ErrorApp } from '../utils/error-app';
import { env } from '../config/env';

export function manejadorErrores(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ErrorApp) {
    res.status(error.codigoHttp).json({
      mensaje: error.mensaje,
      ...(error.detalle !== undefined && { detalle: error.detalle }),
    });
    return;
  }

  console.error('[Error inesperado]', error);

  res.status(500).json({
    mensaje: 'Error inesperado.',
    ...(!env.esProduccion && {
      detalle: error instanceof Error ? error.message : String(error),
    }),
  });
}
