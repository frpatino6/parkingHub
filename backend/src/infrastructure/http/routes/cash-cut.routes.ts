import { Router } from 'express';
import { z } from 'zod';
import { CashCutController } from '../controllers/CashCut.Controller.js';
import { validate } from '../middlewares/validate.middleware.js';

const closeSchema = z.object({
  reportedCash: z.number().int().nonnegative(),
});

export function createCashCutRoutes(controller: CashCutController): Router {
  const router = Router();
  router.post('/open', controller.open);
  router.post('/close', validate(closeSchema), controller.close);
  return router;
}
