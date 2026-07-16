import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ClienteDetalle,
  ClienteListado,
  ClienteResumen,
  GuardarCliente,
} from '../models/cliente.model';

interface RespuestaApi<T> {
  datos: T;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  buscarPorEmail(email: string): Observable<ClienteResumen | null> {
    const params = new HttpParams().set('email', email);
    return this.http
      .get<RespuestaApi<ClienteResumen | null>>(`${this.baseUrl}/buscar`, { params })
      .pipe(map((res) => res.datos));
  }

  listar(busqueda?: string): Observable<ClienteListado[]> {
    let params = new HttpParams();
    if (busqueda?.trim()) {
      params = params.set('q', busqueda.trim());
    }
    return this.http
      .get<RespuestaApi<ClienteListado[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.datos));
  }

  obtener(id: string): Observable<ClienteDetalle> {
    return this.http
      .get<RespuestaApi<ClienteDetalle>>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res.datos));
  }

  crear(dto: GuardarCliente): Observable<ClienteResumen> {
    return this.http
      .post<RespuestaApi<ClienteResumen>>(this.baseUrl, dto)
      .pipe(map((res) => res.datos));
  }

  actualizar(id: string, dto: GuardarCliente): Observable<ClienteResumen> {
    return this.http
      .put<RespuestaApi<ClienteResumen>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.datos));
  }
}
