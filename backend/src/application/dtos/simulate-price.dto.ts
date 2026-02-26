import { VehicleType } from '../../domain/enums/vehicle-type.enum.js';

export interface SimulatePriceDto {
  branchId: string;
  vehicleType: VehicleType;
  durationMinutes: number;
}

export interface SimulatePriceResult {
  amountCOP: number;
  billableMinutes: number;
  mode: string;
  vehicleType: string;
  gracePeriodMinutes: number;
  ratePerUnit: number;
  dayMaxRate?: number;
  blockSizeMinutes?: number;
}
