import { PricingConfigRepository } from '../../../domain/ports/PricingConfigRepository.Port.js';
import { PricingConfig } from '../../../domain/entities/PricingConfig.Entity.js';
import { PricingMode } from '../../../domain/enums/pricing-mode.enum.js';
import { Money } from '../../../domain/value-objects/money.value-object.js';
import { ValidationError } from '../../../domain/errors/domain-errors.js';

export interface UpdatePricingConfigDto {
  id: string;
  mode?: PricingMode;
  ratePerUnit?: number;
  gracePeriodMinutes?: number;
  dayMaxRate?: number;
  blockSizeMinutes?: number;
  active?: boolean;
}

export class UpdatePricingConfigUseCase {
  constructor(private readonly pricingConfigRepository: PricingConfigRepository) {}

  async execute(dto: UpdatePricingConfigDto): Promise<PricingConfig> {
    const existing = await this.pricingConfigRepository.findById(dto.id);
    if (!existing) {
      throw new ValidationError(`Pricing config with ID ${dto.id} not found`);
    }

    const updated = new PricingConfig({
      id: existing.id,
      tenantId: existing.tenantId,
      branchId: existing.branchId,
      vehicleType: existing.vehicleType,
      mode: dto.mode ?? existing.mode,
      ratePerUnit: dto.ratePerUnit !== undefined ? new Money(dto.ratePerUnit) : existing.ratePerUnit,
      gracePeriodMinutes: dto.gracePeriodMinutes ?? existing.gracePeriodMinutes,
      dayMaxRate: dto.dayMaxRate !== undefined ? new Money(dto.dayMaxRate) : existing.dayMaxRate,
      blockSizeMinutes: dto.blockSizeMinutes ?? existing.blockSizeMinutes,
      active: dto.active ?? existing.active,
    });

    return this.pricingConfigRepository.update(updated);
  }
}
