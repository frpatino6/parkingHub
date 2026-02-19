import { CashCut } from '../entities/CashCut.Entity.js';
import { CashCutStatus } from '../enums/cash-cut-status.enum.js';

export interface CashCutRepository {
  findById(id: string): Promise<CashCut | null>;
  /** Returns the currently OPEN cash cut for the given operator at a branch, if any. */
  findOpenByOperator(branchId: string, operatorId: string): Promise<CashCut | null>;
  findByBranch(branchId: string, status?: CashCutStatus): Promise<CashCut[]>;
  create(cashCut: CashCut): Promise<CashCut>;
  update(cashCut: CashCut): Promise<CashCut>;
}
