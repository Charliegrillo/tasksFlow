'use client'

import { useState } from 'react'
import { X, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { Board, BoardPaymentStatus } from '@/lib/db'

const statusConfig: Record<BoardPaymentStatus, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
  pagado: { label: 'Pagado', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  cancelado: { label: 'Cancelado', icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10' },
  pendiente: { label: 'Pendiente', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
}

type Props = { boards: Board[]; onClose: () => void; onUpdate: (id: number, paymentStatus: BoardPaymentStatus) => void }

export function ArchivePanel({ boards, onClose, onUpdate }: Props) {
  const [filter, setFilter] = useState<'all' | BoardPaymentStatus>('all')
  const archived = boards.filter(b => b.paymentStatus !== 'pendiente')
  const filtered = filter === 'all' ? archived : archived.filter(b => b.paymentStatus === filter)

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-sm border border-border bg-card p-6 shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Tableros Archivados</h2>
            <p className="text-xs text-muted-foreground">Gestiona tableros pagados o cancelados</p>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-4 flex gap-2">
          {(['all', 'pagado', 'cancelado'] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-sm px-3 py-1.5 text-xs font-medium ${filter === s ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/80'}`}>
              {s === 'all' ? 'Todos' : statusConfig[s].label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex-1 overflow-y-auto">
          {filtered.map(board => {
            const cfg = statusConfig[board.paymentStatus]
            const Icon = cfg.icon
            return (
              <div key={board.id} className="flex items-center gap-3 rounded-sm border border-border px-3 py-2.5 mb-1.5">
                <div className={`grid size-8 place-items-center rounded-sm ${cfg.bg}`}><Icon className={`size-4 ${cfg.color}`} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{board.name}</p>
                  <p className="text-[10px] text-muted-foreground capitalize">{cfg.label}</p>
                </div>
                <div className="flex gap-1">
                  {board.paymentStatus !== 'pendiente' && (
                    <button onClick={() => onUpdate(board.id, 'pendiente')} className="rounded-sm border border-border px-2 py-1 text-[10px] font-medium text-muted-foreground hover:bg-secondary" title="Restaurar a pendiente">
                      Restaurar
                    </button>
                  )}
                  {board.paymentStatus === 'pendiente' && (
                    <>
                      <button onClick={() => onUpdate(board.id, 'pagado')} className="rounded-sm border border-border px-2 py-1 text-[10px] font-medium text-emerald-500 hover:bg-emerald-500/10">Pagado</button>
                      <button onClick={() => onUpdate(board.id, 'cancelado')} className="rounded-sm border border-border px-2 py-1 text-[10px] font-medium text-destructive hover:bg-destructive/10">Cancelado</button>
                    </>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <p className="mt-4 text-center text-sm text-muted-foreground">No hay tableros archivados.</p>}
        </div>
      </div>
    </div>
  )
}
