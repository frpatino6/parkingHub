import { SimulatePriceDto, SimulatePriceResult } from '../../dtos/simulate-price.dto.js';
import { PricingConfigRepository } from '../../../domain/ports/PricingConfigRepository.Port.js';
import { PricingEngineService } from '../../services/pricing-engine.service.js';
import { NotFoundError } from '../../../domain/errors/domain-errors.js';

export class SimulatePriceUseCase {
  constructor(
    private readonly pricingConfigRepo: PricingConfigRepository,
    private readonly pricingEngine: PricingEngineService,
  ) {}

  async execute(dto: SimulatePriceDto): Promise<SimulatePriceResult> {
    const config = await this.pricingConfigRepo.findActive(dto.branchId, dto.vehicleType);
    if (!config) {
      throw new NotFoundError('PricingConfig', `${dto.branchId}/${dto.vehicleType}`);
    }

    const amount = this.pricingEngine.calculate(config, dto.durationMinutes);
    const billableMinutes = Math.max(0, dto.durationMinutes - config.gracePeriodMinutes);

    return {
      amountCOP: amount.amount,
      billableMinutes,
      mode: config.mode,
      vehicleType: config.vehicleType,
      gracePeriodMinutes: config.gracePeriodMinutes,
      ratePerUnit: config.ratePerUnit.amount,
      dayMaxRate: config.dayMaxRate?.amount,
      blockSizeMinutes: config.blockSizeMinutes,
    };
  }
}
