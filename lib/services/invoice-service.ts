import type { IClientRepository } from '@/lib/repositories/client-repository'
import type { ISpaceRepository } from '@/lib/repositories/space-repository'
import type { IBoardRepository } from '@/lib/repositories/board-repository'
import type { IBudgetRepository } from '@/lib/repositories/budget-repository'
import type { Client } from '@/lib/domain/entities/client'
import type { Board } from '@/lib/domain/entities/board'
import type { BoardBudget, BudgetItem, BudgetPayment } from '@/lib/domain/entities/budget'

export interface ClientInvoice {
  client: Client
  boards: {
    board: Board
    budget: BoardBudget | null
    items: BudgetItem[]
    payments: BudgetPayment[]
    subtotal: number
    taxes: number
    totalPaid: number
    balance: number
  }[]
  totalAllBoards: number
  totalPaid: number
  totalPending: number
}

export class InvoiceService {
  constructor(
    private clientRepo: IClientRepository,
    private spaceRepo: ISpaceRepository,
    private boardRepo: IBoardRepository,
    private budgetRepo: IBudgetRepository
  ) {}

  async getClientInvoices(): Promise<ClientInvoice[]> {
    const clients = await this.clientRepo.findAll()
    const result: ClientInvoice[] = []

    for (const client of clients) {
      const invoice = await this.buildClientInvoice(client)
      if (invoice.boards.length > 0) {
        result.push(invoice)
      }
    }

    return result
  }

  private async buildClientInvoice(client: Client): Promise<ClientInvoice> {
    const spaces = await this.spaceRepo.findByClientId(client.id)
    const boards: ClientInvoice['boards'] = []
    let totalAllBoards = 0
    let totalPaidAll = 0

    for (const space of spaces) {
      const spaceBoards = await this.boardRepo.findBySpaceId(space.id)

      for (const board of spaceBoards) {
        const budget = await this.budgetRepo.findByBoardId(board.id)
        if (!budget) continue

        const [items, payments] = await Promise.all([
          this.budgetRepo.findItems(budget.id),
          this.budgetRepo.findPayments(budget.id)
        ])

        const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
        const taxes = subtotal * (budget.taxRate / 100)
        const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
        const balance = Math.max(subtotal + taxes - totalPaid, 0)

        totalAllBoards += subtotal + taxes
        totalPaidAll += totalPaid

        boards.push({ board, budget, items, payments, subtotal, taxes, totalPaid, balance })
      }
    }

    return {
      client,
      boards,
      totalAllBoards,
      totalPaid: totalPaidAll,
      totalPending: Math.max(totalAllBoards - totalPaidAll, 0)
    }
  }
}
