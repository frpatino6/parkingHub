import { Router } from 'express';
import { z } from 'zod';
import { UserController } from '../controllers/User.Controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { UserRole } from '../../../domain/enums/user-role.enum.js';

const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.nativeEnum(UserRole),
  branchId: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  role: z.nativeEnum(UserRole).optional(),
  active: z.boolean().optional(),
  branchId: z.string().optional(),
});

const resetPasswordSchema = z.object({
  password: z.string().min(8),
});

export function createUserRoutes(controller: UserController): Router {
  const router = Router();
  router.post('/', validate(createUserSchema), controller.create);
  router.get('/', controller.getAll);
  router.put('/:id', validate(updateUserSchema), controller.update);
  router.patch('/:id/password', validate(resetPasswordSchema), controller.resetPassword);
  return router;
}
