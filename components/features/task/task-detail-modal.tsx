'use client'

import { X, Trash2, ExternalLink, Paperclip } from 'lucide-react'
import type { Attachment, Milestone, Task } from '@/lib/db'
import { ChecklistSection } from '@/components/checklist-section'
import { CommentsSection } from '@/components/comments-section'

interface TaskDetailModalProps {
  task: Task
  milestones: Milestone[]
  attachments: Attachment[]
  isUploading: boolean
  uploadError: string | null
  detailTab: 'details' | 'checklists' | 'attachments'
  showComments: boolean
  onClose: () => void
  onSetDetailTab: (tab: 'details' | 'checklists' | 'attachments') => void
  onSetShowComments: (show: boolean) => void
  onUpdateDescription: (id: number, description: string) => void
  onUpdateMilestone: (id: number, milestoneId: number | null) => void
  onUpdateDates: (id: number, field: 'startDate' | 'dueDate', value: string | null) => void
  onDelete: (id: number) => void
  onUploadFiles: (files: FileList | File[]) => void
  onRemoveAttachment: (attachment: Attachment) => void
}

export function TaskDetailModal({
  task,
  milestones,
  attachments,
  isUploading,
  uploadError,
  detailTab,
  showComments,
  onClose,
  onSetDetailTab,
  onSetShowComments,
  onUpdateDescription,
  onUpdateMilestone,
  onUpdateDates,
  onDelete,
  onUploadFiles,
  onRemoveAttachment,
}: TaskDetailModalProps) {
  return (
    <div className="fixed inset-0 z-20 flex items-end sm:items-center justify-center bg-background/70 p-0 sm:p-4" role="presentation" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="flex h-[85vh] sm:h-[90vh] w-full sm:max-w-4xl flex-col rounded-t-2xl sm:rounded-sm border border-border bg-card shadow-xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 sm:px-6 py-3 sm:py-4">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-muted-foreground">Detalle de tarea</p>
            <h2 className="mt-0.5 text-base sm:text-lg font-semibold truncate">{task.title}</h2>
          </div>
          <button onClick={onClose} className="shrink-0 rounded-sm p-2 text-muted-foreground hover:bg-secondary" aria-label="Cerrar"><X className="size-4" /></button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col sm:flex-row overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex gap-1 border-b border-border px-4 sm:px-6 pt-3 overflow-x-auto">
              {[{ id: 'details' as const, label: 'Detalles' }, { id: 'checklists' as const, label: 'Checklists' }, { id: 'attachments' as const, label: 'Adjuntos' }].map(tab => <button key={tab.id} onClick={() => { onSetDetailTab(tab.id); onSetShowComments(false) }} className={`rounded-t-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${!showComments && detailTab === tab.id ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{tab.label}</button>)}
              <button onClick={() => onSetShowComments(!showComments)} className={`ml-auto flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs sm:text-sm font-medium transition-colors sm:hidden whitespace-nowrap ${showComments ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                <span className="text-[10px] sm:text-xs">Comentarios</span>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-5">
              {detailTab === 'details' && <>
                <div><h3 className="mb-2 text-sm font-semibold">Descripción</h3><textarea value={task.description} onChange={e => void onUpdateDescription(task.id, e.target.value)} placeholder="Sin descripción todavía..." className="min-h-[80px] w-full resize-none rounded-sm border border-border bg-background px-3 py-2 text-sm leading-6 outline-none focus:border-primary" /></div>
                <section className="mt-5 border-t border-border pt-5">
                  <h3 className="mb-3 text-sm font-semibold">Hito</h3>
                  <select value={task.milestoneId ?? ''} onChange={e => { const val = e.target.value ? Number(e.target.value) : null; void onUpdateMilestone(task.id, val) }} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                    <option value="">Sin hito</option>
                    {milestones.map(ms => <option key={ms.id} value={ms.id}>{ms.name}</option>)}
                  </select>
                </section>
                <section className="mt-5 border-t border-border pt-5">
                  <h3 className="mb-3 text-sm font-semibold">Fechas</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1"><label className="text-xs text-muted-foreground">Inicio</label><input type="date" value={task.startDate ?? ''} onChange={e => onUpdateDates(task.id, 'startDate', e.target.value || null)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs text-muted-foreground">Vencimiento</label><input type="date" value={task.dueDate ?? ''} onChange={e => onUpdateDates(task.id, 'dueDate', e.target.value || null)} className="rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary" /></div>
                  </div>
                </section>
              </>}
              {detailTab === 'checklists' && <ChecklistSection taskId={task.id} />}
              {detailTab === 'attachments' && <section>
                <div className="flex items-center justify-between"><h3 className="flex items-center gap-2 text-sm font-semibold"><Paperclip className="size-4" /> Adjuntos</h3><label className="cursor-pointer rounded-sm border border-border px-3 py-1.5 text-sm font-medium hover:bg-secondary"><span>{isUploading ? 'Subiendo...' : 'Añadir'}</span><input type="file" multiple className="sr-only" disabled={isUploading} onChange={e => { if (e.target.files) void onUploadFiles(e.target.files); e.currentTarget.value = '' }} /></label></div>
                <p className="mt-4 text-xs font-semibold text-muted-foreground">Archivos ({attachments.length})</p>
                {uploadError && <p role="alert" className="mt-2 rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">{uploadError}</p>}
                <div className="mt-2 flex flex-col gap-2" onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); void onUploadFiles(e.dataTransfer.files) }}>
                  {attachments.length ? attachments.filter(attachment => Boolean(attachment && attachment.name)).map(attachment => <div key={attachment.id} className="flex items-center gap-3 rounded-sm border border-border px-3 py-2.5"><div className="grid size-10 shrink-0 place-items-center rounded-md bg-secondary text-xs font-bold uppercase">{attachment.name.split('.').pop() || 'FILE'}</div><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{attachment.name}</p><p className="text-xs text-muted-foreground">Añadido: {new Date(attachment.createdAt).toLocaleString('es-ES')} · {(attachment.size / 1024).toFixed(0)} KB</p></div><a href={attachment.pathname} target="_blank" rel="noreferrer" className="rounded p-2 text-muted-foreground hover:bg-secondary"><ExternalLink className="size-4" /></a><button onClick={() => void onRemoveAttachment(attachment)} className="rounded p-2 text-muted-foreground hover:text-destructive"><Trash2 className="size-4" /></button></div>) : <div className="rounded-sm border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">Arrastra archivos aquí o usa «Añadir»</div>}
                </div>
              </section>}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 sm:px-6 py-3">
              <button onClick={() => onDelete(task.id)} className="flex items-center gap-2 text-sm text-destructive hover:underline"><Trash2 className="size-4" /> Eliminar</button>
              <button onClick={onClose} className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">Listo</button>
            </div>
          </div>
          <div className={`${showComments ? 'flex flex-col h-[50vh] sm:h-auto' : 'hidden'} sm:flex sm:w-[340px] sm:shrink-0 sm:flex-col overflow-hidden sm:border-l sm:border-border transition-all duration-300`}>
            <CommentsSection taskId={task.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
