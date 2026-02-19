import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../tokens/api.config';
import { CashCutRepositoryPort } from '../../domain/ports/CashCutRepository.Port';
import { CashCut } from '../../domain/entities/CashCut.model';

@Injectable()
export class HttpCashCutRepository extends CashCutRepositoryPort {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  override getCurrent(): Observable<CashCut> {
    return this.http.get<CashCut>(`${this.baseUrl}/cash-cuts/current`);
  }

  override open(): Observable<CashCut> {
    return this.http.post<CashCut>(`${this.baseUrl}/cash-cuts/open`, {});
  }

  override close(reportedCash: number): Observable<CashCut> {
    return this.http.post<CashCut>(`${this.baseUrl}/cash-cuts/close`, { reportedCash });
  }
}
