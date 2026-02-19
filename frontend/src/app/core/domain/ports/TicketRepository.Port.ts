import { Observable } from 'rxjs';
import { CheckInResult } from '../entities/CheckInResult.model';
import { TicketInfo } from '../entities/TicketInfo.model';
import { VehicleType } from '../enums/VehicleType.enum';
import { PaymentMethod } from '../enums/PaymentMethod.enum';

export interface CheckInRequest {
  plate: string;
  vehicleType: VehicleType;
}

/**
 * Port for ticket operations. Implemented by HttpTicketRepository.
 * tenantId, branchId, operatorId are extracted from JWT in the HTTP layer.
 */
export abstract class TicketRepositoryPort {
  abstract checkIn(request: CheckInRequest): Observable<CheckInResult>;
  abstract findByQr(qrCode: string): Observable<TicketInfo>;
  abstract checkOut(qrCode: string, paymentMethod: PaymentMethod): Observable<TicketInfo>;
}
