export type RolUsuario = 'super_admin' | 'admin' | 'profesional';

export interface UsuarioSesion {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  comercio_id: string | null;
}

export interface ComercioSesion {
  id: string;
  nombre: string;
  url: string;
}

export interface ResultadoAutenticacion {
  token: string;
  usuario: UsuarioSesion;
  comercio: ComercioSesion | null;
}

export interface ResultadoRegistroPendiente {
  requiere_verificacion: true;
  email: string;
  mensaje: string;
  codigo_desarrollo?: string;
}

export interface ResultadoReenvioCodigo {
  email: string;
  mensaje: string;
  codigo_desarrollo?: string;
}

export interface Sesion {
  usuario: UsuarioSesion;
  comercio: ComercioSesion | null;
}

export interface RegistroComercio {
  nombreComercio: string;
  url: string;
  barrio: string;
  rubro: string;
  direccion?: string;
  nombreAdmin: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface InvitacionInfo {
  email: string;
  comercio: ComercioSesion;
}

export interface CompletarInvitacion {
  nombre: string;
  password?: string;
  idToken?: string;
  telefono?: string;
}
