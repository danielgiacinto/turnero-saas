import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  InvitacionPendienteListado,
  ProfesionalListado,
} from '../../../core/models/usuario.model';
import { AuthService } from '../../../core/services/auth.service';
import { HorariosSemanaComponent } from '../../../shared/components/horarios-semana/horarios-semana.component';
import {
  controlInvalido,
  mensajeValidacion,
} from '../../../shared/utils/validacion-formulario.util';

type TipoBorrado = 'profesional' | 'invitacion';

interface ConfirmacionBorrado {
  tipo: TipoBorrado;
  id: string;
  etiqueta: string;
}

@Component({
  selector: 'app-panel-profesionales',
  imports: [ReactiveFormsModule, DatePipe, HorariosSemanaComponent],
  templateUrl: './profesionales.component.html',
  styleUrl: './profesionales.component.scss',
})
export class PanelProfesionalesComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly cargandoListado = signal(true);
  readonly errorListado = signal<string | null>(null);
  readonly profesionales = signal<ProfesionalListado[]>([]);
  readonly invitacionesPendientes = signal<InvitacionPendienteListado[]>([]);

  readonly invitacionCargando = signal(false);
  readonly invitacionError = signal<string | null>(null);
  readonly invitacionExito = signal<string | null>(null);
  readonly formularioInvitacionEnviado = signal(false);

  readonly modalConfirmacion = signal<ConfirmacionBorrado | null>(null);
  readonly borradoCargando = signal(false);
  readonly borradoError = signal<string | null>(null);
  readonly listadoExito = signal<string | null>(null);

  readonly profesionalesExpandidos = signal<Set<string>>(new Set());

  readonly formularioInvitacion = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  ngOnInit(): void {
    this.cargarListado();
  }

  cargarListado(): void {
    this.cargandoListado.set(true);
    this.errorListado.set(null);

    this.auth.listarProfesionales().subscribe({
      next: (datos) => {
        this.profesionales.set(datos.profesionales);
        this.invitacionesPendientes.set(datos.invitaciones_pendientes);
        this.cargandoListado.set(false);
      },
      error: (err) => {
        this.errorListado.set(err?.error?.mensaje ?? 'No se pudo cargar el listado.');
        this.cargandoListado.set(false);
      },
    });
  }

  esInvalidoInvitacion(): boolean {
    return controlInvalido(
      this.formularioInvitacion.get('email'),
      this.formularioInvitacionEnviado(),
    );
  }

  mensajeInvitacion(): string {
    return mensajeValidacion(this.formularioInvitacion.get('email'), 'El email');
  }

  enviarInvitacion(): void {
    this.formularioInvitacionEnviado.set(true);
    this.invitacionError.set(null);
    this.invitacionExito.set(null);

    if (this.formularioInvitacion.invalid) {
      return;
    }

    const { email } = this.formularioInvitacion.getRawValue();
    this.invitacionCargando.set(true);

    this.auth.invitar(email).subscribe({
      next: (res) => {
        this.invitacionExito.set(res.mensaje);
        this.formularioInvitacion.reset();
        this.formularioInvitacionEnviado.set(false);
        this.invitacionCargando.set(false);
        this.cargarListado();
      },
      error: (err) => {
        this.invitacionError.set(err?.error?.mensaje ?? 'No se pudo enviar la invitación.');
        this.invitacionCargando.set(false);
      },
    });
  }

  estaExpandido(id: string): boolean {
    return this.profesionalesExpandidos().has(id);
  }

  alternarHorarios(id: string): void {
    this.profesionalesExpandidos.update((actual) => {
      const copia = new Set(actual);
      if (copia.has(id)) {
        copia.delete(id);
      } else {
        copia.add(id);
      }
      return copia;
    });
  }

  abrirConfirmacionEliminarProfesional(profesional: ProfesionalListado): void {
    this.borradoError.set(null);
    this.modalConfirmacion.set({
      tipo: 'profesional',
      id: profesional.id,
      etiqueta: profesional.nombre,
    });
  }

  abrirConfirmacionCancelarInvitacion(invitacion: InvitacionPendienteListado): void {
    this.borradoError.set(null);
    this.modalConfirmacion.set({
      tipo: 'invitacion',
      id: invitacion.id,
      etiqueta: invitacion.email,
    });
  }

  cerrarModal(): void {
    if (this.borradoCargando()) {
      return;
    }
    this.modalConfirmacion.set(null);
    this.borradoError.set(null);
  }

  confirmarBorrado(): void {
    const modal = this.modalConfirmacion();
    if (!modal) {
      return;
    }

    this.borradoCargando.set(true);
    this.borradoError.set(null);

    const peticion =
      modal.tipo === 'profesional'
        ? this.auth.eliminarProfesional(modal.id)
        : this.auth.cancelarInvitacion(modal.id);

    peticion.subscribe({
      next: (res) => {
        this.listadoExito.set(res.mensaje);
        this.modalConfirmacion.set(null);
        this.borradoCargando.set(false);
        this.cargarListado();
        setTimeout(() => this.listadoExito.set(null), 4000);
      },
      error: (err) => {
        this.borradoError.set(err?.error?.mensaje ?? 'No se pudo completar la operación.');
        this.borradoCargando.set(false);
      },
    });
  }

  tituloModal(): string {
    const modal = this.modalConfirmacion();
    if (!modal) {
      return '';
    }
    return modal.tipo === 'profesional' ? 'Eliminar profesional' : 'Cancelar invitación';
  }

  textoBotonConfirmar(): string {
    const modal = this.modalConfirmacion();
    if (!modal) {
      return 'Confirmar';
    }
    return modal.tipo === 'profesional' ? 'Sí, eliminar' : 'Sí, cancelar';
  }
}
