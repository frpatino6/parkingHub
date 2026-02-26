import { Request, Response, NextFunction } from 'express';
import { CreateBranchUseCase } from '../../../application/use-cases/branch/CreateBranch.UseCase.js';
import { GetBranchesByTenantUseCase } from '../../../application/use-cases/branch/GetBranchesByTenant.UseCase.js';
import { UpdateBranchUseCase } from '../../../application/use-cases/branch/UpdateBranch.UseCase.js';
import { Branch } from '../../../domain/entities/branch.entity.js';

export class BranchController {
  constructor(
    private readonly createBranchUseCase: CreateBranchUseCase,
    private readonly getBranchesByTenantUseCase: GetBranchesByTenantUseCase,
    private readonly updateBranchUseCase: UpdateBranchUseCase,
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branch = await this.createBranchUseCase.execute({
        tenantId: req.auth!.tenantId,
        createdBy: req.auth!.userId,
        name: req.body.name as string,
        address: req.body.address as string,
        totalSpots: req.body.totalSpots as number | undefined,
      });
      res.status(201).json(this.toResponse(branch));
    } catch (err) {
      next(err);
    }
  };

  listByTenant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branches = await this.getBranchesByTenantUseCase.execute(req.auth!.tenantId);
      res.json(branches.map((b: Branch) => this.toResponse(b)));
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branch = await this.updateBranchUseCase.execute({
        branchId: req.params['id'] as string,
        tenantId: req.auth!.tenantId,
        updatedBy: req.auth!.userId,
        name: req.body.name as string | undefined,
        address: req.body.address as string | undefined,
        active: req.body.active as boolean | undefined,
        totalSpots: req.body.totalSpots as number | undefined,
      });
      res.json(this.toResponse(branch));
    } catch (err) {
      next(err);
    }
  };

  private toResponse(branch: Branch) {
    return {
      id: branch.id,
      tenantId: branch.tenantId,
      name: branch.name,
      address: branch.address,
      active: branch.active,
      totalSpots: branch.totalSpots,
    };
  }
}

