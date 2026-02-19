import { Router } from 'express';
import { z } from 'zod';
import { TicketController } from '../controllers/ticket.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum.js';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum.js';

const checkInSchema = z.object({
  vehicleType: z.nativeEnum(VehicleType),
  plate: z.string().min(1).max(10).toUpperCase(),
});

const checkOutSchema = z.object({
  qrCode: z.string().uuid(),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

const cancelSchema = z.object({
  reason: z.string().min(1).max(500),
});

export function createTicketRoutes(controller: TicketController): Router {
  const router = Router();
  // POST /api/tickets          → check-in
  router.post('/', validate(checkInSchema), controller.checkIn);
  // POST /api/tickets/checkout → check-out (by QR)
  router.post('/checkout', validate(checkOutSchema), controller.checkOut);
  // POST /api/tickets/:id/cancel
  router.post('/:id/cancel', validate(cancelSchema), controller.cancel);
  return router;
}
