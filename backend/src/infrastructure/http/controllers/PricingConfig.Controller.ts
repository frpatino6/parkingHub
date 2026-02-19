import { Request, Response, NextFunction } from 'express';
import { CreatePricingConfigUseCase } from '../../../application/use-cases/pricing/CreatePricingConfig.UseCase.js';
import { GetPricingConfigsUseCase } from '../../../application/use-cases/pricing/GetPricingConfigs.UseCase.js';
import { UpdatePricingConfigUseCase } from '../../../application/use-cases/pricing/UpdatePricingConfig.UseCase.js';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum.js';
import { PricingMode } from '../../../domain/enums/pricing-mode.enum.js';

export class PricingConfigController {
  constructor(
    private readonly createPricingConfigUseCase: CreatePricingConfigUseCase,
    private readonly getPricingConfigsUseCase: GetPricingConfigsUseCase,
    private readonly updatePricingConfigUseCase: UpdatePricingConfigUseCase
  ) {}

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = await this.createPricingConfigUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId: req.body.branchId as string,
        userId: req.auth!.userId,
        vehicleType: req.body.vehicleType as VehicleType,
        mode: req.body.mode as PricingMode,
        ratePerUnit: req.body.ratePerUnit as number,
        gracePeriodMinutes: req.body.gracePeriodMinutes as number,
        dayMaxRate: req.body.dayMaxRate as number | undefined,
        blockSizeMinutes: req.body.blockSizeMinutes as number | undefined,
      });
      res.status(201).json({
        id: config.id,
        branchId: config.branchId,
        vehicleType: config.vehicleType,
        mode: config.mode,
        ratePerUnit: config.ratePerUnit.amount,
        gracePeriodMinutes: config.gracePeriodMinutes,
        dayMaxRate: config.dayMaxRate?.amount,
        blockSizeMinutes: config.blockSizeMinutes,
        active: config.active,
      });
    } catch (err) {
      next(err);
    }
  };

  listByBranch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const branchId = req.query.branchId as string;
      const configs = await this.getPricingConfigsUseCase.execute(branchId);
      res.json(configs.map(c => ({
        id: c.id,
        vehicleType: c.vehicleType,
        mode: c.mode,
        ratePerUnit: c.ratePerUnit.amount,
        gracePeriodMinutes: c.gracePeriodMinutes,
        dayMaxRate: c.dayMaxRate?.amount,
        blockSizeMinutes: c.blockSizeMinutes,
        active: c.active
      })));
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const config = await this.updatePricingConfigUseCase.execute({
        id: req.params.id,
        ...req.body
      });
      res.json({
        id: config.id,
        vehicleType: config.vehicleType,
        mode: config.mode,
        ratePerUnit: config.ratePerUnit.amount,
        gracePeriodMinutes: config.gracePeriodMinutes,
        dayMaxRate: config.dayMaxRate?.amount,
        blockSizeMinutes: config.blockSizeMinutes,
        active: config.active
      });
    } catch (err) {
      next(err);
    }
  };
}
