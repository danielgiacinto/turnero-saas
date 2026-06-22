import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import {
  controlInvalido,
  mensajeValidacion,
} from '../../shared/utils/validacion-formulario.util';

const RUBROS: { valor: string; etiqueta: string }[] = [
  { valor: 'barberia', etiqueta: 'Barbería' },
  { valor: 'estetica', etiqueta: 'Estética' },
  { valor: 'salud_medicina', etiqueta: 'Salud / Medicina' },
  { valor: 'psicologia', etiqueta: 'Psicología' },
  { valor: 'nutricion', etiqueta: 'Nutrición' },
  { valor: 'medicina', etiqueta: 'Medicina' },
];

type CampoRegistro =
  | 'nombreComercio'
  | 'url'
  | 'barrio'
  | 'rubro'
  | 'nombreAdmin'
  | 'email'
  | 'password';

@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss',
})
export class RegistroComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly rubros = RUBROS;
  readonly cargando = signal(false);
  readonly error = signal<string | null>(null);
  readonly formularioEnviado = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    nombreComercio: ['', Validators.required],
    url: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    barrio: ['', Validators.required],
    rubro: ['barberia', Validators.required],
    direccion: [''],
    nombreAdmin: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    telefono: [''],
  });

  esInvalido(campo: CampoRegistro): boolean {
    return controlInvalido(this.formulario.get(campo), this.formularioEnviado());
  }

  mensaje(campo: CampoRegistro, etiqueta: string): string {
    const control = this.formulario.get(campo);
    if (control?.errors?.['pattern']) {
      return 'La URL solo puede tener letras minúsculas, números y guiones.';
    }
    return mensajeValidacion(control, etiqueta);
  }

  registrar(): void {
    this.formularioEnviado.set(true);
    this.error.set(null);

    if (this.formulario.invalid) {
      return;
    }

    this.cargando.set(true);
    const datos = this.formulario.getRawValue();

    this.auth.registrar(datos).subscribe({
      next: (res) => {
        void this.router.navigate(['/auth/verificar-email'], {
          queryParams: { email: datos.email },
          state: { codigoDesarrollo: res.codigo_desarrollo ?? null },
        });
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo crear el comercio.');
        this.cargando.set(false);
      },
    });
  }
}
