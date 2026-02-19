import { Router } from 'express';
import { z } from 'zod';
import { CashCutController } from '../controllers/CashCut.Controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireRole } from '../middlewares/auth.middleware.js';
import { UserRole } from '../../../domain/enums/user-role.enum.js';

const closeSchema = z.object({
  reportedCash: z.number().int().nonnegative(),
});

export function createCashCutRoutes(controller: CashCutController): Router {
  const router = Router();
  router.get('/current', controller.getCurrent);
  router.post('/open', requireRole(UserRole.OPERATOR, UserRole.SUPER_ADMIN), controller.open);
  router.post('/close', requireRole(UserRole.OPERATOR, UserRole.SUPER_ADMIN), validate(closeSchema), controller.close);
  return router;
}
