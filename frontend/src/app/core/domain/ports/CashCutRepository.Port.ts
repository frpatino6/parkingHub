import { Observable } from 'rxjs';
import { CashCut } from '../entities/CashCut.model';

export abstract class CashCutRepositoryPort {
  abstract getCurrent(): Observable<CashCut>;
  abstract open(): Observable<CashCut>;
  abstract close(reportedCash: number): Observable<CashCut>;
}
