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
  direccion: string;
  nombreAdmin: string;
  email: string;
  password: string;
  telefono: string;
}

export interface DisponibilidadComercio {
  url_disponible: boolean;
  nombre_disponible: boolean;
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

export interface ProfesionalListado {
  id: string;
  nombre: string;
  email: string;
  telefono: string | null;
  activo: boolean;
  email_verificado: boolean;
  matricula_profesional: string | null;
}

export interface InvitacionPendienteListado {
  id: string;
  email: string;
  expiration: string;
}

export interface ListadoProfesionales {
  profesionales: ProfesionalListado[];
  invitaciones_pendientes: InvitacionPendienteListado[];
}
