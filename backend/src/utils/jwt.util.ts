import jwt, { SignOptions } from 'jsonwebtoken';
import { env, obtenerJwtSecret } from '../config/env';
import { RolUsuario } from '@prisma/client';

export interface PayloadJwt {
  sub: string;
  email: string;
  rol: RolUsuario;
  comercio_id: string | null;
}

export function generarJwt(payload: PayloadJwt): string {
  const opciones: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, obtenerJwtSecret(), opciones);
}

export function verificarJwt(token: string): PayloadJwt {
  return jwt.verify(token, obtenerJwtSecret()) as PayloadJwt;
}
