import { Router } from 'express';
import { z } from 'zod';
import { CashCutController } from '../controllers/CashCut.Controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { requireRole } from '../middlewares/auth.middleware.js';
import { UserRole } from '../../../domain/enums/user-role.enum.js';

const closeSchema = z.object({
  reportedCash: z.number().int().nonnegative(),
});

const movementSchema = z.object({
  type: z.enum(['INCOME', 'EXPENSE']),
  category: z.enum(['SUPPLIES', 'SERVICES', 'FUEL', 'EXTRA_INCOME', 'OTHER']),
  description: z.string().min(1).max(200),
  amount: z.number().int().positive(),
});

export function createCashCutRoutes(controller: CashCutController): Router {
  const router = Router();
  router.get('/current', controller.getCurrent);
  router.post('/open', requireRole(UserRole.OPERATOR, UserRole.SUPER_ADMIN), controller.open);
  router.post('/close', requireRole(UserRole.OPERATOR, UserRole.SUPER_ADMIN), validate(closeSchema), controller.close);
  
  // Manual Movements
  router.post('/movements', requireRole(UserRole.OPERATOR, UserRole.SUPER_ADMIN), validate(movementSchema), controller.addMovement);
  router.get('/movements/report', requireRole(UserRole.PARKING_ADMIN, UserRole.SUPER_ADMIN), controller.getReport);
  router.get('/:id/movements', requireRole(UserRole.OPERATOR, UserRole.PARKING_ADMIN, UserRole.SUPER_ADMIN), controller.getMovements);
  
  return router;
}
