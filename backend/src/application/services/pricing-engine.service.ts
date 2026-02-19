import { PricingConfig } from '../../domain/entities/PricingConfig.Entity.js';
import { PricingMode } from '../../domain/enums/pricing-mode.enum.js';
import { Money } from '../../domain/value-objects/money.value-object.js';

/**
 * Pure application service — no infrastructure dependencies.
 * Calculates the parking fee given a config and elapsed duration.
 *
 * Modes:
 *   MINUTE   — charge per elapsed minute (after grace period)
 *   FRACTION — charge per started 15-minute fraction (Colombian "fracción de hora")
 *   BLOCK    — charge per started block of `blockSizeMinutes`
 *
 * dayMaxRate caps the total if present.
 */
export class PricingEngineService {
  calculate(config: PricingConfig, durationMinutes: number): Money {
    const billableMinutes = Math.max(0, durationMinutes - config.gracePeriodMinutes);

    if (billableMinutes === 0) return Money.zero();

    let amount: Money;

    switch (config.mode) {
      case PricingMode.MINUTE: {
        amount = new Money(billableMinutes * config.ratePerUnit.amount);
        break;
      }
      case PricingMode.FRACTION: {
        // Standard Colombian "fracción": charge per started 15-minute period
        const fractions = Math.ceil(billableMinutes / 15);
        amount = new Money(fractions * config.ratePerUnit.amount);
        break;
      }
      case PricingMode.BLOCK: {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const blocks = Math.ceil(billableMinutes / config.blockSizeMinutes!);
        amount = new Money(blocks * config.ratePerUnit.amount);
        break;
      }
    }

    if (config.dayMaxRate && amount.isGreaterThan(config.dayMaxRate)) {
      return config.dayMaxRate;
    }

    return amount;
  }
}
