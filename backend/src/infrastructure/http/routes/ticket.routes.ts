import { Router } from 'express';
import { z } from 'zod';
import { TicketController } from '../controllers/Ticket.Controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum.js';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum.js';

const checkInSchema = z.object({
  vehicleType: z.nativeEnum(VehicleType),
  plate: z.string().min(1).max(10).toUpperCase(),
});

const checkOutSchema = z.object({
  qrCode: z.string().min(1),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

const cancelSchema = z.object({
  reason: z.string().min(1).max(500),
});

export function createTicketRoutes(controller: TicketController): Router {
  const router = Router();
  // GET /api/tickets/qr/:qrCode → get ticket info & current fee
  router.get('/qr/:qrCode', controller.getByQr);
  // GET /api/tickets/active     → get all active tickets for current branch
  router.get('/active', controller.getActive);
  // GET /api/tickets?plate=XYZ → search history
  router.get('/', controller.getHistory);
  // POST /api/tickets          → check-in
  router.post('/', validate(checkInSchema), controller.checkIn);
  // POST /api/tickets/checkout → check-out (by QR)
  router.post('/checkout', validate(checkOutSchema), controller.checkOut);
  // POST /api/tickets/:id/cancel
  router.post('/:id/cancel', validate(cancelSchema), controller.cancel);
  return router;
}
