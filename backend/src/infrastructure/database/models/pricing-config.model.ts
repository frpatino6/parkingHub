import { Schema, model, HydratedDocument } from 'mongoose';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum.js';
import { PricingMode } from '../../../domain/enums/pricing-mode.enum.js';

interface IPricingConfigDoc {
  tenantId: string;
  branchId: string;
  vehicleType: VehicleType;
  mode: PricingMode;
  /** Rate per unit (minute/fraction/block) in integer COP */
  ratePerUnitCOP: number;
  gracePeriodMinutes: number;
  /** Daily cap in integer COP; undefined = no cap */
  dayMaxRateCOP?: number;
  /** Required when mode === BLOCK */
  blockSizeMinutes?: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const pricingConfigSchema = new Schema<IPricingConfigDoc>(
  {
    tenantId: { type: String, required: true },
    branchId: { type: String, required: true },
    vehicleType: { type: String, enum: Object.values(VehicleType), required: true },
    mode: { type: String, enum: Object.values(PricingMode), required: true },
    ratePerUnitCOP: { type: Number, required: true },
    gracePeriodMinutes: { type: Number, required: true, default: 0 },
    dayMaxRateCOP: { type: Number },
    blockSizeMinutes: { type: Number },
    active: { type: Boolean, required: true, default: true },
  },
  { timestamps: true },
);

// ESR: find active config for branch + vehicleType
pricingConfigSchema.index({ branchId: 1, vehicleType: 1, active: 1 });

export type PricingConfigDoc = HydratedDocument<IPricingConfigDoc>;
export const PricingConfigModel = model<IPricingConfigDoc>('PricingConfig', pricingConfigSchema);
