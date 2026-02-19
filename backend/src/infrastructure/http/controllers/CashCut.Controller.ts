import { Request, Response, NextFunction } from 'express';
import { OpenCashCutUseCase } from '../../../application/use-cases/cash-cut/OpenCashCut.UseCase.js';
import { CloseCashCutUseCase } from '../../../application/use-cases/cash-cut/CloseCashCut.UseCase.js';
import { GetCurrentCashCutUseCase } from '../../../application/use-cases/cash-cut/GetCurrentCashCut.UseCase.js';
import { CreateFinancialMovementUseCase } from '../../../application/use-cases/cash-cut/CreateFinancialMovement.UseCase.js';
import { GetFinancialMovementsUseCase } from '../../../application/use-cases/cash-cut/GetFinancialMovements.UseCase.js';
import { GetMovementsReportUseCase } from '../../../application/use-cases/financial/GetMovementsReport.UseCase.js';
import { CashCut } from '../../../domain/entities/CashCut.Entity.js';
import { FinancialMovement } from '../../../domain/entities/FinancialMovement.Entity.js';

export class CashCutController {
  constructor(
    private readonly openCashCutUseCase: OpenCashCutUseCase,
    private readonly closeCashCutUseCase: CloseCashCutUseCase,
    private readonly getCurrentCashCutUseCase: GetCurrentCashCutUseCase,
    private readonly createMovementUseCase: CreateFinancialMovementUseCase,
    private readonly getMovementsUseCase: GetFinancialMovementsUseCase,
    private readonly getMovementsReportUseCase: GetMovementsReportUseCase,
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

  addMovement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const movement = await this.createMovementUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId: req.auth!.branchId!,
        operatorId: req.auth!.userId,
        type: req.body.type,
        category: req.body.category,
        description: req.body.description,
        amount: req.body.amount,
      });
      res.status(201).json(this.movementToResponse(movement));
    } catch (err) {
      next(err);
    }
  };

  getMovements = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const movements = await this.getMovementsUseCase.execute(req.params['id'] as string);
      res.json(movements.map((m: FinancialMovement) => this.movementToResponse(m)));
    } catch (err) {
      next(err);
    }
  };

  getReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const startDate = new Date(req.query['startDate'] as string);
      const endDate = new Date(req.query['endDate'] as string);
      
      const movements = await this.getMovementsReportUseCase.execute({
        branchId: req.auth!.branchId!,
        startDate,
        endDate,
      });
      
      res.json(movements.map((m: FinancialMovement) => this.movementToResponse(m)));
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
      totalManualCreditsCOP: cashCut.totalManualCredits.amount,
      totalManualDebitsCOP: cashCut.totalManualDebits.amount,
      reportedCashCOP: cashCut.reportedCash?.amount,
      discrepancyCOP: cashCut.discrepancyCOP,
    };
  }

  private movementToResponse(movement: FinancialMovement) {
    return {
      id: movement.id,
      type: movement.type,
      category: movement.category,
      description: movement.description,
      amountCOP: movement.amount.amount,
      createdAt: movement.createdAt,
    };
  }
}
