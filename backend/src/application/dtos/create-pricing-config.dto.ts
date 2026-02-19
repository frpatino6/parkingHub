import { VehicleType } from '../../domain/enums/vehicle-type.enum.js';
import { PricingMode } from '../../domain/enums/pricing-mode.enum.js';

export interface CreatePricingConfigDto {
  /** Extracted from JWT — never from request body */
  tenantId: string;
  branchId: string;
  /** Creator user id — for audit log */
  userId: string;
  vehicleType: VehicleType;
  mode: PricingMode;
  /** Rate per unit in integer COP */
  ratePerUnit: number;
  gracePeriodMinutes: number;
  /** Optional daily cap in integer COP */
  dayMaxRate?: number;
  /** Required when mode === BLOCK */
  blockSizeMinutes?: number;
}
