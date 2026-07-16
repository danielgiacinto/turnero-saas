import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ClienteListado, GuardarCliente } from '../../../core/models/cliente.model';
import { ClienteService } from '../../../core/services/cliente.service';
import {
  controlInvalido,
  mensajeValidacion,
} from '../../../shared/utils/validacion-formulario.util';

type CampoCliente = 'nombre' | 'apellido' | 'email' | 'telefono';

@Component({
  selector: 'app-panel-clientes',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './clientes.component.html',
  styleUrl: './clientes.component.scss',
})
export class PanelClientesComponent implements OnInit {
  private readonly clienteService = inject(ClienteService);
  private readonly fb = inject(FormBuilder);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly clientes = signal<ClienteListado[]>([]);
  readonly busqueda = signal('');

  readonly modalAbierto = signal(false);
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);
  readonly formularioEnviado = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required],
  });

  private debounceBusqueda: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(busqueda?: string): void {
    this.cargando.set(true);
    this.error.set(null);

    this.clienteService.listar(busqueda).subscribe({
      next: (datos) => {
        this.clientes.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudieron cargar los clientes.');
        this.cargando.set(false);
      },
    });
  }

  onBusqueda(valor: string): void {
    this.busqueda.set(valor);
    if (this.debounceBusqueda) {
      clearTimeout(this.debounceBusqueda);
    }
    this.debounceBusqueda = setTimeout(() => this.cargar(valor), 350);
  }

  abrirAlta(): void {
    this.errorFormulario.set(null);
    this.formularioEnviado.set(false);
    this.formulario.reset({ nombre: '', apellido: '', email: '', telefono: '' });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }
    this.modalAbierto.set(false);
  }

  esInvalido(campo: CampoCliente): boolean {
    return controlInvalido(this.formulario.get(campo), this.formularioEnviado());
  }

  mensaje(campo: CampoCliente, etiqueta: string): string {
    return mensajeValidacion(this.formulario.get(campo), etiqueta);
  }

  guardar(): void {
    this.formularioEnviado.set(true);
    this.errorFormulario.set(null);

    if (this.formulario.invalid) {
      return;
    }

    this.guardando.set(true);
    const datos: GuardarCliente = this.formulario.getRawValue();

    this.clienteService.crear(datos).subscribe({
      next: (cliente) => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.exito.set(
          `${cliente.nombre} ${cliente.apellido} quedó registrado. Agendá un turno para verlo en el listado.`,
        );
        this.cargar(this.busqueda());
        setTimeout(() => this.exito.set(null), 5000);
      },
      error: (err) => {
        this.errorFormulario.set(err?.error?.mensaje ?? 'No se pudo guardar el cliente.');
        this.guardando.set(false);
      },
    });
  }
}
