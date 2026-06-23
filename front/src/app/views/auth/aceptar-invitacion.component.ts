import {
  afterNextRender,
  Component,
  effect,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { GoogleIdentityService } from '../../core/services/google-identity.service';
import { InvitacionInfo } from '../../core/models/usuario.model';
import {
  controlInvalido,
  longitudMinimaOpcional,
  mensajeValidacion,
} from '../../shared/utils/validacion-formulario.util';

@Component({
  selector: 'app-aceptar-invitacion',
  imports: [ReactiveFormsModule],
  templateUrl: './aceptar-invitacion.component.html',
  styleUrl: './aceptar-invitacion.component.scss',
})
export class AceptarInvitacionComponent {
  private readonly auth = inject(AuthService);
  private readonly google = inject(GoogleIdentityService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly botonGoogle = viewChild<ElementRef<HTMLElement>>('botonGoogle');

  readonly googleConfigurado = this.google.estaConfigurado;
  private token = '';
  private googleRenderizado = false;

  readonly invitacion = signal<InvitacionInfo | null>(null);
  readonly cargandoInvitacion = signal(true);
  readonly errorInvitacion = signal<string | null>(null);
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly formularioEnviado = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    password: ['', longitudMinimaOpcional(8)],
    telefono: [''],
  });

  constructor() {
    this.token = this.ruta.snapshot.paramMap.get('token') ?? '';
    this.auth.obtenerInvitacion(this.token).subscribe({
      next: (info) => {
        this.invitacion.set(info);
        this.cargandoInvitacion.set(false);
      },
      error: (err) => {
        this.errorInvitacion.set(err?.error?.mensaje ?? 'La invitación no es válida.');
        this.cargandoInvitacion.set(false);
      },
    });

    effect(() => {
      const inv = this.invitacion();
      if (!inv || this.cargandoInvitacion() || !this.googleConfigurado) {
        return;
      }
      afterNextRender(() => this.renderizarBotonGoogle());
    });
  }

  private renderizarBotonGoogle(): void {
    if (this.googleRenderizado) {
      return;
    }
    const contenedor = this.botonGoogle();
    if (!contenedor?.nativeElement) {
      return;
    }
    this.googleRenderizado = true;
    void this.google.renderizarBoton(contenedor.nativeElement, (idToken) =>
      this.completarConGoogle(idToken),
    );
  }

  esInvalido(campo: 'nombre' | 'password'): boolean {
    return controlInvalido(this.formulario.get(campo), this.formularioEnviado());
  }

  mensaje(campo: 'nombre' | 'password', etiqueta: string): string {
    return mensajeValidacion(this.formulario.get(campo), etiqueta);
  }

  completar(): void {
    this.formularioEnviado.set(true);
    this.error.set(null);

    const password = this.formulario.controls.password.value.trim();
    if (this.formulario.controls.password.invalid) {
      return;
    }
    if (this.formulario.controls.nombre.invalid) {
      return;
    }

    if (!password) {
      this.error.set(
        this.googleConfigurado
          ? 'Definí una contraseña (mín. 8 caracteres) o usá el botón de Google.'
          : 'Definí una contraseña de al menos 8 caracteres.',
      );
      return;
    }

    const { nombre, telefono } = this.formulario.getRawValue();
    this.enviar({
      nombre,
      password,
      telefono: telefono || undefined,
    });
  }

  private completarConGoogle(idToken: string): void {
    this.formularioEnviado.set(true);
    this.error.set(null);

    const nombre = this.formulario.controls.nombre.value.trim();
    if (!nombre) {
      this.error.set('Completá tu nombre antes de continuar con Google.');
      return;
    }

    const telefono = this.formulario.controls.telefono.value.trim();
    this.enviar({
      nombre,
      idToken,
      telefono: telefono || undefined,
    });
  }

  private enviar(dto: {
    nombre: string;
    password?: string;
    idToken?: string;
    telefono?: string;
  }): void {
    this.cargando.set(true);
    this.error.set(null);
    this.auth.completarInvitacion(this.token, dto).subscribe({
      next: () => this.router.navigate(['/panel']),
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo completar el registro.');
        this.cargando.set(false);
      },
    });
  }
}
