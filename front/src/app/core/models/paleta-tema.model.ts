export type IdPaletaTema = 'lima' | 'naranja' | 'violeta';

export type ModoTema = 'claro' | 'oscuro';

export interface OpcionPaleta {
  id: IdPaletaTema;
  nombre: string;
  descripcion: string;
  colorAcento: string;
  colorFondoOscuro: string;
}

export const PALETAS_DISPONIBLES: OpcionPaleta[] = [
  {
    id: 'lima',
    nombre: 'Negro & lima eléctrico',
    descripcion: 'Premium moderno — barberías urbanas, estética tech',
    colorAcento: '#c8f135',
    colorFondoOscuro: '#0a0a0a',
  },
  {
    id: 'naranja',
    nombre: 'Negro & naranja quemado',
    descripcion: 'Cálido y elegante — barberías, estética, salud',
    colorAcento: '#d95f1a',
    colorFondoOscuro: '#080808',
  },
  {
    id: 'violeta',
    nombre: 'Negro & violeta',
    descripcion: 'Calma y sofisticación — psicología, nutrición',
    colorAcento: '#7c5cbf',
    colorFondoOscuro: '#090910',
  },
];

export const PALETA_PREDETERMINADA: IdPaletaTema = 'lima';
export const MODO_PREDETERMINADO_PANEL: ModoTema = 'oscuro';

export const CLAVE_STORAGE_PALETA = 'turnero-panel-paleta';
export const CLAVE_STORAGE_MODO = 'turnero-panel-modo';
