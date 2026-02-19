import { Schema, model, HydratedDocument } from 'mongoose';
import { VehicleType } from '../../../domain/enums/vehicle-type.enum.js';
import { TicketStatus } from '../../../domain/enums/ticket-status.enum.js';
import { PaymentMethod } from '../../../domain/enums/payment-method.enum.js';

interface ITicketDoc {
  tenantId: string;
  branchId: string;
  operatorId: string;
  vehicleType: VehicleType;
  plate: string;
  qrCode: string;
  status: TicketStatus;
  checkIn: Date;
  checkOut?: Date;
  /** Stored as integer COP; undefined until ticket is paid */
  amountCOP?: number;
  paymentMethod?: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
}

const ticketSchema = new Schema<ITicketDoc>(
  {
    tenantId: { type: String, required: true, index: true },
    branchId: { type: String, required: true },
    operatorId: { type: String, required: true },
    vehicleType: { type: String, enum: Object.values(VehicleType), required: true },
    plate: { type: String, required: true, uppercase: true, trim: true },
    qrCode: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: Object.values(TicketStatus),
      required: true,
      default: TicketStatus.OPEN,
    },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date },
    amountCOP: { type: Number },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod) },
  },
  { timestamps: true },
);

// ESR rule: equality (branchId), sort/range (status, checkIn)
ticketSchema.index({ branchId: 1, status: 1 });
ticketSchema.index({ tenantId: 1, branchId: 1, checkIn: -1 });

export type TicketDoc = HydratedDocument<ITicketDoc>;
export const TicketModel = model<ITicketDoc>('Ticket', ticketSchema);
