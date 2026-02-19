import { Request, Response, NextFunction } from 'express';
import { CheckInUseCase } from '../../../application/use-cases/ticket/check-in.use-case.js';
import { CheckOutUseCase } from '../../../application/use-cases/ticket/check-out.use-case.js';
import { CancelTicketUseCase } from '../../../application/use-cases/ticket/cancel-ticket.use-case.js';
import { Ticket } from '../../../domain/entities/ticket.entity.js';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum.js';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum.js';

export class TicketController {
  constructor(
    private readonly checkInUseCase: CheckInUseCase,
    private readonly checkOutUseCase: CheckOutUseCase,
    private readonly cancelTicketUseCase: CancelTicketUseCase,
  ) {}

  checkIn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.checkInUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId: req.auth!.branchId!,
        operatorId: req.auth!.userId,
        vehicleType: req.body.vehicleType as VehicleType,
        plate: req.body.plate as string,
      });
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };

  checkOut = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.checkOutUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId: req.auth!.branchId!,
        operatorId: req.auth!.userId,
        qrCode: req.body.qrCode as string,
        paymentMethod: req.body.paymentMethod as PaymentMethod,
      });
      res.json(this.toTicketResponse(ticket));
    } catch (err) {
      next(err);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const ticket = await this.cancelTicketUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId: req.auth!.branchId!,
        operatorId: req.auth!.userId,
        ticketId: req.params['id'] as string,
        reason: req.body.reason as string,
      });
      res.json(this.toTicketResponse(ticket));
    } catch (err) {
      next(err);
    }
  };

  private toTicketResponse(ticket: Ticket) {
    return {
      id: ticket.id,
      plate: ticket.plate,
      vehicleType: ticket.vehicleType,
      status: ticket.status,
      checkIn: ticket.checkIn,
      checkOut: ticket.checkOut,
      amountCOP: ticket.amount?.amount,
      paymentMethod: ticket.paymentMethod,
      qrCode: ticket.qrCode,
    };
  }
}
