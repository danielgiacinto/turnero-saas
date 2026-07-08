import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { GuardarServicio, Servicio } from '../models/servicio.model';

interface RespuestaApi<T> {
  datos: T;
}

@Injectable({ providedIn: 'root' })
export class ServicioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/servicios`;

  listar(): Observable<Servicio[]> {
    return this.http
      .get<RespuestaApi<Servicio[]>>(this.baseUrl)
      .pipe(map((res) => res.datos));
  }

  crear(dto: GuardarServicio): Observable<Servicio> {
    return this.http
      .post<RespuestaApi<Servicio>>(this.baseUrl, dto)
      .pipe(map((res) => res.datos));
  }

  actualizar(id: string, dto: GuardarServicio): Observable<Servicio> {
    return this.http
      .put<RespuestaApi<Servicio>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.datos));
  }
}
