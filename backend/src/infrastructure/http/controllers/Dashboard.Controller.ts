import { Request, Response, NextFunction } from 'express';
import { GetDashboardStatsUseCase } from '../../../application/use-cases/dashboard/GetDashboardStats.UseCase.js';

export class DashboardController {
  constructor(private readonly getDashboardStatsUseCase: GetDashboardStatsUseCase) {}

  getStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query['branchId'] as string;
      const stats = await this.getDashboardStatsUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId,
      });
      res.json(stats);
    } catch (err) {
      next(err);
    }
  };
}
