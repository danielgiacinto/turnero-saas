import { NextFunction, Request, Response } from 'express';
import { RolUsuario } from '@prisma/client';
import { verificarJwt, PayloadJwt } from '../utils/jwt.util';
import { ErrorNoAutorizado } from '../utils/error-app';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      usuario?: PayloadJwt;
    }
  }
}

export function autenticarStaff(req: Request, _res: Response, next: NextFunction): void {
  const cabecera = req.headers.authorization;

  if (!cabecera || !cabecera.startsWith('Bearer ')) {
    next(new ErrorNoAutorizado('Falta el token de autenticación.'));
    return;
  }

  const token = cabecera.slice('Bearer '.length).trim();

  try {
    req.usuario = verificarJwt(token);
    next();
  } catch {
    next(new ErrorNoAutorizado('Token inválido o expirado.'));
  }
}

export function requerirRol(...roles: RolUsuario[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.usuario || !roles.includes(req.usuario.rol)) {
      next(new ErrorNoAutorizado('No tenés permisos para esta acción.'));
      return;
    }
    next();
  };
}

export function requerirComercio(req: Request, _res: Response, next: NextFunction): void {
  if (!req.usuario?.comercio_id) {
    next(new ErrorNoAutorizado('El usuario no está asociado a un comercio.'));
    return;
  }
  next();
}
