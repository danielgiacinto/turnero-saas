import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { IdPaletaTema, ModoTema } from '../../../../core/models/paleta-tema.model';
import { TemaPanelService } from '../../../../core/services/tema-panel.service';

@Component({
  selector: 'app-configuracion-apariencia',
  imports: [RouterLink],
  templateUrl: './apariencia.component.html',
  styleUrl: './apariencia.component.scss',
})
export class ConfiguracionAparienciaComponent {
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
