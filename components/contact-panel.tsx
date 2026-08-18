'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Contact } from '@/lib/db'
import { ContactDialog } from './contact-dialog'
import { ConfirmDialog } from './confirm-dialog'

const PAGE_SIZE = 10

type ContactPanelProps = {
  contacts: Contact[]
  onAdd: (data: { name: string; email: string; phone: string; company: string; position: string; address: string; website: string; notes: string }) => void
  onEdit: (id: number, data: { name: string; email: string; phone: string; company: string; position: string; address: string; website: string; notes: string }) => void
  onDelete: (id: number) => void
}

export function ContactPanel({ contacts, onAdd, onEdit, onDelete }: ContactPanelProps) {
  const [search, setSearch] = useState('')
  const [filterCompany, setFilterCompany] = useState('')
  const [page, setPage] = useState(1)
  const [contactDialog, setContactDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Contact }>({ open: false, mode: 'add' })
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} })

  useEffect(() => { setPage(1) }, [search, filterCompany])

  const companies = [...new Set(contacts.map(c => c.company).filter(Boolean))].sort()

  const filtered = contacts.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.company.toLowerCase().includes(search.toLowerCase())
    const matchCompany = !filterCompany || c.company === filterCompany
    return matchSearch && matchCompany
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSave(data: { name: string; email: string; phone: string; company: string; position: string; address: string; website: string; notes: string }) {
    if (contactDialog.mode === 'add') {
      onAdd(data)
    } else if (contactDialog.data) {
      onEdit(contactDialog.data.id, data)
    }
  }

  return (
    <div className="px-5 py-6 md:px-10">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold">{contacts.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Contactos</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-blue-500">{companies.length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Empresas</p>
        </div>
        <div className="rounded-xl border border-border p-4 text-center">
          <p className="text-2xl font-bold text-emerald-500">{contacts.filter(c => c.email).length}</p>
          <p className="mt-1 text-xs text-muted-foreground">Con email</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"><Search className="size-4 text-muted-foreground" /><input value={search} onChange={e => setSearch(e.target.value)} className="w-48 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Buscar nombre, email, tel..." /></div>
          <select value={filterCompany} onChange={e => setFilterCompany(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"><option value="">Todas las empresas</option>{companies.map(c => <option key={c} value={c}>{c}</option>)}</select>
          <span className="text-xs text-muted-foreground">{filtered.length} contactos{filterCompany ? ` en ${filterCompany}` : ''}</span>
        </div>
        <button onClick={() => setContactDialog({ open: true, mode: 'add' })} className="flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"><Plus className="size-4" /> Nuevo contacto</button>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
        {paged.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <p className="text-sm">No se encontraron contactos</p>
            <button onClick={() => setContactDialog({ open: true, mode: 'add' })} className="mt-3 flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-secondary"><Plus className="size-4" /> Crear contacto</button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">Empresa</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Teléfono</th>
                <th className="px-6 py-3">Cargo</th>
                <th className="px-6 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paged.map(contact => (
                <tr key={contact.id} className="border-b border-border hover:bg-secondary/50">
                  <td className="px-6 py-3"><div className="flex items-center gap-2"><span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">{contact.name.slice(0, 2).toUpperCase()}</span><span className="text-sm font-medium">{contact.name}</span></div></td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{contact.company || '—'}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{contact.email || '—'}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{contact.phone || '—'}</td>
                  <td className="px-6 py-3 text-sm text-muted-foreground">{contact.position || '—'}</td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setContactDialog({ open: true, mode: 'edit', data: contact })} className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-primary"><Pencil className="size-3.5" /></button>
                      <button onClick={() => setConfirmDialog({ open: true, title: 'Eliminar contacto', message: `¿Eliminar el contacto ${contact.name}?`, onConfirm: () => { onDelete(contact.id); setConfirmDialog(v => ({ ...v, open: false })) } })} className="rounded p-1.5 text-muted-foreground hover:bg-secondary hover:text-destructive"><Trash2 className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Página {page} de {totalPages} ({filtered.length} resultados)</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-secondary disabled:opacity-50"><ChevronLeft className="size-4" /></button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, Math.min(page - 2, totalPages - 4))
              const p = start + i
              if (p > totalPages) return null
              return <button key={p} onClick={() => setPage(p)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${p === page ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>{p}</button>
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="rounded-lg border border-border p-2 text-muted-foreground hover:bg-secondary disabled:opacity-50"><ChevronRight className="size-4" /></button>
          </div>
        </div>
      )}

      <ContactDialog open={contactDialog.open} onClose={() => setContactDialog({ open: false, mode: 'add' })} onSave={handleSave} initialData={contactDialog.data ? { name: contactDialog.data.name, email: contactDialog.data.email, phone: contactDialog.data.phone, company: contactDialog.data.company, position: contactDialog.data.position, address: contactDialog.data.address, website: contactDialog.data.website, notes: contactDialog.data.notes } : undefined} title={contactDialog.mode === 'add' ? 'Nuevo contacto' : 'Editar contacto'} />
      <ConfirmDialog open={confirmDialog.open} title={confirmDialog.title} message={confirmDialog.message} onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(v => ({ ...v, open: false }))} />
    </div>
  )
}
