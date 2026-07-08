import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../core/services/auth.service';
import {
  claseBadgeSuscripcion,
  etiquetaEstadoSuscripcion,
  mensajeSuscripcionBloqueada,
} from '../../core/utils/suscripcion.util';

@Component({
  selector: 'app-panel-suscripcion',
  imports: [RouterLink, DatePipe],
  templateUrl: './panel-suscripcion.component.html',
  styleUrl: './panel-suscripcion.component.scss',
})
export class PanelSuscripcionComponent {
  private readonly auth = inject(AuthService);

  readonly comercio = this.auth.comercio;
  readonly esAdmin = computed(() => this.auth.usuario()?.rol === 'admin');

  readonly mensaje = computed(() => {
    const comercio = this.comercio();
    return comercio
      ? mensajeSuscripcionBloqueada(comercio)
      : 'No pudimos verificar el estado de la suscripción.';
  });

  etiquetaEstado = etiquetaEstadoSuscripcion;
  claseBadge = claseBadgeSuscripcion;
}
