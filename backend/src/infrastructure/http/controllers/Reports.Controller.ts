import { Request, Response, NextFunction } from 'express';
import { ExportTicketsReportUseCase } from '../../../application/use-cases/reports/ExportTicketsReport.UseCase.js';
import { ExportCashCutsReportUseCase } from '../../../application/use-cases/reports/ExportCashCutsReport.UseCase.js';
import { ValidationError } from '../../../domain/errors/domain-errors.js';

export class ReportsController {
  constructor(
    private readonly exportTicketsUseCase: ExportTicketsReportUseCase,
    private readonly exportCashCutsUseCase: ExportCashCutsReportUseCase,
  ) {}

  exportTickets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, from, to } = this.parseParams(req);
      const result = await this.exportTicketsUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId,
        from,
        to,
        format: 'csv',
      });
      this.sendFile(res, result);
    } catch (err) {
      next(err);
    }
  };

  exportCashCuts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { branchId, from, to } = this.parseParams(req);
      const result = await this.exportCashCutsUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId,
        from,
        to,
        format: 'csv',
      });
      this.sendFile(res, result);
    } catch (err) {
      next(err);
    }
  };

  private parseParams(req: Request): { branchId: string; from: Date; to: Date } {
    const branchId = req.query['branchId'] as string;
    const fromStr = req.query['from'] as string;
    const toStr = req.query['to'] as string;

    if (!branchId || !fromStr || !toStr) {
      throw new ValidationError('branchId, from, and to query params are required');
    }

    const from = new Date(fromStr);
    const to = new Date(toStr);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new ValidationError('from and to must be valid ISO dates');
    }

    return { branchId, from, to };
  }

  private sendFile(
    res: Response,
    result: { buffer: Buffer; contentType: string; filename: string },
  ): void {
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.send(result.buffer);
  }
}
