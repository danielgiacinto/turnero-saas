import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ActualizarComercio,
  ComercioDetalle,
} from '../models/comercio.model';
import { DisponibilidadComercio } from '../models/usuario.model';

interface RespuestaApi<T> {
  datos: T;
}

@Injectable({ providedIn: 'root' })
export class ComercioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/comercio`;
  private readonly authBaseUrl = `${environment.apiUrl}/auth/staff`;

  obtener(): Observable<ComercioDetalle> {
    return this.http
      .get<RespuestaApi<ComercioDetalle>>(this.baseUrl)
      .pipe(map((res) => res.datos));
  }

  actualizar(dto: ActualizarComercio): Observable<ComercioDetalle> {
    return this.http
      .put<RespuestaApi<ComercioDetalle>>(this.baseUrl, dto)
      .pipe(map((res) => res.datos));
  }

  verificarDisponibilidad(
    url?: string,
    nombre?: string,
    excluirComercioId?: string,
  ): Observable<DisponibilidadComercio> {
    let params = new HttpParams();
    if (url) {
      params = params.set('url', url);
    }
    if (nombre) {
      params = params.set('nombre', nombre);
    }
    if (excluirComercioId) {
      params = params.set('excluirComercioId', excluirComercioId);
    }
    return this.http
      .get<RespuestaApi<DisponibilidadComercio>>(
        `${this.authBaseUrl}/disponibilidad-comercio`,
        { params },
      )
      .pipe(map((res) => res.datos));
  }
}
