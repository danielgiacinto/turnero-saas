import { Request, Response } from 'express';

export interface RespuestaApi<T = unknown> {
  mensaje?: string;
  datos?: T;
}

export function respuestaExito<T>(res: Response, datos: T, codigoHttp = 200): Response {
  return res.status(codigoHttp).json({ datos } satisfies RespuestaApi<T>);
}

export function respuestaMensaje(res: Response, mensaje: string, codigoHttp = 200): Response {
  return res.status(codigoHttp).json({ mensaje } satisfies RespuestaApi);
}
