import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly autenticado = signal(false);
  private token: string | null = null;

  readonly estaAutenticado = this.autenticado.asReadonly();

  iniciarSesion(token: string): void {
    // TODO: persistir token en storage
    this.token = token;
    this.autenticado.set(true);
  }

  cerrarSesion(): void {
    this.token = null;
    this.autenticado.set(false);
  }

  obtenerToken(): string | null {
    return this.token;
  }

  tieneSesionActiva(): boolean {
    return this.autenticado();
  }
}
