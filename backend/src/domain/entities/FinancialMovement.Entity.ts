import { Money } from '../value-objects/money.value-object.js';

export enum FinancialMovementType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}

export enum FinancialMovementCategory {
  SUPPLIES = 'SUPPLIES',
  SERVICES = 'SERVICES',
  FUEL = 'FUEL',
  EXTRA_INCOME = 'EXTRA_INCOME',
  OTHER = 'OTHER',
}

export interface FinancialMovementProps {
  id?: string;
  tenantId: string;
  branchId: string;
  cashCutId: string;
  operatorId: string;
  type: FinancialMovementType;
  category: FinancialMovementCategory;
  description: string;
  amount: Money;
  createdAt?: Date;
}

export class FinancialMovement {
  private readonly _id?: string;
  private readonly _props: FinancialMovementProps;

  constructor(props: FinancialMovementProps) {
    this._id = props.id;
    this._props = {
      ...props,
      createdAt: props.createdAt ?? new Date(),
    };
  }

  get id(): string | undefined { return this._id; }
  get tenantId(): string { return this._props.tenantId; }
  get branchId(): string { return this._props.branchId; }
  get cashCutId(): string { return this._props.cashCutId; }
  get operatorId(): string { return this._props.operatorId; }
  get type(): FinancialMovementType { return this._props.type; }
  get category(): FinancialMovementCategory { return this._props.category; }
  get description(): string { return this._props.description; }
  get amount(): Money { return this._props.amount; }
  get createdAt(): Date { return this._props.createdAt!; }
}
