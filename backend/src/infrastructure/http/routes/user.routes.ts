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

export function createUserRoutes(controller: UserController): Router {
  const router = Router();
  router.post('/', validate(createUserSchema), controller.create);
  return router;
}
