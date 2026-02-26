import { Router, RequestHandler } from 'express';
import { z } from 'zod';
import { BranchController } from '../controllers/Branch.Controller.js';
import { validate } from '../middlewares/validate.middleware.js';

const createBranchSchema = z.object({
  name: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
  totalSpots: z.number().int().positive().optional(),
});

const updateBranchSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  address: z.string().min(1).max(500).optional(),
  active: z.boolean().optional(),
  totalSpots: z.number().int().positive().optional(),
});

export function createBranchRoutes(controller: BranchController, adminOnly: RequestHandler): Router {
  const router = Router();
  router.get('/', controller.listByTenant);
  router.post('/', adminOnly, validate(createBranchSchema), controller.create);
  router.patch('/:id', adminOnly, validate(updateBranchSchema), controller.update);
  return router;
}

