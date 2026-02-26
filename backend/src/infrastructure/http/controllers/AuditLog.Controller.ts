import { Request, Response, NextFunction } from 'express';
import { GetAuditLogsUseCase } from '../../../application/use-cases/audit/GetAuditLogs.UseCase.js';

export class AuditLogController {
  constructor(private readonly getAuditLogsUseCase: GetAuditLogsUseCase) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Math.max(1, Number(req.query['page']) || 1);
      const limit = Math.min(100, Math.max(1, Number(req.query['limit']) || 50));
      const rawAction = req.query['action'];
      const actions = rawAction === undefined
        ? undefined
        : Array.isArray(rawAction)
          ? (rawAction as string[]).filter(Boolean)
          : [rawAction as string];
      const result = await this.getAuditLogsUseCase.execute({
        tenantId: req.auth!.tenantId,
        page,
        limit,
        actions: actions?.length ? actions : undefined,
        entityType: req.query['entityType'] as string | undefined,
        userId: req.query['userId'] as string | undefined,
        startDate: req.query['startDate'] as string | undefined,
        endDate: req.query['endDate'] as string | undefined,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
