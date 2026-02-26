import { Router } from 'express';
import { z } from 'zod';
import { AuthController } from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.middleware.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export function createAuthRoutes(controller: AuthController): Router {
  const router = Router();
  router.post('/login', validate(loginSchema), controller.login);
  router.post('/refresh', validate(refreshSchema), controller.refresh);
  return router;
}
