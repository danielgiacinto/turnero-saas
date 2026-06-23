import { TipoRubro } from '@prisma/client';

export interface RegistroComercioDto {
  nombreComercio: string;
  url: string;
  barrio: string;
  rubro: TipoRubro;
  direccion: string;
  nombreAdmin: string;
  email: string;
  password: string;
  telefono: string;
}

export interface DisponibilidadComercioDto {
  url_disponible: boolean;
  nombre_disponible: boolean;
}

export interface LoginCredencialesDto {
  email: string;
  password: string;
}

export interface LoginGoogleDto {
  idToken: string;
}

export interface VerificarEmailDto {
  email: string;
  codigo: string;
}

export interface ReenviarCodigoDto {
  email: string;
}

export interface InvitarStaffDto {
  email: string;
}

export interface CompletarInvitacionDto {
  nombre: string;
  password?: string;
  idToken?: string;
  telefono?: string;
}
