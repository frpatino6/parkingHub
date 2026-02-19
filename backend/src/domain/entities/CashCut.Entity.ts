import { Money } from '../value-objects/money.value-object.js';
import { CashCutStatus } from '../enums/cash-cut-status.enum.js';
import { ValidationError } from '../errors/domain-errors.js';

export interface CashCutProps {
  id?: string;
  tenantId: string;
  branchId: string;
  operatorId: string;
  status: CashCutStatus;
  openedAt: Date;
  closedAt?: Date;
  /** Running sum of all PAID ticket amounts during this period */
  totalSales: Money;
  /** Cash amount reported by operator at close time */
  reportedCash?: Money;
  /**
   * Signed difference: reportedCash.amount - totalSales.amount (COP).
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
  get reportedCash(): Money | undefined { return this._props.reportedCash; }
  get discrepancyCOP(): number | undefined { return this._props.discrepancyCOP; }
  get createdAt(): Date | undefined { return this._props.createdAt; }
  get updatedAt(): Date | undefined { return this._props.updatedAt; }

  isOpen(): boolean {
    return this._props.status === CashCutStatus.OPEN;
  }

  /** Accumulates a paid ticket's amount into totalSales. */
  addSale(amount: Money): void {
    if (!this.isOpen()) {
      throw new ValidationError('Cannot add sales to a closed cash cut');
    }
    this._props.totalSales = this._props.totalSales.add(amount);
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
    this._props.discrepancyCOP = reportedCash.amount - this._props.totalSales.amount;
    this._props.updatedAt = new Date();
  }
}
