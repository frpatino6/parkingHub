import { PricingConfig } from '../entities/pricing-config.entity.js';
import { VehicleType } from '../enums/vehicle-type.enum.js';

export interface PricingConfigRepository {
  findById(id: string): Promise<PricingConfig | null>;
  /** Returns the active config for a branch + vehicle type combination. */
  findActive(branchId: string, vehicleType: VehicleType): Promise<PricingConfig | null>;
  findByBranch(branchId: string): Promise<PricingConfig[]>;
  create(config: PricingConfig): Promise<PricingConfig>;
  update(config: PricingConfig): Promise<PricingConfig>;
}
