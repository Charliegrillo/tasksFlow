'use client'

import { useState, useEffect } from 'react'
import { X, Archive, RotateCcw } from 'lucide-react'
import type { Board } from '@/lib/db'

interface ArchivedBoardsModalProps {
  open: boolean
  spaceId: number | null
  onClose: () => void
  onRestore: (board: Board) => void
}

export function ArchivedBoardsModal({ open, spaceId, onClose, onRestore }: ArchivedBoardsModalProps) {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open || !spaceId) return
    setLoading(true)
    fetch(`/api/boards?spaceId=${spaceId}&archived=true`)
      .then(r => r.json())
      .then(d => setBoards(d.data ?? []))
      .finally(() => setLoading(false))
  }, [open, spaceId])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-sm border border-border bg-card p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Archive className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Tableros archivados</h2>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar">
            <X className="size-4" />
          </button>
        </div>
        <div className="mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Cargando...</p>
          ) : boards.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay tableros archivados.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {boards.map(board => (
                <div key={board.id} className="flex items-center justify-between rounded-sm border border-border px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{board.name}</p>
                    <p className="text-xs text-muted-foreground">{board.type === 'roadmap' ? 'Roadmap' : 'Mantenimiento'}</p>
                  </div>
                  <button
                    onClick={() => onRestore(board)}
                    className="ml-2 shrink-0 rounded-sm border border-border p-1.5 text-muted-foreground transition hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-500"
                    aria-label={`Restaurar tablero ${board.name}`}
                    title="Restaurar"
                  >
                    <RotateCcw className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
