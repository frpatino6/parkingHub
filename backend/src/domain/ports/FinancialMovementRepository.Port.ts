import { FinancialMovement } from '../entities/FinancialMovement.Entity.js';

export interface FinancialMovementRepository {
  findById(id: string): Promise<FinancialMovement | null>;
  findByCashCut(cashCutId: string): Promise<FinancialMovement[]>;
  findByRange(branchId: string, start: Date, end: Date): Promise<FinancialMovement[]>;
  create(movement: FinancialMovement): Promise<FinancialMovement>;
}
