import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { IdPaletaTema, ModoTema } from '../../core/models/paleta-tema.model';
import { AuthService } from '../../core/services/auth.service';
import { TemaPanelService } from '../../core/services/tema-panel.service';
import {
  controlInvalido,
  mensajeValidacion,
} from '../../shared/utils/validacion-formulario.util';

@Component({
  selector: 'app-panel-configuracion',
  imports: [ReactiveFormsModule],
  templateUrl: './panel-configuracion.component.html',
  styleUrl: './panel-configuracion.component.scss',
})
export class PanelConfiguracionComponent {
  private readonly temaPanel = inject(TemaPanelService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly paletas = this.temaPanel.paletas;
  readonly paletaActual = this.temaPanel.paletaActual;
  readonly modoActual = this.temaPanel.modoActual;
  readonly esAdmin = computed(() => this.auth.usuario()?.rol === 'admin');

  readonly invitacionCargando = signal(false);
  readonly invitacionError = signal<string | null>(null);
  readonly invitacionExito = signal<string | null>(null);
  readonly linkInvitacion = signal<string | null>(null);
  readonly linkCopiado = signal(false);
  readonly formularioInvitacionEnviado = signal(false);

  readonly formularioInvitacion = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly modos: { id: ModoTema; etiqueta: string; icono: string; descripcion: string }[] = [
    {
      id: 'claro',
      etiqueta: 'Modo claro',
      icono: 'bi-sun-fill',
      descripcion: 'Interfaz luminosa para ambientes con mucha luz',
    },
    {
      id: 'oscuro',
      etiqueta: 'Modo oscuro',
      icono: 'bi-moon-stars-fill',
      descripcion: 'Menos fatiga visual — recomendado para el panel',
    },
  ];

  seleccionarPaleta(id: IdPaletaTema): void {
    this.temaPanel.establecerPaleta(id);
  }

  seleccionarModo(modo: ModoTema): void {
    this.temaPanel.establecerModo(modo);
  }

  paletaActiva(id: IdPaletaTema): boolean {
    return this.paletaActual() === id;
  }

  modoActivo(modo: ModoTema): boolean {
    return this.modoActual() === modo;
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
