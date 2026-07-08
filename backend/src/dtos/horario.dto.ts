export interface GuardarHorarioDto {
  /** Solo lo usa el admin para gestionar horarios de un profesional. El profesional siempre opera sobre sí mismo. */
  usuario_id?: string;
  dia_semana: number;
  hora_inicio: string;
  hora_fin: string;
}
