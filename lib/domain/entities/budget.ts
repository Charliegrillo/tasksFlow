import type { BoardPaymentStatus } from '@/lib/types'
import { Money } from '../value-objects/money'

export type BudgetItemType = 'task' | 'document' | 'image' | 'other'

export class BoardBudget {
  constructor(
    public readonly id: number,
    public boardId: number,
    public estimatedTotal: number,
    public actualTotal: number,
    public notes: string,
    public taxRate: number,
    public bankName: string,
    public accountHolder: string,
    public accountNumber: string,
    public clabe: string,
    public clientName: string,
    public projectName: string,
    public projectDate: string,
    public readonly createdAt: Date
  ) {}

  get taxRateDecimal(): number {
    return this.taxRate / 100
  }

  calculateTaxes(subtotal: number): number {
    return subtotal * this.taxRateDecimal
  }

  calculateBalance(subtotal: number, totalPaid: number): number {
    const taxes = this.calculateTaxes(subtotal)
    return Math.max(subtotal + taxes - totalPaid, 0)
  }

  updatePaymentInfo(data: {
    bankName?: string
    accountHolder?: string
    accountNumber?: string
    clabe?: string
  }): void {
    if (data.bankName !== undefined) this.bankName = data.bankName
    if (data.accountHolder !== undefined) this.accountHolder = data.accountHolder
    if (data.accountNumber !== undefined) this.accountNumber = data.accountNumber
    if (data.clabe !== undefined) this.clabe = data.clabe
  }

  updateIdentification(data: {
    clientName?: string
    projectName?: string
    projectDate?: string
  }): void {
    if (data.clientName !== undefined) this.clientName = data.clientName
    if (data.projectName !== undefined) this.projectName = data.projectName
    if (data.projectDate !== undefined) this.projectDate = data.projectDate
  }

  updateTaxRate(rate: number): void {
    if (rate < 0 || rate > 100) throw new Error('Tax rate must be between 0 and 100')
    this.taxRate = rate
  }

  updateNotes(notes: string): void {
    this.notes = notes
  }
}

export class BudgetItem {
  constructor(
    public readonly id: number,
    public budgetId: number,
    public type: BudgetItemType,
    public description: string,
    public amount: number,
    public fileName: string | null,
    public filePath: string | null,
    public readonly createdAt: Date
  ) {}

  get money(): Money {
    return new Money(this.amount)
  }

  updateDescription(description: string): void {
    if (!description.trim()) throw new Error('Description cannot be empty')
    this.description = description.trim()
  }

  updateAmount(amount: number): void {
    if (amount < 0) throw new Error('Amount cannot be negative')
    this.amount = amount
  }

  updateType(type: BudgetItemType): void {
    this.type = type
  }
}

export class BudgetPayment {
  constructor(
    public readonly id: number,
    public budgetId: number,
    public amount: number,
    public description: string,
    public date: string,
    public readonly createdAt: Date
  ) {}

  get money(): Money {
    return new Money(this.amount)
  }

  updateDescription(description: string): void {
    this.description = description
  }

  updateAmount(amount: number): void {
    if (amount <= 0) throw new Error('Payment amount must be positive')
    this.amount = amount
  }
}
