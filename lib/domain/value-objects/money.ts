export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'MXN'
  ) {
    if (amount < 0) throw new Error('Amount cannot be negative')
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch')
    return new Money(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch')
    return new Money(this.amount - other.amount, this.currency)
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency)
  }

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) throw new Error('Currency mismatch')
    return this.amount > other.amount
  }

  isZero(): boolean {
    return this.amount === 0
  }

  format(): string {
    return `$${this.amount.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  static zero(currency: string = 'MXN'): Money {
    return new Money(0, currency)
  }

  static fromCents(cents: number, currency: string = 'MXN'): Money {
    return new Money(cents / 100, currency)
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency
  }
}
