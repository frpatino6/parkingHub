import { Request, Response, NextFunction } from 'express';
import { CashCutRepository } from '../../../domain/ports/CashCutRepository.Port.js';

/**
 * HTTP middleware that rejects requests early if the operator
 * does not have an OPEN CashCut for the current branch.
 * Applied to /tickets routes (check-in, check-out, etc.).
 */
export function requireOpenCashCut(cashCutRepo: CashCutRepository) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.auth?.branchId) {
      res.status(400).json({ error: 'Branch context required for this operation' });
      return;
    }

    const cashCut = await cashCutRepo.findOpenByOperator(req.auth.branchId, req.auth.userId);
    if (!cashCut) {
      res.status(409).json({
        error: 'Debes abrir tu caja (turno) antes de realizar operaciones de tickets.',
        code: 'CASH_CUT_NOT_OPEN',
      });
      return;
    }

    next();
  };
}
