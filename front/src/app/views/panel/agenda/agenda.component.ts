import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  ETIQUETAS_ESTADO_TURNO,
  ClienteResumen,
  EstadoTurno,
  SlotDisponible,
  StaffAtencion,
  TurnoListado,
  claseBadgeTurno,
} from '../../../core/models/turno.model';
import { Servicio } from '../../../core/models/servicio.model';
import { AuthService } from '../../../core/services/auth.service';
import { ClienteService } from '../../../core/services/cliente.service';
import { ServicioService } from '../../../core/services/servicio.service';
import { TurnoService } from '../../../core/services/turno.service';
import {
  controlInvalido,
  mensajeValidacion,
} from '../../../shared/utils/validacion-formulario.util';

type CampoCliente = 'email' | 'nombre' | 'apellido' | 'telefono';

function fechaHoyIso(): string {
  const hoy = new Date();
  const anio = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, '0');
  const dia = String(hoy.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

@Component({
  selector: 'app-panel-agenda',
  imports: [ReactiveFormsModule, FormsModule, DatePipe],
  templateUrl: './agenda.component.html',
  styleUrl: './agenda.component.scss',
})
export class PanelAgendaComponent implements OnInit {
  private readonly turnoService = inject(TurnoService);
  private readonly clienteService = inject(ClienteService);
  private readonly servicioService = inject(ServicioService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly esAdmin = computed(() => this.auth.usuario()?.rol === 'admin');
  readonly etiquetasEstado = ETIQUETAS_ESTADO_TURNO;
  readonly claseBadgeTurno = claseBadgeTurno;

  // Filtros de agenda
  readonly staff = signal<StaffAtencion[]>([]);
  readonly profesionalSeleccionado = signal<string>('');
  readonly fechaSeleccionada = signal<string>(fechaHoyIso());

  // Listado del día
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly turnos = signal<TurnoListado[]>([]);
  readonly exito = signal<string | null>(null);

  // Modal nuevo turno
  readonly modalAbierto = signal(false);
  readonly servicios = signal<Servicio[]>([]);
  readonly slots = signal<SlotDisponible[]>([]);
  readonly cargandoSlots = signal(false);
  readonly slotSeleccionado = signal<string | null>(null);
  readonly guardando = signal(false);
  readonly errorFormulario = signal<string | null>(null);
  readonly formularioEnviado = signal(false);

  // Cliente inline
  readonly buscandoCliente = signal(false);
  readonly clienteEncontrado = signal<ClienteResumen | null>(null);
  readonly busquedaRealizada = signal(false);

  // Cancelación
  readonly turnoACancelar = signal<TurnoListado | null>(null);
  readonly cancelando = signal(false);

  readonly formularioTurno = this.fb.nonNullable.group({
    servicio_id: ['', Validators.required],
    fecha: [fechaHoyIso(), Validators.required],
  });

  readonly formularioCliente = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    telefono: ['', Validators.required],
  });

  readonly turnosActivos = computed(() =>
    this.turnos().filter((t) => t.estado !== 'cancelado'),
  );
  readonly turnosCancelados = computed(() =>
    this.turnos().filter((t) => t.estado === 'cancelado'),
  );

  ngOnInit(): void {
    if (this.esAdmin()) {
      this.turnoService.listarStaff().subscribe({
        next: (datos) => {
          this.staff.set(datos);
          const propio = datos.find((s) => s.id === this.auth.usuario()?.id);
          this.profesionalSeleccionado.set(propio?.id ?? datos[0]?.id ?? '');
          this.cargarAgenda();
        },
        error: (err) => {
          this.error.set(err?.error?.mensaje ?? 'No se pudo cargar el equipo.');
          this.cargando.set(false);
        },
      });
    } else {
      this.profesionalSeleccionado.set(this.auth.usuario()?.id ?? '');
      this.cargarAgenda();
    }

    this.servicioService.listar().subscribe({
      next: (datos) => this.servicios.set(datos),
      error: () => this.servicios.set([]),
    });
  }

  cargarAgenda(): void {
    const profesionalId = this.profesionalSeleccionado();
    const fecha = this.fechaSeleccionada();
    if (!profesionalId || !fecha) {
      return;
    }

    this.cargando.set(true);
    this.error.set(null);

    this.turnoService.listarDelDia(fecha, profesionalId).subscribe({
      next: (datos) => {
        this.turnos.set(datos);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo cargar la agenda.');
        this.cargando.set(false);
      },
    });
  }

  cambiarProfesional(id: string): void {
    this.profesionalSeleccionado.set(id);
    this.cargarAgenda();
  }

  cambiarFecha(fecha: string): void {
    this.fechaSeleccionada.set(fecha);
    this.cargarAgenda();
  }

  // ── Modal nuevo turno ────────────────────────────────────────────

  abrirNuevoTurno(): void {
    this.errorFormulario.set(null);
    this.formularioEnviado.set(false);
    this.slotSeleccionado.set(null);
    this.slots.set([]);
    this.clienteEncontrado.set(null);
    this.busquedaRealizada.set(false);
    this.formularioTurno.reset({ servicio_id: '', fecha: this.fechaSeleccionada() });
    this.formularioCliente.reset({ email: '', nombre: '', apellido: '', telefono: '' });
    this.modalAbierto.set(true);
  }

  cerrarModal(): void {
    if (this.guardando()) {
      return;
    }
    this.modalAbierto.set(false);
  }

  consultarDisponibilidad(): void {
    const { servicio_id, fecha } = this.formularioTurno.getRawValue();
    this.slotSeleccionado.set(null);
    if (!servicio_id || !fecha) {
      this.slots.set([]);
      return;
    }

    this.cargandoSlots.set(true);
    this.turnoService
      .disponibilidad(servicio_id, fecha, this.profesionalSeleccionado())
      .subscribe({
        next: (datos) => {
          this.slots.set(datos);
          this.cargandoSlots.set(false);
        },
        error: (err) => {
          this.errorFormulario.set(
            err?.error?.mensaje ?? 'No se pudo consultar la disponibilidad.',
          );
          this.slots.set([]);
          this.cargandoSlots.set(false);
        },
      });
  }

  seleccionarSlot(hora: string): void {
    this.slotSeleccionado.set(hora);
  }

  buscarCliente(): void {
    const email = this.formularioCliente.get('email')?.value?.trim();
    if (!email || this.formularioCliente.get('email')?.invalid) {
      return;
    }

    this.buscandoCliente.set(true);
    this.clienteEncontrado.set(null);

    this.clienteService.buscarPorEmail(email).subscribe({
      next: (cliente) => {
        this.clienteEncontrado.set(cliente);
        this.busquedaRealizada.set(true);
        this.buscandoCliente.set(false);
        if (cliente) {
          this.formularioCliente.patchValue({
            nombre: cliente.nombre,
            apellido: cliente.apellido,
            telefono: cliente.telefono,
          });
        }
      },
      error: () => {
        this.busquedaRealizada.set(true);
        this.buscandoCliente.set(false);
      },
    });
  }

  esInvalidoCliente(campo: CampoCliente): boolean {
    return controlInvalido(this.formularioCliente.get(campo), this.formularioEnviado());
  }

  mensajeCliente(campo: CampoCliente, etiqueta: string): string {
    return mensajeValidacion(this.formularioCliente.get(campo), etiqueta);
  }

  guardarTurno(): void {
    this.formularioEnviado.set(true);
    this.errorFormulario.set(null);

    const { servicio_id, fecha } = this.formularioTurno.getRawValue();
    const hora = this.slotSeleccionado();

    if (!servicio_id || !fecha) {
      this.errorFormulario.set('Elegí un servicio y una fecha.');
      return;
    }
    if (!hora) {
      this.errorFormulario.set('Elegí un horario disponible.');
      return;
    }
    if (this.formularioCliente.invalid) {
      return;
    }

    this.guardando.set(true);

    this.turnoService
      .crear({
        profesional_id: this.profesionalSeleccionado(),
        servicio_id,
        fecha,
        hora,
        cliente: this.formularioCliente.getRawValue(),
      })
      .subscribe({
        next: () => {
          this.guardando.set(false);
          this.modalAbierto.set(false);
          this.exito.set('Turno agendado correctamente.');
          if (fecha === this.fechaSeleccionada()) {
            this.cargarAgenda();
          }
          setTimeout(() => this.exito.set(null), 4000);
        },
        error: (err) => {
          this.errorFormulario.set(err?.error?.mensaje ?? 'No se pudo agendar el turno.');
          this.guardando.set(false);
        },
      });
  }

  // ── Cancelación ──────────────────────────────────────────────────

  abrirCancelacion(turno: TurnoListado): void {
    this.turnoACancelar.set(turno);
  }

  cerrarCancelacion(): void {
    if (this.cancelando()) {
      return;
    }
    this.turnoACancelar.set(null);
  }

  confirmarCancelacion(): void {
    const turno = this.turnoACancelar();
    if (!turno) {
      return;
    }

    this.cancelando.set(true);
    this.turnoService.cancelar(turno.id).subscribe({
      next: (res) => {
        this.cancelando.set(false);
        this.turnoACancelar.set(null);
        this.exito.set(res.mensaje);
        this.cargarAgenda();
        setTimeout(() => this.exito.set(null), 4000);
      },
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo cancelar el turno.');
        this.cancelando.set(false);
        this.turnoACancelar.set(null);
      },
    });
  }

  puedeCancelar(estado: EstadoTurno): boolean {
    return estado === 'pendiente' || estado === 'pendiente_verificacion';
  }
}
