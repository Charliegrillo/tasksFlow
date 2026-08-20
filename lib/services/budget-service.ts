import type { IBudgetRepository } from '@/lib/repositories/budget-repository'
import type { CreateBudgetItemInput, UpdateBudgetItemInput, CreateBudgetPaymentInput, UpdateBudgetInput } from '@/lib/types'
import type { BoardBudget, BudgetItem, BudgetPayment } from '@/lib/domain/entities/budget'

export interface BudgetWithDetails {
  budget: BoardBudget
  items: BudgetItem[]
  payments: BudgetPayment[]
  subtotal: number
  taxes: number
  totalPaid: number
  balance: number
}

export class BudgetService {
  constructor(private budgetRepo: IBudgetRepository) {}

  async getOrCreate(boardId: number): Promise<BoardBudget> {
    let budget = await this.budgetRepo.findByBoardId(boardId)
    if (!budget) {
      budget = await this.budgetRepo.create(boardId)
    }
    return budget
  }

  async getWithDetails(boardId: number): Promise<BudgetWithDetails> {
    const budget = await this.getOrCreate(boardId)
    const [items, payments] = await Promise.all([
      this.budgetRepo.findItems(budget.id),
      this.budgetRepo.findPayments(budget.id)
    ])

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const taxes = subtotal * (budget.taxRate / 100)
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const balance = Math.max(subtotal + taxes - totalPaid, 0)

    return { budget, items, payments, subtotal, taxes, totalPaid, balance }
  }

  async update(boardId: number, data: UpdateBudgetInput): Promise<BoardBudget> {
    const budget = await this.getOrCreate(boardId)
    const updated = await this.budgetRepo.update(budget.id, data)
    return updated!
  }

  async addItem(data: CreateBudgetItemInput): Promise<BudgetItem> {
    if (!data.description?.trim()) throw new Error('Description is required')
    return this.budgetRepo.createItem(data)
  }

  async updateItem(id: number, data: UpdateBudgetItemInput): Promise<BudgetItem | null> {
    return this.budgetRepo.updateItem(id, data)
  }

  async deleteItem(id: number): Promise<boolean> {
    return this.budgetRepo.deleteItem(id)
  }

  async addPayment(data: CreateBudgetPaymentInput): Promise<BudgetPayment> {
    if (data.amount <= 0) throw new Error('Payment amount must be positive')
    return this.budgetRepo.createPayment(data)
  }

  async deletePayment(id: number): Promise<boolean> {
    return this.budgetRepo.deletePayment(id)
  }
}
