import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import { GuardarHorario, Horario } from '../models/horario.model';

interface RespuestaApi<T> {
  datos: T;
}

@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/horarios`;

  listarDeUsuario(usuarioId: string): Observable<Horario[]> {
    return this.http
      .get<RespuestaApi<Horario[]>>(`${this.baseUrl}/usuario/${usuarioId}`)
      .pipe(map((res) => res.datos));
  }

  crear(dto: GuardarHorario): Observable<Horario> {
    return this.http
      .post<RespuestaApi<Horario>>(this.baseUrl, dto)
      .pipe(map((res) => res.datos));
  }

  actualizar(id: string, dto: GuardarHorario): Observable<Horario> {
    return this.http
      .put<RespuestaApi<Horario>>(`${this.baseUrl}/${id}`, dto)
      .pipe(map((res) => res.datos));
  }

  eliminar(id: string): Observable<{ mensaje: string }> {
    return this.http
      .delete<{ mensaje: string }>(`${this.baseUrl}/${id}`)
      .pipe(map((res) => res));
  }
}
