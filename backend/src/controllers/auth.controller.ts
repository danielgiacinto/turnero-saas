import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
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

export const authController = {
  async registro(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      requerirCampos(req.body, [
        'nombreComercio',
        'url',
        'barrio',
        'rubro',
        'nombreAdmin',
        'email',
        'password',
      ]);
      const resultado = await authService.registrarComercioConAdmin(req.body);
      respuestaExito(res, resultado, 201);
    } catch (error) {
      next(error);
    }
  },

  async verificarEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      requerirCampos(req.body, ['email', 'codigo']);
      const resultado = await authService.verificarEmailStaff(req.body);
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async reenviarCodigo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      requerirCampos(req.body, ['email']);
      const resultado = await authService.reenviarCodigoStaff(req.body);
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      requerirCampos(req.body, ['email', 'password']);
      const resultado = await authService.loginCredenciales(req.body);
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async loginGoogle(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      requerirCampos(req.body, ['idToken']);
      const resultado = await authService.loginGoogle(req.body);
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async perfil(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.usuario) {
        throw new ErrorNoAutorizado('Sesión inválida.');
      }
      const sesion = await authService.obtenerSesion(req.usuario.sub);
      respuestaExito(res, sesion);
    } catch (error) {
      next(error);
    }
  },

  async invitar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      requerirCampos(req.body, ['email']);
      if (!req.usuario?.comercio_id) {
        throw new ErrorNoAutorizado('El usuario no está asociado a un comercio.');
      }
      const resultado = await authService.crearInvitacion(req.usuario.comercio_id, req.body);
      respuestaExito(res, resultado, 201);
    } catch (error) {
      next(error);
    }
  },

  async obtenerInvitacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const resultado = await authService.obtenerInvitacionPorToken(String(req.params.token));
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async completarInvitacion(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      requerirCampos(req.body, ['nombre']);
      const resultado = await authService.completarInvitacion(String(req.params.token), req.body);
      respuestaExito(res, resultado, 201);
    } catch (error) {
      next(error);
    }
  },
};
