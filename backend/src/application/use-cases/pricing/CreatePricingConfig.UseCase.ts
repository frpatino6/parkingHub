import { UseCase } from '../../interfaces/use-case.interface.js';
import { CreatePricingConfigDto } from '../../dtos/create-pricing-config.dto.js';
import { PricingConfigRepository } from '../../../domain/ports/pricing-config.repository.port.js';
import { AuditLogRepository } from '../../../domain/ports/audit-log.repository.port.js';
import { PricingConfig } from '../../../domain/entities/pricing-config.entity.js';
import { AuditLog } from '../../../domain/entities/audit-log.entity.js';
import { AuditAction } from '../../../domain/enums/audit-action.enum.js';
import { Money } from '../../../domain/value-objects/money.value-object.js';

export class CreatePricingConfigUseCase implements UseCase<CreatePricingConfigDto, PricingConfig> {
  constructor(
    private readonly pricingConfigRepo: PricingConfigRepository,
    private readonly auditLogRepo: AuditLogRepository,
  ) {}

  async execute(dto: CreatePricingConfigDto): Promise<PricingConfig> {
    // Deactivate the current active config for this branch + vehicleType (only one active at a time)
    const existing = await this.pricingConfigRepo.findActive(dto.branchId, dto.vehicleType);
    if (existing) {
      existing.deactivate();
      await this.pricingConfigRepo.update(existing);
    }

    const config = new PricingConfig({
      tenantId: dto.tenantId,
      branchId: dto.branchId,
      vehicleType: dto.vehicleType,
      mode: dto.mode,
      ratePerUnit: new Money(dto.ratePerUnit),
      gracePeriodMinutes: dto.gracePeriodMinutes,
      dayMaxRate: dto.dayMaxRate !== undefined ? new Money(dto.dayMaxRate) : undefined,
      blockSizeMinutes: dto.blockSizeMinutes,
      active: true,
    });

    const saved = await this.pricingConfigRepo.create(config);

    await this.auditLogRepo.create(
      new AuditLog({
        tenantId: dto.tenantId,
        branchId: dto.branchId,
        userId: dto.userId,
        action: AuditAction.PRICING_CONFIG_UPDATED,
        entityType: 'PricingConfig',
        entityId: saved.id!,
        metadata: {
          vehicleType: dto.vehicleType,
          mode: dto.mode,
          ratePerUnit: dto.ratePerUnit,
          gracePeriodMinutes: dto.gracePeriodMinutes,
        },
      }),
    );

    return saved;
  }
}
