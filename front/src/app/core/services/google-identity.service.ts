import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

import { environment } from '../../../environments/environment';

interface CredencialGoogle {
  credential: string;
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string;
    callback: (respuesta: CredencialGoogle) => void;
  }): void;
  renderButton(elemento: HTMLElement, opciones: Record<string, unknown>): void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } };
  }
}

const URL_SCRIPT_GSI = 'https://accounts.google.com/gsi/client';

@Injectable({ providedIn: 'root' })
export class GoogleIdentityService {
  private readonly platformId = inject(PLATFORM_ID);
  private cargaPromesa: Promise<void> | null = null;

  get estaConfigurado(): boolean {
    return Boolean(environment.googleClientId);
  }

  private cargarScript(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.reject(new Error('Google Identity solo funciona en el navegador.'));
    }
    if (window.google?.accounts?.id) {
      return Promise.resolve();
    }
    if (this.cargaPromesa) {
      return this.cargaPromesa;
    }

    this.cargaPromesa = new Promise<void>((resolver, rechazar) => {
      const script = document.createElement('script');
      script.src = URL_SCRIPT_GSI;
      script.async = true;
      script.defer = true;
      script.onload = () => resolver();
      script.onerror = () => rechazar(new Error('No se pudo cargar Google Identity.'));
      document.head.appendChild(script);
    });

    return this.cargaPromesa;
  }

  async renderizarBoton(
    contenedor: HTMLElement,
    onCredential: (idToken: string) => void,
  ): Promise<void> {
    if (!this.estaConfigurado) {
      return;
    }
    await this.cargarScript();
    const id = window.google?.accounts.id;
    if (!id) {
      return;
    }
    id.initialize({
      client_id: environment.googleClientId,
      callback: (respuesta) => onCredential(respuesta.credential),
    });
    id.renderButton(contenedor, { theme: 'outline', size: 'large', width: 280 });
  }
}
