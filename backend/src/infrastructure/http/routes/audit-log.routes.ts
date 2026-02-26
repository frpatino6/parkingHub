import { Router } from 'express';
import { AuditLogController } from '../controllers/AuditLog.Controller.js';

export function createAuditLogRoutes(controller: AuditLogController): Router {
  const router = Router();
  router.get('/', controller.list);
  return router;
}
