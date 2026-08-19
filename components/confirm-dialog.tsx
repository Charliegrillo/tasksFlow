'use client'

import { X, AlertTriangle } from 'lucide-react'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  confirmLabel?: string
  variant?: 'destructive' | 'warning'
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, message, confirmLabel, variant = 'destructive', onConfirm, onCancel }: ConfirmDialogProps) {
  const label = confirmLabel ?? (variant === 'warning' ? 'Archivar' : 'Eliminar')
  if (!open) return null
  const iconBg = variant === 'warning' ? 'bg-amber-500/10' : 'bg-destructive/10'
  const iconColor = variant === 'warning' ? 'text-amber-500' : 'text-destructive'
  const btnClass = variant === 'warning'
    ? 'rounded-sm bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500/90'
    : 'rounded-sm bg-destructive px-4 py-2 text-sm font-medium text-white hover:bg-destructive/90'
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/70 p-4" role="presentation" onClick={onCancel}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-sm rounded-sm border border-border bg-card p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <div className={`grid size-10 shrink-0 place-items-center rounded-sm ${iconBg}`}><AlertTriangle className={`size-5 ${iconColor}`} /></div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
          </div>
          <button onClick={onCancel} className="rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar"><X className="size-4" /></button>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="rounded-sm border border-border px-4 py-2 text-sm font-medium hover:bg-secondary">Cancelar</button>
          <button onClick={onConfirm} className={btnClass}>{label}</button>
        </div>
      </div>
    </div>
  )
}
