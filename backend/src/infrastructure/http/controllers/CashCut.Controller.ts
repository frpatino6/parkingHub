import { Request, Response, NextFunction } from 'express';
import { OpenCashCutUseCase } from '../../../application/use-cases/cash-cut/OpenCashCut.UseCase.js';
import { CloseCashCutUseCase } from '../../../application/use-cases/cash-cut/CloseCashCut.UseCase.js';
import { GetCurrentCashCutUseCase } from '../../../application/use-cases/cash-cut/GetCurrentCashCut.UseCase.js';
import { CashCut } from '../../../domain/entities/CashCut.Entity.js';

export class CashCutController {
  constructor(
    private readonly openCashCutUseCase: OpenCashCutUseCase,
    private readonly closeCashCutUseCase: CloseCashCutUseCase,
    private readonly getCurrentCashCutUseCase: GetCurrentCashCutUseCase,
  ) {}

  getCurrent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cashCut = await this.getCurrentCashCutUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId: req.auth!.branchId!,
        operatorId: req.auth!.userId,
      });
      res.json(this.toResponse(cashCut));
    } catch (err) {
      next(err);
    }
  };

  open = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cashCut = await this.openCashCutUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId: req.auth!.branchId!,
        operatorId: req.auth!.userId,
      });
      res.status(201).json(this.toResponse(cashCut));
    } catch (err) {
      next(err);
    }
  };

  close = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const cashCut = await this.closeCashCutUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId: req.auth!.branchId!,
        operatorId: req.auth!.userId,
        reportedCash: req.body.reportedCash as number,
      });
      res.json(this.toResponse(cashCut));
    } catch (err) {
      next(err);
    }
  };

  private toResponse(cashCut: CashCut) {
    return {
      id: cashCut.id,
      status: cashCut.status,
      openedAt: cashCut.openedAt,
      closedAt: cashCut.closedAt,
      totalSalesCOP: cashCut.totalSales.amount,
      totalCashCOP: cashCut.totalCash.amount,
      totalElectronicCOP: cashCut.totalElectronic.amount,
      reportedCashCOP: cashCut.reportedCash?.amount,
      discrepancyCOP: cashCut.discrepancyCOP,
    };
  }
}
