import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';
import { TicketRepositoryPort } from '../../domain/ports/TicketRepository.Port';
import { CheckInRequest } from '../../domain/ports/TicketRepository.Port';
import { CheckInResult } from '../../domain/entities/CheckInResult.model';

@Injectable()
export class HttpTicketRepository extends TicketRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  override checkIn(request: CheckInRequest): Observable<CheckInResult> {
    return this.http
      .post<CheckInResult>(`${this.baseUrl}/tickets`, {
        plate: request.plate.trim().toUpperCase(),
        vehicleType: request.vehicleType,
      })
      .pipe(
        map((res) => ({
          ...res,
          plate: res.plate.toUpperCase(),
        })),
      );
  }
}
