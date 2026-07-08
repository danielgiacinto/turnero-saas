export type ModalidadServicio = 'presencial' | 'online';

export interface Servicio {
  id: string;
  nombre: string;
  duracion_minutos: number;
  precio: number;
  modalidad: ModalidadServicio;
}

export interface GuardarServicio {
  nombre: string;
  duracion_minutos: number;
  precio: number;
  modalidad: ModalidadServicio;
}

export const MODALIDADES_SERVICIO: {
  valor: ModalidadServicio;
  etiqueta: string;
  icono: string;
}[] = [
  { valor: 'presencial', etiqueta: 'Presencial', icono: 'bi-shop-window' },
  { valor: 'online', etiqueta: 'Online', icono: 'bi-camera-video' },
];
