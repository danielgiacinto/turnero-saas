import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { ClienteResumen } from '../models/turno.model';

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
}
