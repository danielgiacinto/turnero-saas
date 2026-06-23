import { Component, inject } from '@angular/core';

import { IdPaletaTema, ModoTema } from '../../core/models/paleta-tema.model';
import { TemaPanelService } from '../../core/services/tema-panel.service';

@Component({
  selector: 'app-panel-configuracion',
  templateUrl: './panel-configuracion.component.html',
  styleUrl: './panel-configuracion.component.scss',
})
export class PanelConfiguracionComponent {
  private readonly temaPanel = inject(TemaPanelService);

  readonly paletas = this.temaPanel.paletas;
  readonly paletaActual = this.temaPanel.paletaActual;
  readonly modoActual = this.temaPanel.modoActual;

  readonly modos: { id: ModoTema; etiqueta: string; icono: string; descripcion: string }[] = [
    {
      id: 'claro',
      etiqueta: 'Modo claro',
      icono: 'bi-sun-fill',
      descripcion: 'Interfaz luminosa para ambientes con mucha luz',
    },
    {
      id: 'oscuro',
      etiqueta: 'Modo oscuro',
      icono: 'bi-moon-stars-fill',
      descripcion: 'Menos fatiga visual — recomendado para el panel',
    },
  ];

  seleccionarPaleta(id: IdPaletaTema): void {
    this.temaPanel.establecerPaleta(id);
  }

  seleccionarModo(modo: ModoTema): void {
    this.temaPanel.establecerModo(modo);
  }

  paletaActiva(id: IdPaletaTema): boolean {
    return this.paletaActual() === id;
  }

  modoActivo(modo: ModoTema): boolean {
    return this.modoActual() === modo;
  }
}
