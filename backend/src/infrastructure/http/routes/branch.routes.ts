import { Router } from 'express';
import { z } from 'zod';
import { BranchController } from '../controllers/Branch.Controller.js';
import { validate } from '../middlewares/validate.middleware.js';

const createBranchSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
});

export function createBranchRoutes(controller: BranchController, adminOnly: any): Router {
  const router = Router();
  router.get('/', controller.listByTenant);
  router.post('/', adminOnly, validate(createBranchSchema), controller.create);
  return router;
}
