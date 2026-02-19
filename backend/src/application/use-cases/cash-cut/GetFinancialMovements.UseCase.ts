import { UseCase } from '../../interfaces/use-case.interface.js';
import { FinancialMovementRepository } from '../../../domain/ports/FinancialMovementRepository.Port.js';
import { FinancialMovement } from '../../../domain/entities/FinancialMovement.Entity.js';

export class GetFinancialMovementsUseCase implements UseCase<string, FinancialMovement[]> {
  constructor(private readonly movementRepo: FinancialMovementRepository) {}

  /** Executes: cashCutId -> FinancialMovement[] */
  async execute(cashCutId: string): Promise<FinancialMovement[]> {
    return this.movementRepo.findByCashCut(cashCutId);
  }
}
