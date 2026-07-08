import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { RUBROS_COMERCIO, TipoRubro } from '../../../../core/models/comercio.model';
import { AuthService } from '../../../../core/services/auth.service';
import { ComercioService } from '../../../../core/services/comercio.service';
import {
  crearValidadorDisponibilidadComercio,
  mensajeValidacion,
} from '../../../../shared/utils/validacion-formulario.util';

type CampoComercio = 'nombre' | 'url' | 'barrio' | 'rubro' | 'direccion';

@Component({
  selector: 'app-configuracion-datos-comercio',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './datos-comercio.component.html',
  styleUrl: './datos-comercio.component.scss',
})
export class ConfiguracionDatosComercioComponent implements OnInit {
  private readonly comercioService = inject(ComercioService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly rubros = RUBROS_COMERCIO;
  readonly cargando = signal(true);
  readonly guardando = signal(false);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly formularioEnviado = signal(false);
  readonly comercioId = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    url: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    barrio: ['', Validators.required],
    rubro: ['barberia' as TipoRubro, Validators.required],
    direccion: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.comercioService.obtener().subscribe({
      next: (datos) => {
        this.comercioId.set(datos.id);
        this.formulario.reset({
          nombre: datos.nombre,
          url: datos.url,
          barrio: datos.barrio,
          rubro: datos.rubro,
          direccion: datos.direccion ?? '',
        });
        this.configurarValidadoresAsync(datos.id);
        this.formularioEnviado.set(false);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudieron cargar los datos del comercio.');
        this.cargando.set(false);
      },
    });
  }

  private configurarValidadoresAsync(comercioId: string): void {
    const nombreCtrl = this.formulario.get('nombre');
    const urlCtrl = this.formulario.get('url');
    if (!nombreCtrl || !urlCtrl) {
      return;
    }

    nombreCtrl.setAsyncValidators([
      crearValidadorDisponibilidadComercio(
        (url, nombre) =>
          this.comercioService.verificarDisponibilidad(url, nombre, comercioId),
        'nombre',
      ),
    ]);
    urlCtrl.setAsyncValidators([
      crearValidadorDisponibilidadComercio(
        (url, nombre) =>
          this.comercioService.verificarDisponibilidad(url, nombre, comercioId),
        'url',
      ),
    ]);
    nombreCtrl.updateValueAndValidity({ emitEvent: false });
    urlCtrl.updateValueAndValidity({ emitEvent: false });
  }

  esInvalido(campo: CampoComercio): boolean {
    const control = this.formulario.get(campo);
    if (!control) {
      return false;
    }
    const mostrar = this.formularioEnviado() || control.dirty;
    return mostrar && control.invalid;
  }

  estaVerificando(campo: 'nombre' | 'url'): boolean {
    const control = this.formulario.get(campo);
    return (control?.pending ?? false) && (control?.dirty ?? false);
  }

  urlEstaDisponible(): boolean {
    const control = this.formulario.get('url');
    if (!control?.dirty || control.pending) {
      return false;
    }
    const valor = String(control.value ?? '').trim();
    if (!valor || control.hasError('required') || control.hasError('pattern')) {
      return false;
    }
    return control.valid;
  }

  mensaje(campo: CampoComercio, etiqueta: string): string {
    return mensajeValidacion(this.formulario.get(campo), etiqueta);
  }

  guardar(): void {
    this.formularioEnviado.set(true);
    this.error.set(null);
    this.exito.set(null);

    if (this.formulario.invalid || this.formulario.pending) {
      return;
    }

    this.guardando.set(true);
    const datos = this.formulario.getRawValue();

    this.comercioService.actualizar(datos).subscribe({
      next: (actualizado) => {
        this.auth.actualizarComercioSesion({
          id: actualizado.id,
          nombre: actualizado.nombre,
          url: actualizado.url,
          rubro: actualizado.rubro,
          estado_suscripcion: actualizado.estado_suscripcion,
          fecha_vencimiento: actualizado.fecha_vencimiento,
        });
        this.formulario.markAsPristine();
        this.exito.set('Datos del comercio actualizados correctamente.');
        this.guardando.set(false);
        setTimeout(() => this.exito.set(null), 4000);
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudieron guardar los cambios.');
        this.guardando.set(false);
      },
    });
  }
}
