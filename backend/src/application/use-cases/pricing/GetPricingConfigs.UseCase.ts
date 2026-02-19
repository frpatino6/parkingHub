import { PricingConfigRepository } from '../../../domain/ports/PricingConfigRepository.Port.js';
import { PricingConfig } from '../../../domain/entities/PricingConfig.Entity.js';

export class GetPricingConfigsUseCase {
  constructor(private readonly pricingConfigRepository: PricingConfigRepository) {}

  async execute(branchId: string): Promise<PricingConfig[]> {
    return this.pricingConfigRepository.findByBranch(branchId);
  }
}
