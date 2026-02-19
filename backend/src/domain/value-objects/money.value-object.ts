/**
 * Represents a monetary amount in COP (Colombian Peso).
 * Stored as a non-negative integer to avoid floating-point errors.
 */
export class Money {
  private readonly _amount: number;

  constructor(amount: number) {
    if (!Number.isInteger(amount) || amount < 0) {
      throw new Error(`Money amount must be a non-negative integer in COP, received: ${amount}`);
    }
    this._amount = amount;
  }

  static zero(): Money {
    return new Money(0);
  }

  get amount(): number {
    return this._amount;
  }

  add(other: Money): Money {
    return new Money(this._amount + other._amount);
  }

  subtract(other: Money): Money {
    return new Money(Math.max(0, this._amount - other._amount));
  }

  isGreaterThan(other: Money): boolean {
    return this._amount > other._amount;
  }

  equals(other: Money): boolean {
    return this._amount === other._amount;
  }

  isZero(): boolean {
    return this._amount === 0;
  }
}
