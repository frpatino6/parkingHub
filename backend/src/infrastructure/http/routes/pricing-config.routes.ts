import { Router } from 'express';
import { z } from 'zod';
import { PricingConfigController } from '../controllers/PricingConfig.Controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum.js';
import { PricingMode } from '../../../domain/enums/pricing-mode.enum.js';

const createPricingConfigSchema = z.object({
  branchId: z.string().min(1),
  vehicleType: z.nativeEnum(VehicleType),
  mode: z.nativeEnum(PricingMode),
  ratePerUnit: z.number().int().nonnegative(),
  gracePeriodMinutes: z.number().int().nonnegative().default(0),
  dayMaxRate: z.number().int().nonnegative().optional(),
  blockSizeMinutes: z.number().int().positive().optional(),
});

export function createPricingConfigRoutes(controller: PricingConfigController): Router {
  const router = Router();
  router.post('/', validate(createPricingConfigSchema), controller.create);
  return router;
}
