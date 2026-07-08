import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-panel-configuracion',
  imports: [RouterLink],
  templateUrl: './panel-configuracion.component.html',
  styleUrl: './panel-configuracion.component.scss',
})
export class PanelConfiguracionComponent {
  private readonly auth = inject(AuthService);

  private readonly todosLosModulos = [
    {
      ruta: 'apariencia',
      titulo: 'Apariencia',
      descripcion: 'Modo claro/oscuro y paleta de colores del panel.',
      icono: 'bi-palette-fill',
      soloAdmin: false,
    },
    {
      ruta: 'datos-comercio',
      titulo: 'Datos del comercio',
      descripcion: 'Nombre, URL pública, ubicación, rubro y dirección.',
      icono: 'bi-shop',
      soloAdmin: true,
    },
  ] as const;

  readonly modulos = computed(() => {
    const esAdmin = this.auth.usuario()?.rol === 'admin';
    return this.todosLosModulos.filter((modulo) => !modulo.soloAdmin || esAdmin);
  });
}
