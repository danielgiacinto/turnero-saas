import { TipoRubro } from '@prisma/client';

export interface ActualizarComercioDto {
  nombre: string;
  url: string;
  barrio: string;
  rubro: TipoRubro;
  direccion: string;
}
