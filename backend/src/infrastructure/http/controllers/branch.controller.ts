import { Request, Response, NextFunction } from 'express';
import { CreateBranchUseCase } from '../../../application/use-cases/branch/CreateBranch.UseCase.js';
import { GetBranchesByTenantUseCase } from '../../../application/use-cases/branch/GetBranchesByTenant.UseCase.js';
import { Branch } from '../../../domain/entities/Branch.Entity.js';

export class BranchController {
  constructor(
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly getBranchesByTenantUseCase: GetBranchesByTenantUseCase
  ) {}

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

  listByTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log(`[BranchController] Listing branches for tenant: ${req.auth!.tenantId}`);
      const branches = await this.getBranchesByTenantUseCase.execute(req.auth!.tenantId);
      console.log(`[BranchController] Found ${branches.length} branches`);
      res.json(branches.map((b: Branch) => ({
        id: b.id,
        name: b.name,
        address: b.address,
        active: b.active
      })));
    } catch (err) {
      console.error('[BranchController] Error listing branches:', err);
      next(err);
    }
  };
}
