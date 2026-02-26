import { Router } from 'express';
import { ReportsController } from '../controllers/Reports.Controller.js';

export function createReportsRoutes(controller: ReportsController): Router {
  const router = Router();
  router.get('/tickets', controller.exportTickets);
  router.get('/cash-cuts', controller.exportCashCuts);
  return router;
}
