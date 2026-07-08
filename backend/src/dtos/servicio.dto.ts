import { ModalidadServicio } from '@prisma/client';

export interface GuardarServicioDto {
  nombre: string;
  duracion_minutos: number;
  precio: number;
  modalidad: ModalidadServicio;
}
