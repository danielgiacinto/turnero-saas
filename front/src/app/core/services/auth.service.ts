import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CompletarInvitacion,
  ComercioSesion,
  InvitacionInfo,
  ListadoProfesionales,
  DisponibilidadComercio,
  RegistroComercio,
  ResultadoAutenticacion,
  ResultadoRegistroPendiente,
  ResultadoReenvioCodigo,
  Sesion,
  UsuarioSesion,
} from '../models/usuario.model';

interface RespuestaApi<T> {
  datos: T;
}

const CLAVE_TOKEN = 'turnero-staff-token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly baseUrl = `${environment.apiUrl}/auth/staff`;

  private readonly usuarioSignal = signal<UsuarioSesion | null>(null);
  private readonly comercioSignal = signal<ComercioSesion | null>(null);
  private token: string | null = null;

  readonly usuario = this.usuarioSignal.asReadonly();
  readonly comercio = this.comercioSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.usuarioSignal() !== null);

  constructor() {
    this.token = this.leerToken();
  }

  private get esNavegador(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  private leerToken(): string | null {
    if (!this.esNavegador) {
      return null;
    }
    return localStorage.getItem(CLAVE_TOKEN);
  }

  private guardarSesion(resultado: ResultadoAutenticacion): void {
    this.token = resultado.token;
    if (this.esNavegador) {
      localStorage.setItem(CLAVE_TOKEN, resultado.token);
    }
    this.usuarioSignal.set(resultado.usuario);
    this.comercioSignal.set(resultado.comercio);
  }

  obtenerToken(): string | null {
    return this.token;
  }

  tieneToken(): boolean {
    return this.token !== null;
  }

  tieneSesionActiva(): boolean {
    return this.estaAutenticado();
  }

  registrar(dto: RegistroComercio): Observable<ResultadoRegistroPendiente> {
    return this.http
      .post<RespuestaApi<ResultadoRegistroPendiente>>(`${this.baseUrl}/registro`, dto)
      .pipe(map((res) => res.datos));
  }

  verificarDisponibilidadComercio(
    url?: string,
    nombre?: string,
  ): Observable<DisponibilidadComercio> {
    const params: Record<string, string> = {};
    if (url) {
      params['url'] = url;
    }
    if (nombre) {
      params['nombre'] = nombre;
    }
    return this.http
      .get<RespuestaApi<DisponibilidadComercio>>(`${this.baseUrl}/disponibilidad-comercio`, {
        params,
      })
      .pipe(map((res) => res.datos));
  }

  verificarEmail(email: string, codigo: string): Observable<ResultadoAutenticacion> {
    return this.http
      .post<RespuestaApi<ResultadoAutenticacion>>(`${this.baseUrl}/verificar-email`, { email, codigo })
      .pipe(
        tap((res) => this.guardarSesion(res.datos)),
        map((res) => res.datos),
      );
  }

  reenviarCodigo(email: string): Observable<ResultadoReenvioCodigo> {
    return this.http
      .post<RespuestaApi<ResultadoReenvioCodigo>>(`${this.baseUrl}/reenviar-codigo`, { email })
      .pipe(map((res) => res.datos));
  }

  login(email: string, password: string): Observable<ResultadoAutenticacion> {
    return this.http
      .post<RespuestaApi<ResultadoAutenticacion>>(`${this.baseUrl}/login`, { email, password })
      .pipe(
        tap((res) => this.guardarSesion(res.datos)),
        map((res) => res.datos),
      );
  }

  loginGoogle(idToken: string): Observable<ResultadoAutenticacion> {
    return this.http
      .post<RespuestaApi<ResultadoAutenticacion>>(`${this.baseUrl}/google`, { idToken })
      .pipe(
        tap((res) => this.guardarSesion(res.datos)),
        map((res) => res.datos),
      );
  }

  restaurarSesion(): Observable<Sesion> {
    return this.http.get<RespuestaApi<Sesion>>(`${this.baseUrl}/me`).pipe(
      tap((res) => {
        this.usuarioSignal.set(res.datos.usuario);
        this.comercioSignal.set(res.datos.comercio);
      }),
      map((res) => res.datos),
    );
  }

  obtenerInvitacion(token: string): Observable<InvitacionInfo> {
    return this.http
      .get<RespuestaApi<InvitacionInfo>>(`${this.baseUrl}/invitacion/${token}`)
      .pipe(map((res) => res.datos));
  }

  completarInvitacion(token: string, dto: CompletarInvitacion): Observable<ResultadoAutenticacion> {
    return this.http
      .post<RespuestaApi<ResultadoAutenticacion>>(`${this.baseUrl}/invitacion/${token}/completar`, dto)
      .pipe(
        tap((res) => this.guardarSesion(res.datos)),
        map((res) => res.datos),
      );
  }

  invitar(email: string): Observable<{ email: string; link: string }> {
    return this.http
      .post<RespuestaApi<{ email: string; link: string }>>(`${this.baseUrl}/invitar`, { email })
      .pipe(map((res) => res.datos));
  }

  listarProfesionales(): Observable<ListadoProfesionales> {
    return this.http
      .get<RespuestaApi<ListadoProfesionales>>(`${this.baseUrl}/profesionales`)
      .pipe(map((res) => res.datos));
  }

  cerrarSesion(): void {
    this.token = null;
    this.usuarioSignal.set(null);
    this.comercioSignal.set(null);
    if (this.esNavegador) {
      localStorage.removeItem(CLAVE_TOKEN);
    }
  }
}
