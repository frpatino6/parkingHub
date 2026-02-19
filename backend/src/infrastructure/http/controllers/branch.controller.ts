import { Request, Response, NextFunction } from 'express';
import { CreateBranchUseCase } from '../../../application/use-cases/branch/create-branch.use-case.js';

export class BranchController {
  constructor(private readonly createBranchUseCase: CreateBranchUseCase) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branch = await this.createBranchUseCase.execute({
        tenantId: req.auth!.tenantId,
        createdBy: req.auth!.userId,
        name: req.body.name as string,
        address: req.body.address as string,
      });
      res.status(201).json({
        id: branch.id,
        tenantId: branch.tenantId,
        name: branch.name,
        address: branch.address,
        active: branch.active,
      });
    } catch (err) {
      next(err);
    }
  };
}
