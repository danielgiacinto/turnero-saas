import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  InvitacionPendienteListado,
  ProfesionalListado,
} from '../../core/models/usuario.model';
import { AuthService } from '../../core/services/auth.service';
import {
  controlInvalido,
  mensajeValidacion,
} from '../../shared/utils/validacion-formulario.util';

@Component({
  selector: 'app-panel-profesionales',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './panel-profesionales.component.html',
  styleUrl: './panel-profesionales.component.scss',
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
  readonly linkInvitacion = signal<string | null>(null);
  readonly linkCopiado = signal(false);
  readonly formularioInvitacionEnviado = signal(false);

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
    this.linkInvitacion.set(null);
    this.linkCopiado.set(false);

    if (this.formularioInvitacion.invalid) {
      return;
    }

    const { email } = this.formularioInvitacion.getRawValue();
    this.invitacionCargando.set(true);

    this.auth.invitar(email).subscribe({
      next: (res) => {
        this.invitacionExito.set(`Invitación enviada a ${res.email}.`);
        this.linkInvitacion.set(res.link);
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

  async copiarLink(): Promise<void> {
    const link = this.linkInvitacion();
    if (!link) {
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      this.linkCopiado.set(true);
      setTimeout(() => this.linkCopiado.set(false), 2500);
    } catch {
      this.invitacionError.set('No se pudo copiar el enlace. Copialo manualmente.');
    }
  }
}
