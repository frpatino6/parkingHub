import { Observable } from 'rxjs';
import { CheckInResult } from '../entities/CheckInResult.model';
import { VehicleType } from '../enums/VehicleType.enum';

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
}
