import { DatePipe, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  PLATFORM_ID,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { TemaPanelService } from '../../../core/services/tema-panel.service';
import { AuthService } from '../../../core/services/auth.service';
import {
  claseBadgeSuscripcion,
  etiquetaEstadoSuscripcion,
} from '../../../core/utils/suscripcion.util';
import { iconoServicioPorRubro } from '../../../core/utils/rubro.util';

/**
 * Shell del panel admin/profesional.
 * Modo oscuro por defecto; selector de paleta en toolbar.
 */
@Component({
  selector: 'app-panel-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, DatePipe],
  templateUrl: './panel-layout.component.html',
  styleUrl: './panel-layout.component.scss',
})
export class PanelLayoutComponent implements AfterViewInit {
  private readonly temaPanel = inject(TemaPanelService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly host = viewChild<ElementRef<HTMLElement>>('hostPanel');

  readonly paletaActual = this.temaPanel.paletaActual;
  readonly modoActual = this.temaPanel.modoActual;
  readonly usuario = this.auth.usuario;
  readonly comercio = this.auth.comercio;
  readonly esAdmin = computed(() => this.auth.usuario()?.rol === 'admin');
  readonly iconoServicio = computed(() => iconoServicioPorRubro(this.auth.comercio()?.rubro));
  readonly menuAbierto = signal(false);

  readonly etiquetaEstadoSuscripcion = etiquetaEstadoSuscripcion;
  readonly claseBadgeSuscripcion = claseBadgeSuscripcion;

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      effect(() => {
        this.paletaActual();
        this.modoActual();
        const ref = this.host();
        if (ref?.nativeElement) {
          this.temaPanel.sincronizarElemento(ref.nativeElement);
        }
      });
    }
  }

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const ref = this.host();
    if (ref?.nativeElement) {
      this.temaPanel.aplicarEnElemento(ref.nativeElement);
    }
  }

  alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  cerrarSesion(): void {
    this.auth.cerrarSesion();
    this.router.navigate(['/auth/login']);
  }
}
