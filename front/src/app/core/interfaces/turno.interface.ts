export type EstadoTurno = 'pendiente' | 'completo' | 'cancelado' | 'inasistencia';

export interface Turno {
  id: string;
  comercio_id: string;
  cliente_id: string;
  profesional_id: string;
  servicio_id: string;
  link_reunion: string | null;
  estado: EstadoTurno;
  fecha_hora: string;
}
