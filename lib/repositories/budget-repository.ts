import type { BoardBudget, BudgetItem, BudgetPayment } from '@/lib/domain/entities/budget'
import type { CreateBudgetItemInput, UpdateBudgetItemInput, CreateBudgetPaymentInput, UpdateBudgetInput } from '@/lib/types'

export interface IBudgetRepository {
  findByBoardId(boardId: number): Promise<BoardBudget | null>
  findById(id: number): Promise<BoardBudget | null>
  create(boardId: number): Promise<BoardBudget>
  update(id: number, data: UpdateBudgetInput): Promise<BoardBudget | null>
  delete(id: number): Promise<boolean>

  // Items
  findItems(budgetId: number): Promise<BudgetItem[]>
  findItemById(id: number): Promise<BudgetItem | null>
  createItem(data: CreateBudgetItemInput): Promise<BudgetItem>
  updateItem(id: number, data: UpdateBudgetItemInput): Promise<BudgetItem | null>
  deleteItem(id: number): Promise<boolean>

  // Payments
  findPayments(budgetId: number): Promise<BudgetPayment[]>
  findPaymentById(id: number): Promise<BudgetPayment | null>
  createPayment(data: CreateBudgetPaymentInput): Promise<BudgetPayment>
  deletePayment(id: number): Promise<boolean>
}
