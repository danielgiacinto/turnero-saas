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
