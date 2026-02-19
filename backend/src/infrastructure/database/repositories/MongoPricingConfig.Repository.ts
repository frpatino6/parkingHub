import { PricingConfigRepository } from '../../../domain/ports/PricingConfigRepository.Port.js';
import { PricingConfig } from '../../../domain/entities/PricingConfig.Entity.js';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum.js';
import { Money } from '../../../domain/value-objects/money.value-object.js';
import { PricingConfigModel, PricingConfigDoc } from '../models/pricing-config.model.js';
import { TenantContext } from '../../config/TenantContext.js';

export class MongoPricingConfigRepository implements PricingConfigRepository {
  async findById(id: string): Promise<PricingConfig | null> {
    const doc = await PricingConfigModel.findOne({ _id: id, tenantId: TenantContext.tenantId }).catch(() => null);
    return doc ? this.toDomain(doc) : null;
  }

  async findActive(branchId: string, vehicleType: VehicleType): Promise<PricingConfig | null> {
    const doc = await PricingConfigModel.findOne({
      tenantId: TenantContext.tenantId,
      branchId,
      vehicleType,
      active: true,
    });
    return doc ? this.toDomain(doc) : null;
  }

  async findByBranch(branchId: string): Promise<PricingConfig[]> {
    const docs = await PricingConfigModel.find({ tenantId: TenantContext.tenantId, branchId });
    return docs.map((d) => this.toDomain(d));
  }

  async create(config: PricingConfig): Promise<PricingConfig> {
    const doc = await PricingConfigModel.create({
      tenantId: config.tenantId,
      branchId: config.branchId,
      vehicleType: config.vehicleType,
      mode: config.mode,
      ratePerUnitCOP: config.ratePerUnit.amount,
      gracePeriodMinutes: config.gracePeriodMinutes,
      dayMaxRateCOP: config.dayMaxRate?.amount,
      blockSizeMinutes: config.blockSizeMinutes,
      active: config.active,
    });
    return this.toDomain(doc);
  }

  async update(config: PricingConfig): Promise<PricingConfig> {
    const doc = await PricingConfigModel.findByIdAndUpdate(
      config.id,
      {
        mode: config.mode,
        ratePerUnitCOP: config.ratePerUnit.amount,
        gracePeriodMinutes: config.gracePeriodMinutes,
        dayMaxRateCOP: config.dayMaxRate?.amount,
        blockSizeMinutes: config.blockSizeMinutes,
        active: config.active,
      },
      { new: true },
    );
    if (!doc) throw new Error(`PricingConfig ${config.id} not found for update`);
    return this.toDomain(doc);
  }

  private toDomain(doc: PricingConfigDoc): PricingConfig {
    return new PricingConfig({
      id: doc.id as string,
      tenantId: doc.tenantId,
      branchId: doc.branchId,
      vehicleType: doc.vehicleType,
      mode: doc.mode,
      ratePerUnit: new Money(doc.ratePerUnitCOP),
      gracePeriodMinutes: doc.gracePeriodMinutes,
      dayMaxRate: doc.dayMaxRateCOP !== undefined ? new Money(doc.dayMaxRateCOP) : undefined,
      blockSizeMinutes: doc.blockSizeMinutes,
      active: doc.active,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }
}
