'use client'

import { X } from 'lucide-react'
import type { Board, Milestone, Task } from '@/lib/db'

const statusLabels: Record<string, string> = { backlog: 'Backlog', progress: 'En progreso', review: 'En revisión', done: 'Completado' }
const statusColors: Record<string, string> = { backlog: 'bg-slate-400', progress: 'bg-amber-500', review: 'bg-violet-500', done: 'bg-emerald-500' }
const priorityLabels: Record<string, string> = { low: 'Baja', medium: 'Media', high: 'Alta' }

type Props = { milestone: Milestone; tasks: Task[]; boards: Board[]; onClose: () => void }

export function MilestoneReportModal({ milestone, tasks, boards, onClose }: Props) {
  const msTasks = tasks.filter(t => t.milestoneId === milestone.id)
  const boardMap = Object.fromEntries(boards.map(b => [b.id, b.name]))
  const total = msTasks.length
  const done = msTasks.filter(t => t.status === 'done').length
  const pct = total ? Math.round(done / total * 100) : 0

  const byBoard = msTasks.reduce<Record<number, Task[]>>((acc, t) => { const bid = (t as Task & { boardId?: number }).boardId ?? 0; (acc[bid] ??= []).push(t); return acc }, {})

  function exportCSV() {
    const sep = ';'
    const header = ['Tablero', 'Tarea', 'Estado', 'Prioridad', 'Responsable', 'Fecha límite']
    const rows = msTasks.map(t => {
      const bid = (t as Task & { boardId?: number }).boardId ?? 0
      return [boardMap[bid] ?? `Tablero #${bid}`, t.title, statusLabels[t.status] ?? t.status, priorityLabels[t.priority] ?? t.priority, t.assignee, t.dueDate ?? '']
    })
    const bom = '\uFEFF'
    const csv = bom + [header, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(sep)).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hito-${milestone.name.replace(/\s+/g, '_')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-lg rounded-sm border border-border bg-card p-6 shadow-xl max-h-[80vh] flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className={`size-3 shrink-0 rounded-sm ${milestone.color}`} />
            <div>
              <h2 className="text-lg font-semibold">{milestone.name}</h2>
              <p className="text-xs text-muted-foreground">Reporte de hito a nivel de cliente</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar">
            <X className="size-4" />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-sm border border-border p-3 text-center">
            <p className="text-2xl font-bold">{total}</p>
            <p className="text-xs text-muted-foreground">Tareas</p>
          </div>
          <div className="rounded-sm border border-border p-3 text-center">
            <p className="text-2xl font-bold text-emerald-500">{done}</p>
            <p className="text-xs text-muted-foreground">Completadas</p>
          </div>
          <div className="rounded-sm border border-border p-3 text-center">
            <p className="text-2xl font-bold">{pct}%</p>
            <p className="text-xs text-muted-foreground">Progreso</p>
          </div>
        </div>

        <div className="mt-3 h-2 overflow-hidden rounded-sm bg-border">
          <div className="h-full rounded-sm bg-emerald-500 transition-all" style={{ width: `${pct}%` }} />
        </div>

        <div className="mt-5 flex-1 overflow-y-auto">
          {Object.entries(byBoard).map(([bid, bTasks]) => (
            <div key={bid} className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{boardMap[Number(bid)] ?? `Tablero #${bid}`}</p>
              <div className="flex flex-col gap-1.5">
                {bTasks.map(t => (
                  <div key={t.id} className="flex items-center gap-3 rounded-sm border border-border px-3 py-2">
                    <span className={`size-2 shrink-0 rounded-sm ${statusColors[t.status] ?? 'bg-slate-400'}`} />
                    <span className="flex-1 truncate text-sm">{t.title}</span>
                    <span className="shrink-0 rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium">{statusLabels[t.status] ?? t.status}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{priorityLabels[t.priority]}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {total === 0 && <p className="mt-4 text-center text-sm text-muted-foreground">No hay tareas asignadas a este hito.</p>}
        </div>

        <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-4">
          <button onClick={exportCSV} disabled={total === 0} className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Exportar a CSV</button>
          <button onClick={onClose} className="rounded-sm border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary">Cerrar</button>          
        </div>
      </div>
    </div>
  )
}
