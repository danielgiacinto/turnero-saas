import { NextFunction, Request, Response } from 'express';
import { ErrorNoEncontrado } from '../utils/error-app';

export function rutaNoEncontrada(_req: Request, _res: Response, next: NextFunction): void {
  next(new ErrorNoEncontrado('Ruta no encontrada.'));
}
