import { Request, Response, NextFunction } from 'express';
import { CheckInUseCase } from '../../../application/use-cases/ticket/CheckIn.UseCase.js';
import { CheckOutUseCase } from '../../../application/use-cases/ticket/CheckOut.UseCase.js';
import { GetTicketByQrUseCase } from '../../../application/use-cases/ticket/GetTicketByQr.UseCase.js';
import { GetActiveTicketsUseCase } from '../../../application/use-cases/ticket/GetActiveTickets.UseCase.js';
import { CancelTicketUseCase } from '../../../application/use-cases/ticket/CancelTicket.UseCase.js';
import { GetTicketsByPlateUseCase } from '../../../application/use-cases/ticket/GetTicketsByPlate.UseCase.js';
import { Ticket } from '../../../domain/entities/Ticket.Entity.js';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum.js';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum.js';

export class TicketController {
  constructor(
    private readonly checkInUseCase: CheckInUseCase,
    private readonly checkOutUseCase: CheckOutUseCase,
    private readonly getTicketByQrUseCase: GetTicketByQrUseCase,
    private readonly getActiveTicketsUseCase: GetActiveTicketsUseCase,
    private readonly cancelTicketUseCase: CancelTicketUseCase,
    private readonly getTicketsByPlateUseCase: GetTicketsByPlateUseCase,
  ) {}

  getByQr = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.getTicketByQrUseCase.execute({
        tenantId: req.auth!.tenantId,
        branchId: req.auth!.branchId!,
        qrCode: req.params['qrCode'] as string,
      });
      res.json(result);
    } catch (err) {
      next(err);
    }
  };

  getActive = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tickets = await this.getActiveTicketsUseCase.execute();
      res.json(tickets.map(t => ({
        ...this.toTicketResponse(t),
        durationMinutes: t.getDurationMinutes()
      })));
    } catch (err) {
      next(err);
    }
  };


  getHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const plate = req.query.plate as string;
      const tickets = await this.getTicketsByPlateUseCase.execute({ plate });
      res.json(tickets.map(t => ({
        ...this.toTicketResponse(t),
        durationMinutes: t.getDurationMinutes()
      })));
    } catch (err) {
      next(err);
    }
  };

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
