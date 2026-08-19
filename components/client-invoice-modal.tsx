'use client'

import { useEffect, useState } from 'react'
import { DollarSign, FileText, Image, File, CreditCard, ChevronDown, ChevronRight } from 'lucide-react'
import type { Board, BoardBudget, BudgetItem, BudgetPayment, Client, Space } from '@/lib/db'

const typeConfig: Record<string, { icon: typeof FileText; label: string; color: string }> = {
  task: { icon: FileText, label: 'Tarea', color: 'text-blue-500' },
  document: { icon: FileText, label: 'Documento', color: 'text-amber-500' },
  image: { icon: Image, label: 'Imagen', color: 'text-emerald-500' },
  other: { icon: File, label: 'Otro', color: 'text-muted-foreground' },
}

type BoardWithBudget = {
  board: Board
  budget: BoardBudget | null
  items: BudgetItem[]
  payments: BudgetPayment[]
}

type ClientInvoice = {
  client: Client
  boards: BoardWithBudget[]
  total: number
  paid: number
  pending: number
}

type Props = { clients: Client[] }

export function ClientInvoiceView({ clients }: Props) {
  const [invoices, setInvoices] = useState<ClientInvoice[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedClient, setExpandedClient] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      const result: ClientInvoice[] = []
      for (const client of clients) {
        try {
          const spacesRes = await fetch(`/api/spaces?clientId=${client.id}`)
          const spacesData = await spacesRes.json()
          const clientSpaces: Space[] = spacesData.data ?? []

          const allBoards: BoardWithBudget[] = []
          for (const space of clientSpaces) {
            const boardsRes = await fetch(`/api/boards?spaceId=${space.id}`)
            const boardsData = await boardsRes.json()
            const spaceBoards: Board[] = boardsData.data ?? []

            for (const board of spaceBoards) {
              const budgetRes = await fetch(`/api/budget?boardId=${board.id}`)
              const budgetData = await budgetRes.json()
              const budget: BoardBudget | null = budgetData.data ?? null

              let items: BudgetItem[] = []
              let payments: BudgetPayment[] = []
              if (budget) {
                const itemsRes = await fetch(`/api/budget/items?budgetId=${budget.id}`)
                const itemsData = await itemsRes.json()
                items = itemsData.data ?? []
                const payRes = await fetch(`/api/budget/payments?budgetId=${budget.id}`)
                const payData = await payRes.json()
                payments = payData.data ?? []
              }
              allBoards.push({ board, budget, items, payments })
            }
          }

          const total = allBoards.reduce((s, b) => s + (b.budget?.actualTotal ?? 0), 0)
          const paid = allBoards.reduce((s, b) => {
            if (b.board.paymentStatus !== 'pagado') return s
            return s + b.payments.reduce((ps, p) => ps + p.amount, 0)
          }, 0)
          const pending = allBoards.reduce((s, b) => {
            if (b.board.paymentStatus !== 'pendiente') return s
            const bt = (b.budget?.actualTotal ?? 0)
            const bp = b.payments.reduce((ps, p) => ps + p.amount, 0)
            return s + Math.max(bt - bp, 0)
          }, 0)

          result.push({ client, boards: allBoards, total, paid, pending })
        } catch {
          result.push({ client, boards: [], total: 0, paid: 0, pending: 0 })
        }
      }
      if (!cancelled) {
        setInvoices(result)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [clients])

  const grandTotal = invoices.reduce((s, i) => s + i.total, 0)
  const grandPaid = invoices.reduce((s, i) => s + i.paid, 0)
  const grandPending = invoices.reduce((s, i) => s + i.pending, 0)

  return (
    <div className="px-5 py-6 md:px-10">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-sm border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Total general</p>
          <p className="mt-2 text-2xl font-bold text-foreground">${grandTotal.toLocaleString()}</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pagado</p>
          <p className="mt-2 text-2xl font-bold text-emerald-500">${grandPaid.toLocaleString()}</p>
        </div>
        <div className="rounded-sm border border-border bg-card p-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Pendiente</p>
          <p className="mt-2 text-2xl font-bold text-amber-500">${grandPending.toLocaleString()}</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">Cargando facturas...</div>
      ) : invoices.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted-foreground">No hay clientes con proyectos.</div>
      ) : (
        <div className="mt-5 space-y-3">
          {invoices.map(({ client, boards, total, paid, pending }) => {
            const isExpanded = expandedClient === client.id
            return (
              <div key={client.id} className="rounded-sm border border-border bg-card overflow-hidden">
                <button onClick={() => setExpandedClient(isExpanded ? null : client.id)} className="flex w-full items-center justify-between gap-3 p-4 text-left hover:bg-secondary/30 transition">
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronDown className="size-4 text-muted-foreground" /> : <ChevronRight className="size-4 text-muted-foreground" />}
                    <span className="grid size-8 shrink-0 place-items-center rounded-sm bg-primary/10 text-xs font-bold text-primary">{client.name.slice(0, 2).toUpperCase()}</span>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{client.name}</p>
                      <p className="text-xs text-muted-foreground">{boards.length} proyecto{boards.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-right">
                    <div><p className="text-[10px] text-muted-foreground">Total</p><p className="text-sm font-bold text-foreground">${total.toLocaleString()}</p></div>
                    <div><p className="text-[10px] text-muted-foreground">Pagado</p><p className="text-sm font-semibold text-emerald-500">${paid.toLocaleString()}</p></div>
                    <div><p className="text-[10px] text-muted-foreground">Pendiente</p><p className="text-sm font-semibold text-amber-500">${pending.toLocaleString()}</p></div>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border bg-background/50 p-4 space-y-3">
                    {boards.length === 0 ? (
                      <p className="text-center text-xs text-muted-foreground py-4">No hay proyectos para este cliente.</p>
                    ) : boards.map(({ board, budget, items, payments }) => {
                      const boardPaid = payments.reduce((s, p) => s + p.amount, 0)
                      const boardBalance = Math.max((budget?.actualTotal ?? 0) - boardPaid, 0)
                      const statusColors: Record<string, string> = { pagado: 'bg-emerald-500/10 text-emerald-500', pendiente: 'bg-amber-500/10 text-amber-500', cancelado: 'bg-red-500/10 text-red-500' }
                      return (
                        <div key={board.id} className="rounded-sm border border-border bg-card p-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-semibold text-foreground">{board.name}</h4>
                              <span className={`rounded-sm px-2 py-0.5 text-[10px] font-medium ${statusColors[board.paymentStatus] ?? statusColors.pendiente}`}>{board.paymentStatus}</span>
                            </div>
                            <p className="text-sm font-bold text-foreground">${(budget?.actualTotal ?? 0).toLocaleString()}</p>
                          </div>

                          {items.length > 0 && (
                            <div className="mt-2 overflow-x-auto rounded-sm border border-border">
                              <table className="w-full border-collapse text-left">
                                <thead className="bg-secondary/80">
                                  <tr>
                                    <th className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">#</th>
                                    <th className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Descripción</th>
                                    <th className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Tipo</th>
                                    <th className="px-3 py-1.5 text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Monto</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {items.map((item, i) => (
                                    <tr key={item.id} className="border-t border-border">
                                      <td className="px-3 py-1.5 text-xs text-muted-foreground">{i + 1}</td>
                                      <td className="px-3 py-1.5 text-xs font-medium text-foreground">{item.description}</td>
                                      <td className="px-3 py-1.5 text-xs text-muted-foreground">{typeConfig[item.type]?.label ?? item.type}</td>
                                      <td className="px-3 py-1.5 text-right text-xs font-semibold text-foreground">${item.amount.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                          {payments.length > 0 && (
                            <div className="mt-2">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground mb-1">Abonos</p>
                              <div className="flex flex-wrap gap-2">
                                {payments.map(p => (
                                  <span key={p.id} className="inline-flex items-center gap-1 rounded-sm bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-500">
                                    <CreditCard className="size-2.5" />${p.amount.toLocaleString()}
                                    <span className="text-emerald-500/60">{new Date(p.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {boardBalance > 0 && (
                            <div className="mt-2 flex justify-end">
                              <span className="text-xs font-semibold text-amber-500">Saldo: ${boardBalance.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
