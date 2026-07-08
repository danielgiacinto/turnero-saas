export type TipoRubro =
  | 'estetica'
  | 'barberia'
  | 'salud_medicina'
  | 'psicologia'
  | 'nutricion'
  | 'medicina';

export type EstadoSuscripcion = 'pendiente' | 'activa' | 'suspendida' | 'cancelada';

export interface Comercio {
  id: string;
  nombre: string;
  url: string;
  estado_suscripcion: EstadoSuscripcion;
  direccion: string | null;
  barrio: string;
  rubro: TipoRubro;
  fecha_vencimiento: string;
  created_at: string;
  mp_preapproval_id: string | null;
  logo_url: string | null;
}

/** Datos editables del comercio en el panel de configuración. */
export interface ComercioDetalle {
  id: string;
  nombre: string;
  url: string;
  barrio: string;
  rubro: TipoRubro;
  direccion: string | null;
  estado_suscripcion: EstadoSuscripcion;
  logo_url: string | null;
  fecha_vencimiento: string;
}

export interface ActualizarComercio {
  nombre: string;
  url: string;
  barrio: string;
  rubro: TipoRubro;
  direccion: string;
}

export const RUBROS_COMERCIO: { valor: TipoRubro; etiqueta: string }[] = [
  { valor: 'barberia', etiqueta: 'Barbería' },
  { valor: 'estetica', etiqueta: 'Estética' },
  { valor: 'salud_medicina', etiqueta: 'Salud / Medicina' },
  { valor: 'psicologia', etiqueta: 'Psicología' },
  { valor: 'nutricion', etiqueta: 'Nutrición' },
  { valor: 'medicina', etiqueta: 'Medicina' },
];

