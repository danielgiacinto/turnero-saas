import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { ClienteDetalle, GuardarCliente } from '../../../core/models/cliente.model';
import {
  ETIQUETAS_ESTADO_TURNO,
  claseBadgeTurno,
} from '../../../core/models/turno.model';
import { ClienteService } from '../../../core/services/cliente.service';
import {
  controlInvalido,
  mensajeValidacion,
} from '../../../shared/utils/validacion-formulario.util';

type CampoCliente = 'nombre' | 'apellido' | 'email' | 'telefono';

@Component({
  selector: 'app-cliente-detalle',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './cliente-detalle.component.html',
  styleUrl: './cliente-detalle.component.scss',
})
export class ClienteDetalleComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clienteService = inject(ClienteService);
  private readonly fb = inject(FormBuilder);

  readonly etiquetasEstado = ETIQUETAS_ESTADO_TURNO;
  readonly claseBadgeTurno = claseBadgeTurno;

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly cliente = signal<ClienteDetalle | null>(null);

  readonly editando = signal(false);
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);
  readonly formularioEnviado = signal(false);

  readonly formulario = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', Validators.required],
  });

  private clienteId = '';

  ngOnInit(): void {
    this.clienteId = this.route.snapshot.paramMap.get('id') ?? '';
    if (!this.clienteId) {
      this.router.navigate(['/panel/clientes']);
      return;
    }
    this.cargar();
  }

  cargar(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.clienteService.obtener(this.clienteId).subscribe({
      next: (datos) => {
        this.cliente.set(datos);
        this.formulario.reset({
          nombre: datos.nombre,
          apellido: datos.apellido,
          email: datos.email,
          telefono: datos.telefono,
        });
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo cargar el cliente.');
        this.cargando.set(false);
      },
    });
  }

  iniciarEdicion(): void {
    const c = this.cliente();
    if (!c) {
      return;
    }
    this.errorFormulario.set(null);
    this.formularioEnviado.set(false);
    this.formulario.reset({
      nombre: c.nombre,
      apellido: c.apellido,
      email: c.email,
      telefono: c.telefono,
    });
    this.editando.set(true);
  }

  cancelarEdicion(): void {
    this.editando.set(false);
    this.errorFormulario.set(null);
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

    this.clienteService.actualizar(this.clienteId, datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.editando.set(false);
        this.exito.set('Datos del cliente actualizados.');
        this.cargar();
        setTimeout(() => this.exito.set(null), 4000);
      },
      error: (err) => {
        this.errorFormulario.set(err?.error?.mensaje ?? 'No se pudieron guardar los cambios.');
        this.guardando.set(false);
      },
    });
  }
}
