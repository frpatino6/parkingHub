import { VehicleType } from '../enums/vehicle-type.enum.js';
import { PricingMode } from '../enums/pricing-mode.enum.js';
import { Money } from '../value-objects/money.value-object.js';
import { ValidationError } from '../errors/domain-errors.js';

export interface PricingConfigProps {
  id?: string;
  tenantId: string;
  branchId: string;
  vehicleType: VehicleType;
  mode: PricingMode;
  /** Rate charged per unit (minute / fraction / block) in COP */
  ratePerUnit: Money;
  /** Initial minutes during which no fee is charged (0 = no grace period) */
  gracePeriodMinutes: number;
  /** Maximum amount charged in a single day in COP; undefined = no cap */
  dayMaxRate?: Money;
  /** Required when mode === BLOCK: size of each billing block in minutes */
  blockSizeMinutes?: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class PricingConfig {
  private readonly _id?: string;
  private readonly _props: PricingConfigProps;

  constructor(props: PricingConfigProps) {
    if (props.mode === PricingMode.BLOCK && !props.blockSizeMinutes) {
      throw new ValidationError('blockSizeMinutes is required for BLOCK pricing mode');
    }
    this._id = props.id;
    this._props = {
      ...props,
      gracePeriodMinutes: props.gracePeriodMinutes ?? 0,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  get id(): string | undefined { return this._id; }
  get tenantId(): string { return this._props.tenantId; }
  get branchId(): string { return this._props.branchId; }
  get vehicleType(): VehicleType { return this._props.vehicleType; }
  get mode(): PricingMode { return this._props.mode; }
  get ratePerUnit(): Money { return this._props.ratePerUnit; }
  get gracePeriodMinutes(): number { return this._props.gracePeriodMinutes; }
  get dayMaxRate(): Money | undefined { return this._props.dayMaxRate; }
  get blockSizeMinutes(): number | undefined { return this._props.blockSizeMinutes; }
  get active(): boolean { return this._props.active; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  activate(): void {
    this._props.active = true;
    this._props.updatedAt = new Date();
  }

  deactivate(): void {
    this._props.active = false;
    this._props.updatedAt = new Date();
  }
}
