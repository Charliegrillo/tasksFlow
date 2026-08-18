'use client'

import { useEffect, useState } from 'react'
import { Pencil, Trash2, MessageSquare } from 'lucide-react'
import type { Comment } from '@/lib/db'

type Props = { taskId: number }

export function CommentsSection({ taskId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editContent, setEditContent] = useState('')

  useEffect(() => {
    fetch(`/api/comments?taskId=${taskId}`).then(r => r.json()).then(result => setComments(result.data ?? []))
  }, [taskId])

  async function handleAdd() {
    if (!newComment.trim()) return
    const res = await fetch('/api/comments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ taskId, content: newComment }) })
    if (!res.ok) return
    const { data } = await res.json()
    setComments(v => [...v, data])
    setNewComment('')
  }

  async function handleUpdate(id: number) {
    if (!editContent.trim()) return
    const res = await fetch(`/api/comments/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ content: editContent }) })
    if (!res.ok) return
    const { data } = await res.json()
    setComments(v => v.map(c => c.id === data.id ? data : c))
    setEditingId(null)
  }

  async function handleDelete(id: number) {
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setComments(v => v.filter(c => c.id !== id))
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' + d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  }

  function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  }

  return (
    <section className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold"><MessageSquare className="size-4" /> Comentarios ({comments.length})</h3>
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto px-5 py-4" style={{ flex: '1 1 0', maxHeight: 'calc(90vh - 200px)' }}>
        {comments.map(comment => (
          <div key={comment.id} className="flex gap-2">
            <div className="grid size-8 shrink-0 place-items-center rounded-sm bg-secondary text-[10px] font-bold text-muted-foreground">{getInitials(comment.author)}</div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{comment.author}</span>
                <span className="text-[10px] text-muted-foreground">{formatDate(comment.createdAt)}</span>
              </div>
              {editingId === comment.id ? (
                <div className="mt-1">
                  <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={2} className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" autoFocus />
                  <div className="mt-1 flex gap-2">
                    <button onClick={() => setEditingId(null)} className="rounded border border-border px-2 py-1 text-[10px] text-muted-foreground hover:bg-secondary">Cancelar</button>
                    <button onClick={() => handleUpdate(comment.id)} className="rounded bg-primary px-2 py-1 text-[10px] font-medium text-primary-foreground hover:bg-primary/90">Guardar</button>
                  </div>
                </div>
              ) : (
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-muted-foreground">{comment.content}</p>
              )}
              {editingId !== comment.id && (
                <div className="mt-1 flex gap-2">
                  <button onClick={() => { setEditingId(comment.id); setEditContent(comment.content) }} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary"><Pencil className="size-3" /> Editar</button>
                  <button onClick={() => handleDelete(comment.id)} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-destructive"><Trash2 className="size-3" /> Eliminar</button>
                </div>
              )}
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="mt-4 text-center text-sm text-muted-foreground">No hay comentarios aún.</p>}
      </div>

      <div className="border-t border-border px-5 py-3">
        <div className="flex gap-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-sm bg-primary/10 text-[10px] font-bold text-primary">U</div>
          <div className="flex-1">
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)} rows={2} placeholder="Escribe un comentario..." className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary resize-none" onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void handleAdd() } }} />
            <div className="mt-1 flex justify-end">
              <button onClick={handleAdd} disabled={!newComment.trim()} className="rounded-sm bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">Guardar</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
