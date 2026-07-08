import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  MODALIDADES_SERVICIO,
  ModalidadServicio,
  Servicio,
} from '../../../core/models/servicio.model';
import { AuthService } from '../../../core/services/auth.service';
import { ServicioService } from '../../../core/services/servicio.service';
import {
  controlInvalido,
  mensajeValidacion,
} from '../../../shared/utils/validacion-formulario.util';

type CampoServicio = 'nombre' | 'duracion_minutos' | 'precio' | 'modalidad';

@Component({
  selector: 'app-panel-servicios',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './servicios.component.html',
  styleUrl: './servicios.component.scss',
})
export class PanelServiciosComponent implements OnInit {
  private readonly servicioService = inject(ServicioService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly modalidades = MODALIDADES_SERVICIO;
  readonly esAdmin = computed(() => this.auth.usuario()?.rol === 'admin');

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly servicios = signal<Servicio[]>([]);
  readonly exitoListado = signal<string | null>(null);

  readonly modalAbierto = signal(false);
  readonly servicioEnEdicion = signal<Servicio | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);
  readonly formularioEnviado = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    duracion_minutos: [30, [Validators.required, Validators.min(1)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    modalidad: ['presencial' as ModalidadServicio, Validators.required],
  });

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.servicioService.listar().subscribe({
      next: (datos) => {
        this.servicios.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudieron cargar los servicios.');
        this.cargando.set(false);
      },
    });
  }

  etiquetaModalidad(modalidad: ModalidadServicio): string {
    return this.modalidades.find((m) => m.valor === modalidad)?.etiqueta ?? modalidad;
  }

  iconoModalidad(modalidad: ModalidadServicio): string {
    return this.modalidades.find((m) => m.valor === modalidad)?.icono ?? 'bi-tag';
  }

  abrirCreacion(): void {
    if (!this.esAdmin()) {
      return;
    }
    this.servicioEnEdicion.set(null);
    this.errorFormulario.set(null);
    this.formularioEnviado.set(false);
    this.formulario.reset({
      nombre: '',
      duracion_minutos: 30,
      precio: 0,
      modalidad: 'presencial',
    });
    this.modalAbierto.set(true);
  }

  abrirEdicion(servicio: Servicio): void {
    if (!this.esAdmin()) {
      return;
    }
    this.servicioEnEdicion.set(servicio);
    this.errorFormulario.set(null);
    this.formularioEnviado.set(false);
    this.formulario.reset({
      nombre: servicio.nombre,
      duracion_minutos: servicio.duracion_minutos,
      precio: servicio.precio,
      modalidad: servicio.modalidad,
    });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }
    this.modalAbierto.set(false);
    this.servicioEnEdicion.set(null);
  }

  esInvalido(campo: CampoServicio): boolean {
    return controlInvalido(this.formulario.get(campo), this.formularioEnviado());
  }

  mensaje(campo: CampoServicio, etiqueta: string): string {
    return mensajeValidacion(this.formulario.get(campo), etiqueta);
  }

  tituloModal(): string {
    return this.servicioEnEdicion() ? 'Editar servicio' : 'Nuevo servicio';
  }

  guardar(): void {
    this.formularioEnviado.set(true);
    this.errorFormulario.set(null);

    if (this.formulario.invalid) {
      return;
    }

    this.guardando.set(true);
    const datos = this.formulario.getRawValue();
    const enEdicion = this.servicioEnEdicion();

    const peticion = enEdicion
      ? this.servicioService.actualizar(enEdicion.id, datos)
      : this.servicioService.crear(datos);

    peticion.subscribe({
      next: () => {
        this.exitoListado.set(
          enEdicion ? 'Servicio actualizado correctamente.' : 'Servicio creado correctamente.',
        );
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.servicioEnEdicion.set(null);
        this.cargar();
        setTimeout(() => this.exitoListado.set(null), 4000);
      },
      error: (err) => {
        this.errorFormulario.set(err?.error?.mensaje ?? 'No se pudo guardar el servicio.');
        this.guardando.set(false);
      },
    });
  }
}
