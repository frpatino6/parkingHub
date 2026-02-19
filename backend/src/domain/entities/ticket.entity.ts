import { VehicleType } from '../enums/vehicle-type.enum.js';
import { TicketStatus } from '../enums/ticket-status.enum.js';
import { PaymentMethod } from '../enums/payment-method.enum.js';
import { Money } from '../value-objects/money.value-object.js';
import { ValidationError } from '../errors/domain-errors.js';

export interface TicketProps {
  id?: string;
  tenantId: string;
  branchId: string;
  operatorId: string;
  vehicleType: VehicleType;
  plate: string;
  qrCode: string;
  status: TicketStatus;
  checkIn: Date;
  checkOut?: Date;
  amount?: Money;
  paymentMethod?: PaymentMethod;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Ticket {
  private readonly _id?: string;
  private readonly _props: TicketProps;

  constructor(props: TicketProps) {
    this._id = props.id;
    this._props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  static createNew(params: {
    tenantId: string;
    branchId: string;
    operatorId: string;
    vehicleType: VehicleType;
    plate: string;
    qrCode: string;
  }): Ticket {
    return new Ticket({
      ...params,
      status: TicketStatus.OPEN,
      checkIn: new Date(),
    });
  }

  get id(): string | undefined { return this._id; }
  get tenantId(): string { return this._props.tenantId; }
  get branchId(): string { return this._props.branchId; }
  get operatorId(): string { return this._props.operatorId; }
  get vehicleType(): VehicleType { return this._props.vehicleType; }
  get plate(): string { return this._props.plate; }
  get qrCode(): string { return this._props.qrCode; }
  get status(): TicketStatus { return this._props.status; }
  get checkIn(): Date { return this._props.checkIn; }
  get checkOut(): Date | undefined { return this._props.checkOut; }
  get amount(): Money | undefined { return this._props.amount; }
  get paymentMethod(): PaymentMethod | undefined { return this._props.paymentMethod; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  isOpen(): boolean {
    return this._props.status === TicketStatus.OPEN;
  }

  isPaid(): boolean {
    return this._props.status === TicketStatus.PAID;
  }

  /**
   * Registers payment and closes the ticket.
   * Called by the checkout use case after the pricing engine calculates the amount.
   */
  checkout(amount: Money, paymentMethod: PaymentMethod): void {
    if (!this.isOpen()) {
      throw new ValidationError(`Cannot checkout ticket with status '${this._props.status}'`);
    }
    this._props.status = TicketStatus.PAID;
    this._props.checkOut = new Date();
    this._props.amount = amount;
    this._props.paymentMethod = paymentMethod;
    this._props.updatedAt = new Date();
  }

  cancel(): void {
    if (!this.isOpen()) {
      throw new ValidationError(`Cannot cancel ticket with status '${this._props.status}'`);
    }
    this._props.status = TicketStatus.CANCELLED;
    this._props.updatedAt = new Date();
  }

  /** Returns elapsed time in minutes (uses checkOut if present, otherwise now). */
  getDurationMinutes(): number {
    const end = this._props.checkOut ?? new Date();
    return Math.floor((end.getTime() - this._props.checkIn.getTime()) / 60_000);
  }
}
