import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  CrearTurno,
  SlotDisponible,
  StaffAtencion,
  TurnoListado,
} from '../models/turno.model';

interface RespuestaApi<T> {
  datos: T;
}

@Injectable({ providedIn: 'root' })
export class TurnoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/turnos`;

  listarStaff(): Observable<StaffAtencion[]> {
    return this.http
      .get<RespuestaApi<StaffAtencion[]>>(`${this.baseUrl}/staff`)
      .pipe(map((res) => res.datos));
  }

  listarDelDia(fecha: string, profesionalId?: string): Observable<TurnoListado[]> {
    let params = new HttpParams().set('fecha', fecha);
    if (profesionalId) {
      params = params.set('profesional_id', profesionalId);
    }
    return this.http
      .get<RespuestaApi<TurnoListado[]>>(this.baseUrl, { params })
      .pipe(map((res) => res.datos));
  }

  disponibilidad(
    servicioId: string,
    fecha: string,
    profesionalId?: string,
  ): Observable<SlotDisponible[]> {
    let params = new HttpParams().set('servicio_id', servicioId).set('fecha', fecha);
    if (profesionalId) {
      params = params.set('profesional_id', profesionalId);
    }
    return this.http
      .get<RespuestaApi<SlotDisponible[]>>(`${this.baseUrl}/disponibilidad`, { params })
      .pipe(map((res) => res.datos));
  }

  crear(dto: CrearTurno): Observable<TurnoListado> {
    return this.http
      .post<RespuestaApi<TurnoListado>>(this.baseUrl, dto)
      .pipe(map((res) => res.datos));
  }

  cancelar(id: string): Observable<{ mensaje: string }> {
    return this.http
      .patch<{ mensaje: string }>(`${this.baseUrl}/${id}/cancelar`, {})
      .pipe(map((res) => res));
  }
}
