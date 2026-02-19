import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';
import { TicketRepositoryPort } from '../../domain/ports/TicketRepository.Port';
import { CheckInRequest } from '../../domain/ports/TicketRepository.Port';
import { CheckInResult } from '../../domain/entities/CheckInResult.model';
import { TicketInfo } from '../../domain/entities/TicketInfo.model';
import { PaymentMethod } from '../../domain/enums/PaymentMethod.enum';

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

  override findByQr(qrCode: string): Observable<TicketInfo> {
    return this.http.get<TicketInfo>(`${this.baseUrl}/tickets/qr/${qrCode}`);
  }

  override checkOut(qrCode: string, paymentMethod: PaymentMethod): Observable<TicketInfo> {
    return this.http.post<TicketInfo>(`${this.baseUrl}/tickets/checkout`, {
      qrCode,
      paymentMethod,
    });
  }
}
