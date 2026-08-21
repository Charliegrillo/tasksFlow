'use client'

import { X } from 'lucide-react'
import type { BoardList } from '@/lib/db'

interface ListMoveDialogProps {
  open: boolean
  listId: number | null
  position: number
  boardLists: BoardList[]
  onSetPosition: (position: number) => void
  onClose: () => void
  onMove: (listId: number, position: number) => void
}

export function ListMoveDialog({ open, listId, position, boardLists, onSetPosition, onClose, onMove }: ListMoveDialogProps) {
  if (!open || !listId) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-3 sm:p-4" role="presentation" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-sm border border-border bg-card p-4 shadow-xl sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Reordenar</p>
            <h3 className="mt-1 text-lg font-semibold">Mover lista</h3>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar mover lista"><X className="size-4" /></button>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">Elige la posición exacta para esta lista dentro del tablero.</p>
        <div className="mt-4 space-y-3">
          <label className="block text-sm font-medium text-foreground">Posición</label>
          <select value={Math.min(Math.max(position, 1), boardLists.length)} onChange={(e) => onSetPosition(Number(e.target.value))} className="w-full rounded-sm border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary">
            {boardLists.map((list, index) => (
              <option key={list.id} value={index + 1}>{`#${index + 1} · ${list.name}`}</option>
            ))}
          </select>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button onClick={onClose} className="rounded-sm border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-secondary">Cancelar</button>
          <button onClick={() => onMove(listId, Math.max(0, position - 1))} className="rounded-sm bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">Mover lista</button>
        </div>
      </div>
    </div>
  )
}
