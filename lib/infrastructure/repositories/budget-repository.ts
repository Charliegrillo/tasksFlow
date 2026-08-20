import { db } from '@/lib/infrastructure/database/connection'
import { mapBudget, mapBudgetItem, mapBudgetPayment } from '@/lib/infrastructure/database/mappers'
import type { IBudgetRepository } from '@/lib/repositories/budget-repository'
import type { BoardBudget, BudgetItem, BudgetPayment } from '@/lib/domain/entities/budget'
import type { CreateBudgetItemInput, UpdateBudgetItemInput, CreateBudgetPaymentInput, UpdateBudgetInput } from '@/lib/types'

export class BudgetRepository implements IBudgetRepository {
  async findByBoardId(boardId: number): Promise<BoardBudget | null> {
    const row = await db.prepare('SELECT * FROM board_budgets WHERE board_id=?').get(boardId)
    return row ? mapBudget(row) : null
  }

  async findById(id: number): Promise<BoardBudget | null> {
    const row = await db.prepare('SELECT * FROM board_budgets WHERE id=?').get(id)
    return row ? mapBudget(row) : null
  }

  async create(boardId: number): Promise<BoardBudget> {
    const result = await db.prepare('INSERT INTO board_budgets (board_id) VALUES (?)').run(boardId)
    return mapBudget(await db.prepare('SELECT * FROM board_budgets WHERE id=?').get(result.lastInsertRowid)!)
  }

  async update(id: number, data: UpdateBudgetInput): Promise<BoardBudget | null> {
    const budget = await this.findById(id)
    if (!budget) return null
    const next = {
      estimatedTotal: data.estimatedTotal ?? budget.estimatedTotal,
      actualTotal: data.actualTotal ?? budget.actualTotal,
      notes: data.notes ?? budget.notes,
      taxRate: data.taxRate ?? budget.taxRate,
      bankName: data.bankName ?? budget.bankName,
      accountHolder: data.accountHolder ?? budget.accountHolder,
      accountNumber: data.accountNumber ?? budget.accountNumber,
      clabe: data.clabe ?? budget.clabe,
      clientName: data.clientName ?? budget.clientName,
      projectName: data.projectName ?? budget.projectName,
      projectDate: data.projectDate ?? budget.projectDate,
    }
    await db.prepare('UPDATE board_budgets SET estimated_total=?, actual_total=?, notes=?, tax_rate=?, bank_name=?, account_holder=?, account_number=?, clabe=?, client_name=?, project_name=?, project_date=? WHERE id=?')
      .run(next.estimatedTotal, next.actualTotal, next.notes, next.taxRate, next.bankName, next.accountHolder, next.accountNumber, next.clabe, next.clientName, next.projectName, next.projectDate, id)
    return mapBudget(await db.prepare('SELECT * FROM board_budgets WHERE id=?').get(id)!)
  }

  async delete(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM board_budgets WHERE id=?').run(id)).changes > 0
  }

  async findItems(budgetId: number): Promise<BudgetItem[]> {
    return (await db.prepare('SELECT * FROM budget_items WHERE budget_id=? ORDER BY id ASC').all(budgetId)).map(mapBudgetItem)
  }

  async findItemById(id: number): Promise<BudgetItem | null> {
    const row = await db.prepare('SELECT * FROM budget_items WHERE id=?').get(id)
    return row ? mapBudgetItem(row) : null
  }

  async createItem(data: CreateBudgetItemInput): Promise<BudgetItem> {
    const result = await db.prepare('INSERT INTO budget_items (budget_id, type, description, amount) VALUES (?, ?, ?, ?)')
      .run(data.budgetId, data.type ?? 'task', data.description.trim(), data.amount ?? 0)
    return mapBudgetItem(await db.prepare('SELECT * FROM budget_items WHERE id=?').get(result.lastInsertRowid)!)
  }

  async updateItem(id: number, data: UpdateBudgetItemInput): Promise<BudgetItem | null> {
    const existing = await db.prepare('SELECT * FROM budget_items WHERE id=?').get(id)
    if (!existing) return null
    const next = {
      type: (data.type ?? existing.type) as string,
      description: (data.description ?? existing.description) as string,
      amount: (data.amount ?? existing.amount) as number,
    }
    await db.prepare('UPDATE budget_items SET type=?, description=?, amount=? WHERE id=?')
      .run(next.type, next.description.trim(), next.amount, id)
    return mapBudgetItem(await db.prepare('SELECT * FROM budget_items WHERE id=?').get(id)!)
  }

  async deleteItem(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM budget_items WHERE id=?').run(id)).changes > 0
  }

  async findPayments(budgetId: number): Promise<BudgetPayment[]> {
    return (await db.prepare('SELECT * FROM budget_payments WHERE budget_id=? ORDER BY date DESC').all(budgetId)).map(mapBudgetPayment)
  }

  async findPaymentById(id: number): Promise<BudgetPayment | null> {
    const row = await db.prepare('SELECT * FROM budget_payments WHERE id=?').get(id)
    return row ? mapBudgetPayment(row) : null
  }

  async createPayment(data: CreateBudgetPaymentInput): Promise<BudgetPayment> {
    const result = await db.prepare('INSERT INTO budget_payments (budget_id, amount, description, date) VALUES (?, ?, ?, ?)')
      .run(data.budgetId, data.amount, data.description ?? '', data.date ?? new Date().toISOString().slice(0, 10))
    return mapBudgetPayment(await db.prepare('SELECT * FROM budget_payments WHERE id=?').get(result.lastInsertRowid)!)
  }

  async deletePayment(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM budget_payments WHERE id=?').run(id)).changes > 0
  }
}
