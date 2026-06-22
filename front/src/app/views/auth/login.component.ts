import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { GoogleIdentityService } from '../../core/services/google-identity.service';
import { obtenerDetalleEmailNoVerificado } from '../../core/utils/error-auth.util';
import {
  controlInvalido,
  mensajeValidacion,
} from '../../shared/utils/validacion-formulario.util';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements AfterViewInit {
  private readonly auth = inject(AuthService);
  private readonly google = inject(GoogleIdentityService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly botonGoogle = viewChild<ElementRef<HTMLElement>>('botonGoogle');

  readonly googleConfigurado = this.google.estaConfigurado;
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly formularioEnviado = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngAfterViewInit(): void {
    const contenedor = this.botonGoogle();
    if (contenedor) {
      void this.google.renderizarBoton(contenedor.nativeElement, (idToken) =>
        this.ingresarConGoogle(idToken),
      );
    }
  }

  esInvalido(campo: 'email' | 'password'): boolean {
    return controlInvalido(this.formulario.get(campo), this.formularioEnviado());
  }

  mensaje(campo: 'email' | 'password', etiqueta: string): string {
    return mensajeValidacion(this.formulario.get(campo), etiqueta);
  }

  ingresar(): void {
    if (this.cargando()) {
      return;
    }

    this.formularioEnviado.set(true);
    this.error.set(null);

    if (this.formulario.invalid) {
      return;
    }

    const { email, password } = this.formulario.getRawValue();
    this.cargando.set(true);

    this.auth.login(email, password).subscribe({
      next: () => void this.router.navigate(['/panel']),
      error: (err) => {
        const detalle = obtenerDetalleEmailNoVerificado(err);
        if (detalle) {
          void this.router.navigate(['/auth/verificar-email'], {
            queryParams: { email, solicitar: '1' },
          });
          return;
        }
        this.error.set(err?.error?.mensaje ?? 'No se pudo iniciar sesión.');
        this.cargando.set(false);
      },
    });
  }

  private ingresarConGoogle(idToken: string): void {
    if (this.cargando()) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);
    this.auth.loginGoogle(idToken).subscribe({
      next: () => this.router.navigate(['/panel']),
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo iniciar sesión con Google.');
        this.cargando.set(false);
      },
    });
  }
}
