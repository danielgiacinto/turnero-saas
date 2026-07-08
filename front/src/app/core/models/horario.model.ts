export interface Horario {
  id: string;
  usuario_id: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

export interface GuardarHorario {
  /** Solo lo usa el admin para gestionar horarios de un profesional. */
  usuario_id?: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}

/** Días ordenados para mostrar (lunes primero); el valor sigue 0=domingo … 6=sábado. */
export const DIAS_SEMANA: { valor: number; etiqueta: string; corto: string }[] = [
  { valor: 1, etiqueta: 'Lunes', corto: 'Lun' },
  { valor: 2, etiqueta: 'Martes', corto: 'Mar' },
  { valor: 3, etiqueta: 'Miércoles', corto: 'Mié' },
  { valor: 4, etiqueta: 'Jueves', corto: 'Jue' },
  { valor: 5, etiqueta: 'Viernes', corto: 'Vie' },
  { valor: 6, etiqueta: 'Sábado', corto: 'Sáb' },
  { valor: 0, etiqueta: 'Domingo', corto: 'Dom' },
];
