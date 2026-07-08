import { NextFunction, Request, Response } from 'express';
import { ContextoSolicitante, horarioService } from '../services/horario.service';
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

function requerirCampos(origen: Record<string, unknown>, campos: string[]): void {
  const faltantes = campos.filter((campo) => {
    const valor = origen[campo];
    return valor === undefined || valor === null || valor === '';
  });
  if (faltantes.length > 0) {
    throw new ErrorValidacion(`Faltan campos obligatorios: ${faltantes.join(', ')}.`);
  }
}

export const horarioController = {
  async listar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ctx = obtenerContexto(req);
      const resultado = await horarioService.listarDeUsuario(ctx, String(req.params.usuarioId));
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async crear(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ctx = obtenerContexto(req);
      requerirCampos(req.body, ['dia_semana', 'hora_inicio', 'hora_fin']);
      const resultado = await horarioService.crear(ctx, req.body);
      respuestaExito(res, resultado, 201);
    } catch (error) {
      next(error);
    }
  },

  async actualizar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ctx = obtenerContexto(req);
      requerirCampos(req.body, ['dia_semana', 'hora_inicio', 'hora_fin']);
      const resultado = await horarioService.actualizar(ctx, String(req.params.id), req.body);
      respuestaExito(res, resultado);
    } catch (error) {
      next(error);
    }
  },

  async eliminar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ctx = obtenerContexto(req);
      const resultado = await horarioService.eliminar(ctx, String(req.params.id));
      respuestaMensaje(res, resultado.mensaje);
    } catch (error) {
      next(error);
    }
  },
};
