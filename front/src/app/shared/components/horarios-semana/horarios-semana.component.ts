import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { DIAS_SEMANA, Horario } from '../../../core/models/horario.model';
import { HorarioService } from '../../../core/services/horario.service';
import { controlInvalido, mensajeValidacion } from '../../utils/validacion-formulario.util';

interface DiaConHorarios {
  valor: number;
  etiqueta: string;
  horarios: Horario[];
}

type CampoHorario = 'dia_semana' | 'hora_inicio' | 'hora_fin';

@Component({
  selector: 'app-horarios-semana',
  imports: [ReactiveFormsModule],
  templateUrl: './horarios-semana.component.html',
  styleUrl: './horarios-semana.component.scss',
})
export class HorariosSemanaComponent {
  private readonly horarioService = inject(HorarioService);
  private readonly fb = inject(FormBuilder);

  readonly usuarioId = input.required<string>();
  /** Si es false, solo se listan los horarios (sin alta/edición/borrado). */
  readonly editable = input(true);

  readonly dias = DIAS_SEMANA;

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly horarios = signal<Horario[]>([]);

  readonly modalAbierto = signal(false);
  readonly horarioEnEdicion = signal<Horario | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);
  readonly formularioEnviado = signal(false);

  readonly confirmacionBorrado = signal<Horario | null>(null);
  readonly borrando = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    dia_semana: [1, Validators.required],
    hora_inicio: ['09:00', Validators.required],
    hora_fin: ['13:00', Validators.required],
  });

  readonly diasConHorarios = computed<DiaConHorarios[]>(() => {
    const porDia = this.horarios();
    return this.dias.map((dia) => ({
      valor: dia.valor,
      etiqueta: dia.etiqueta,
      horarios: porDia
        .filter((h) => h.dia_semana === dia.valor)
        .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio)),
    }));
  });

  readonly hayHorarios = computed(() => this.horarios().length > 0);

  constructor() {
    effect(() => {
      const id = this.usuarioId();
      if (id) {
        this.cargar(id);
      }
    });
  }

  private cargar(usuarioId: string): void {
    this.cargando.set(true);
    this.error.set(null);

    this.horarioService.listarDeUsuario(usuarioId).subscribe({
      next: (datos) => {
        this.horarios.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudieron cargar los horarios.');
        this.cargando.set(false);
      },
    });
  }

  recargar(): void {
    this.cargar(this.usuarioId());
  }

  abrirCreacion(diaSemana?: number): void {
    if (!this.editable()) {
      return;
    }
    this.horarioEnEdicion.set(null);
    this.errorFormulario.set(null);
    this.formularioEnviado.set(false);
    this.formulario.reset({
      dia_semana: diaSemana ?? 1,
      hora_inicio: '09:00',
      hora_fin: '13:00',
    });
    this.modalAbierto.set(true);
  }

  abrirEdicion(horario: Horario): void {
    if (!this.editable()) {
      return;
    }
    this.horarioEnEdicion.set(horario);
    this.errorFormulario.set(null);
    this.formularioEnviado.set(false);
    this.formulario.reset({
      dia_semana: horario.dia_semana,
      hora_inicio: horario.hora_inicio,
      hora_fin: horario.hora_fin,
    });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }
    this.modalAbierto.set(false);
    this.horarioEnEdicion.set(null);
  }

  esInvalido(campo: CampoHorario): boolean {
    return controlInvalido(this.formulario.get(campo), this.formularioEnviado());
  }

  mensaje(campo: CampoHorario, etiqueta: string): string {
    return mensajeValidacion(this.formulario.get(campo), etiqueta);
  }

  tituloModal(): string {
    return this.horarioEnEdicion() ? 'Editar horario' : 'Nuevo horario';
  }

  guardar(): void {
    this.formularioEnviado.set(true);
    this.errorFormulario.set(null);

    if (this.formulario.invalid) {
      return;
    }

    const datos = this.formulario.getRawValue();
    const diaSemana = Number(datos.dia_semana);

    if (datos.hora_inicio >= datos.hora_fin) {
      this.errorFormulario.set('La hora de fin debe ser posterior a la de inicio.');
      return;
    }

    this.guardando.set(true);
    const enEdicion = this.horarioEnEdicion();

    const peticion = enEdicion
      ? this.horarioService.actualizar(enEdicion.id, {
          dia_semana: diaSemana,
          hora_inicio: datos.hora_inicio,
          hora_fin: datos.hora_fin,
        })
      : this.horarioService.crear({
          usuario_id: this.usuarioId(),
          dia_semana: diaSemana,
          hora_inicio: datos.hora_inicio,
          hora_fin: datos.hora_fin,
        });

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.horarioEnEdicion.set(null);
        this.recargar();
      },
      error: (err) => {
        this.errorFormulario.set(err?.error?.mensaje ?? 'No se pudo guardar el horario.');
        this.guardando.set(false);
      },
    });
  }

  abrirConfirmacionBorrado(horario: Horario): void {
    if (!this.editable()) {
      return;
    }
    this.confirmacionBorrado.set(horario);
  }

  cerrarConfirmacionBorrado(): void {
    if (this.borrando()) {
      return;
    }
    this.confirmacionBorrado.set(null);
  }

  confirmarBorrado(): void {
    const horario = this.confirmacionBorrado();
    if (!horario) {
      return;
    }

    this.borrando.set(true);
    this.horarioService.eliminar(horario.id).subscribe({
      next: () => {
        this.borrando.set(false);
        this.confirmacionBorrado.set(null);
        this.recargar();
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo eliminar el horario.');
        this.borrando.set(false);
        this.confirmacionBorrado.set(null);
      },
    });
  }
}
