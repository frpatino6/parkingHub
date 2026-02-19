import { Money } from '../value-objects/money.value-object.js';
import { CashCutStatus } from '../enums/cash-cut-status.enum.js';
import { ValidationError } from '../errors/domain-errors.js';
import { PaymentMethod } from '../enums/payment-method.enum.js';

export interface CashCutProps {
  id?: string;
  tenantId: string;
  branchId: string;
  operatorId: string;
  status: CashCutStatus;
  openedAt: Date;
  closedAt?: Date;
  /** Legacy: Running sum of all PAID ticket amounts during this period */
  totalSales: Money;
  /** Running sum of CASH payments */
  totalCash: Money;
  /** Running sum of ELECTRONIC payments (card, qr, etc) */
  totalElectronic: Money;
  /** Cash amount reported by operator at close time */
  reportedCash?: Money;
  /**
   * Signed difference: reportedCash.amount - totalCash.amount (COP).
   * Positive = surplus, negative = deficit.
   */
  discrepancyCOP?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CashCut {
  private readonly _id?: string;
  private readonly _props: CashCutProps;

  constructor(props: CashCutProps) {
    this._id = props.id;
    this._props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
      updatedAt: props.updatedAt ?? new Date(),
    };
  }

  static open(params: {
    tenantId: string;
    branchId: string;
    operatorId: string;
  }): CashCut {
    return new CashCut({
      ...params,
      status: CashCutStatus.OPEN,
      openedAt: new Date(),
      totalSales: Money.zero(), 
      totalCash: Money.zero(),
      totalElectronic: Money.zero(),
    });
  }

  get id(): string | undefined { return this._id; }
  get tenantId(): string { return this._props.tenantId; }
  get branchId(): string { return this._props.branchId; }
  get operatorId(): string { return this._props.operatorId; }
  get status(): CashCutStatus { return this._props.status; }
  get openedAt(): Date { return this._props.openedAt; }
  get closedAt(): Date | undefined { return this._props.closedAt; }
  get totalSales(): Money { return this._props.totalSales; }
  get totalCash(): Money { return this._props.totalCash; }
  get totalElectronic(): Money { return this._props.totalElectronic; }
  get reportedCash(): Money | undefined { return this._props.reportedCash; }
  get discrepancyCOP(): number | undefined { return this._props.discrepancyCOP; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  isOpen(): boolean {
    return this._props.status === CashCutStatus.OPEN;
  }

  /** Accumulates a paid ticket's amount into totalSales and specific method counter. */
  addSale(amount: Money, method: PaymentMethod): void {
    if (!this.isOpen()) {
      throw new ValidationError('Cannot add sales to a closed cash cut');
    }
    // Update legacy Total
    this._props.totalSales = this._props.totalSales.add(amount);

    if (method === PaymentMethod.EFECTIVO) {
      this._props.totalCash = this._props.totalCash.add(amount);
    } else {
      this._props.totalElectronic = this._props.totalElectronic.add(amount);
    }
    
    this._props.updatedAt = new Date();
  }

  /**
   * Closes the cash cut and calculates the discrepancy.
   * discrepancyCOP = reportedCash - totalSales (can be negative).
   */
  close(reportedCash: Money): void {
    if (!this.isOpen()) {
      throw new ValidationError('Cash cut is already closed');
    }
    this._props.status = CashCutStatus.CLOSED;
    this._props.closedAt = new Date();
    this._props.reportedCash = reportedCash;
    // Calculate discrepancy ONLY against CASH sales
    this._props.discrepancyCOP = reportedCash.amount - this._props.totalCash.amount;
    this._props.updatedAt = new Date();
  }
}
