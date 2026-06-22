import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import {
  CLAVE_STORAGE_MODO,
  CLAVE_STORAGE_PALETA,
  IdPaletaTema,
  MODO_PREDETERMINADO_PANEL,
  ModoTema,
  PALETA_PREDETERMINADA,
  PALETAS_DISPONIBLES,
  OpcionPaleta,
} from '../models/paleta-tema.model';

@Injectable({ providedIn: 'root' })
export class TemaPanelService {
  private readonly platformId = inject(PLATFORM_ID);

  readonly paletas = PALETAS_DISPONIBLES;
  readonly paletaActual = signal<IdPaletaTema>(PALETA_PREDETERMINADA);
  readonly modoActual = signal<ModoTema>(MODO_PREDETERMINADO_PANEL);

  constructor() {
    this.cargarPreferencias();
  }

  establecerPaleta(id: IdPaletaTema): void {
    this.paletaActual.set(id);
    this.guardarPreferencias();
  }

  establecerModo(modo: ModoTema): void {
    this.modoActual.set(modo);
    this.guardarPreferencias();
  }

  alternarModo(): void {
    this.establecerModo(this.modoActual() === 'oscuro' ? 'claro' : 'oscuro');
  }

  /** Aplica data-tema y data-modo en el host del layout panel. */
  aplicarEnElemento(elemento: HTMLElement): void {
    if (!elemento) {
      return;
    }
    elemento.classList.add('panel-comercio');
    elemento.setAttribute('data-tema', this.paletaActual());
    elemento.setAttribute('data-modo', this.modoActual());
  }

  sincronizarElemento(elemento: HTMLElement): void {
    if (!elemento) {
      return;
    }
    elemento.setAttribute('data-tema', this.paletaActual());
    elemento.setAttribute('data-modo', this.modoActual());
  }

  obtenerOpcionPaleta(id: IdPaletaTema): OpcionPaleta | undefined {
    return this.paletas.find((p) => p.id === id);
  }

  private cargarPreferencias(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    const paleta = localStorage.getItem(CLAVE_STORAGE_PALETA) as IdPaletaTema | null;
    const modo = localStorage.getItem(CLAVE_STORAGE_MODO) as ModoTema | null;
    if (paleta && this.esPaletaValida(paleta)) {
      this.paletaActual.set(paleta);
    }
    if (modo === 'claro' || modo === 'oscuro') {
      this.modoActual.set(modo);
    }
  }

  private guardarPreferencias(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    localStorage.setItem(CLAVE_STORAGE_PALETA, this.paletaActual());
    localStorage.setItem(CLAVE_STORAGE_MODO, this.modoActual());
  }

  private esPaletaValida(id: string): id is IdPaletaTema {
    return id === 'lima' || id === 'naranja' || id === 'violeta';
  }
}
