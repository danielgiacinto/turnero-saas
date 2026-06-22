import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import { emailEstaEnmascarado } from '../../core/utils/error-auth.util';
import { environment } from '../../../environments/environment';
import {
  controlInvalido,
  mensajeValidacion,
} from '../../shared/utils/validacion-formulario.util';

const SEGUNDOS_REENVIO = 60;

@Component({
  selector: 'app-verificar-email',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verificar-email.component.html',
  styleUrl: './verificar-email.component.scss',
})
export class VerificarEmailComponent implements OnInit, OnDestroy {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly ruta = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  private temporizadorReenvio: ReturnType<typeof setInterval> | null = null;

  readonly cargando = signal(false);
  readonly reenviando = signal(false);
  readonly error = signal<string | null>(null);
  readonly exito = signal<string | null>(null);
  readonly formularioEnviado = signal(false);
  readonly emailSoloLectura = signal(false);
  readonly segundosReenvio = signal(0);
  readonly emailEstaEnmascarado = emailEstaEnmascarado;
  readonly esDesarrollo = !environment.production;
  readonly codigoDesarrollo = signal<string | null>(null);

  readonly formulario = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    codigo: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  ngOnInit(): void {
    const estado = history.state as { codigoDesarrollo?: string | null } | undefined;
    if (estado?.codigoDesarrollo) {
      this.codigoDesarrollo.set(estado.codigoDesarrollo);
    }

    const emailParam = this.ruta.snapshot.queryParamMap.get('email')?.trim() ?? '';
    const solicitarCodigo = this.ruta.snapshot.queryParamMap.get('solicitar') === '1';

    if (emailParam) {
      this.formulario.controls.email.setValue(emailParam);
      this.emailSoloLectura.set(!emailEstaEnmascarado(emailParam));
    }

    const debeEnviarCodigo =
      solicitarCodigo &&
      !estado?.codigoDesarrollo &&
      emailParam.length > 0 &&
      !emailEstaEnmascarado(emailParam);

    if (debeEnviarCodigo) {
      this.ejecutarReenvio(emailParam, true);
      void this.router.navigate([], {
        relativeTo: this.ruta,
        queryParams: { email: emailParam },
        replaceUrl: true,
      });
    }
  }

  ngOnDestroy(): void {
    this.detenerTemporizadorReenvio();
  }

  esInvalido(campo: 'email' | 'codigo'): boolean {
    return controlInvalido(this.formulario.get(campo), this.formularioEnviado());
  }

  mensaje(campo: 'email' | 'codigo', etiqueta: string): string {
    const control = this.formulario.get(campo);
    if (control?.errors?.['pattern']) {
      return 'El código debe tener 6 dígitos.';
    }
    return mensajeValidacion(control, etiqueta);
  }

  verificar(): void {
    this.formularioEnviado.set(true);
    this.error.set(null);
    this.exito.set(null);

    if (this.formulario.invalid) {
      return;
    }

    const { email, codigo } = this.formulario.getRawValue();
    this.cargando.set(true);

    this.auth.verificarEmail(email, codigo).subscribe({
      next: () => void this.router.navigate(['/panel']),
      error: (err) => {
        this.error.set(err?.error?.mensaje ?? 'No se pudo verificar el código.');
        this.cargando.set(false);
      },
    });
  }

  reenviarCodigo(): void {
    if (this.segundosReenvio() > 0 || this.reenviando()) {
      return;
    }

    const email = this.formulario.controls.email.value.trim();
    if (!email || emailEstaEnmascarado(email)) {
      this.error.set('Ingresá tu email completo para reenviar el código.');
      return;
    }

    this.ejecutarReenvio(email, false);
  }

  private ejecutarReenvio(email: string, esAutomatico: boolean): void {
    this.reenviando.set(true);
    this.error.set(null);
    this.exito.set(null);

    this.auth.reenviarCodigo(email).subscribe({
      next: (res) => {
        this.exito.set(
          esAutomatico ? 'Te enviamos un código a tu correo. Revisá tu bandeja de entrada.' : res.mensaje,
        );
        if (res.codigo_desarrollo) {
          this.codigoDesarrollo.set(res.codigo_desarrollo);
        }
        this.reenviando.set(false);
        this.iniciarCuentaReenvio();
      },
      error: (err) => {
        const mensaje = err?.error?.mensaje ?? 'No se pudo enviar el código.';
        if (esAutomatico && typeof mensaje === 'string' && mensaje.includes('Esperá')) {
          this.exito.set(mensaje);
        } else {
          this.error.set(mensaje);
        }
        this.reenviando.set(false);
      },
    });
  }

  private iniciarCuentaReenvio(): void {
    this.detenerTemporizadorReenvio();
    this.segundosReenvio.set(SEGUNDOS_REENVIO);
    this.temporizadorReenvio = setInterval(() => {
      const restante = this.segundosReenvio() - 1;
      if (restante <= 0) {
        this.segundosReenvio.set(0);
        this.detenerTemporizadorReenvio();
        return;
      }
      this.segundosReenvio.set(restante);
    }, 1000);
  }

  private detenerTemporizadorReenvio(): void {
    if (this.temporizadorReenvio) {
      clearInterval(this.temporizadorReenvio);
      this.temporizadorReenvio = null;
    }
  }
}
