'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExternalLink, LayoutGrid, List, MoreHorizontal, Paperclip, Plus, Search, SlidersHorizontal, Trash2, X, DollarSign, Archive, GripVertical, MoveHorizontal, PanelLeftOpen } from 'lucide-react'
import type { Attachment, Board, BoardList, Client, Contact, CrmDeal, CrmInteraction, CrmStage, Milestone, Space, Task, TaskPriority, TaskStatus } from '@/lib/db'

import { ClientDialog } from '@/components/client-dialog'
import { SpaceDialog } from '@/components/space-dialog'
import { BoardDialog } from '@/components/board-dialog'
import { MilestoneDialog } from '@/components/milestone-dialog'
import { Sidebar } from '@/components/sidebar'
import { BudgetPanel } from '@/components/budget-panel'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { ArchivePanel } from '@/components/archive-panel'
import { CommentsSection } from '@/components/comments-section'
import { ArchivedBoardsModal } from '@/components/archived-boards-modal'
import { ClientInvoiceView } from '@/components/client-invoice-modal'
import { ArchivedMilestonesModal } from '@/components/archived-milestones-modal'
import { ArchivedClientsModal } from '@/components/archived-clients-modal'
import { ChecklistSection } from '@/components/checklist-section'
import { ContactDialog } from '@/components/contact-dialog'
import { ContactPanel } from '@/components/contact-panel'
import { CrmBoard } from '@/components/crm-board'
import { SpaceSecretsPanel } from '@/components/space-secrets-panel'
import { TaskDetailModal } from '@/components/features/task/task-detail-modal'
import { BoardColumn } from '@/components/features/board/board-column'
import { NewListDialog } from '@/components/features/board/new-list-dialog'
import { ListMoveDialog } from '@/components/features/board/list-move-dialog'

type Column = { id: TaskStatus; title: string; color: string; dbId?: number }
const fallbackColumns: Column[] = [
  { id: 'backlog', title: 'Backlog', color: 'bg-slate-400' },
  { id: 'progress', title: 'En progreso', color: 'bg-amber-500' },
  { id: 'review', title: 'En revisión', color: 'bg-violet-500' },
  { id: 'done', title: 'Completado', color: 'bg-emerald-500' },
]
const priorityLabels: Record<TaskPriority, string> = { low: 'Baja', medium: 'Media', high: 'Alta' }

export default function KanbanBoard({
  milestoneId,
  initialTasks = [],
  initialClients = [],
  initialContacts = [],
  initialCrmStages = [],
  initialCrmDeals = [],
  initialMilestones = [],
}: {
  milestoneId?: Promise<string>
  initialTasks?: Task[]
  initialClients?: Client[]
  initialContacts?: Contact[]
  initialCrmStages?: CrmStage[]
  initialCrmDeals?: CrmDeal[]
  initialMilestones?: Milestone[]
}) {
  const router = useRouter()
  const [resolvedMilestoneId, setResolvedMilestoneId] = useState<number | null>(null)
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [clients, setClients] = useState<Client[]>(initialClients)
  const [activeClient, setActiveClient] = useState<number | null>(null)
  const [spaces, setSpaces] = useState<Space[]>([])
  const [activeSpace, setActiveSpace] = useState<number | null>(null)
  const [boards, setBoards] = useState<Board[]>([])
  const [activeBoard, setActiveBoard] = useState<number | null>(null)
  const [boardLists, setBoardLists] = useState<BoardList[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<TaskPriority | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all')
  const [filterMilestone, setFilterMilestone] = useState<number | 'all' | 'none'>('all')
  const [view, setView] = useState<'board' | 'list'>('board')
  const [loading, setLoading] = useState(true)
  const [newTitle, setNewTitle] = useState('')
  const [selected, setSelected] = useState<Task | null>(null)
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [attachmentCounts, setAttachmentCounts] = useState<Record<number, number>>({})
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [menu, setMenu] = useState<TaskStatus | null>(null)
  const [draggedId, setDraggedId] = useState<number | null>(null)
  const [draggingColumnId, setDraggingColumnId] = useState<number | null>(null)
  const [dragOver, setDragOver] = useState<TaskStatus | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [newTaskStatus, setNewTaskStatus] = useState<TaskStatus>('backlog')
  const [addingToColumn, setAddingToColumn] = useState<TaskStatus | null>(null)
  const [columnInputs, setColumnInputs] = useState<Record<string, string>>({})
  const [draggedListId, setDraggedListId] = useState<number | null>(null)
  const [newListDialog, setNewListDialog] = useState<{ open: boolean; name: string }>({ open: false, name: '' })
  const [listMoveDialog, setListMoveDialog] = useState<{ open: boolean; listId: number | null; position: number }>({ open: false, listId: null, position: 1 })
  const [clientDialog, setClientDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Client }>({ open: false, mode: 'add' })
  const [spaceDialog, setSpaceDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Space }>({ open: false, mode: 'add' })
  const [boardDialog, setBoardDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Board }>({ open: false, mode: 'add' })
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones)
  const [milestoneDialog, setMilestoneDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Milestone }>({ open: false, mode: 'add' })
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; title: string; message: string; confirmLabel?: string; variant?: 'destructive' | 'warning'; onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} })
  const [allBoards, setAllBoards] = useState<Board[]>([])
  const [budgetOpen, setBudgetOpen] = useState(false)
  const [detailTab, setDetailTab] = useState<'details' | 'checklists' | 'attachments'>('details')
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<number | null>(null)
  const [contacts, setContacts] = useState<Contact[]>(initialContacts)
  const [crmStages, setCrmStages] = useState<CrmStage[]>(initialCrmStages)
  const [crmDeals, setCrmDeals] = useState<CrmDeal[]>(initialCrmDeals)
  const [crmInteractions, setCrmInteractions] = useState<Record<number, CrmInteraction[]>>({})
  const [activeView, setActiveView] = useState<'board' | 'crm' | 'contacts' | 'pipelines' | 'invoices' | null>(null)
  const [spaceSecretsOpen, setSpaceSecretsOpen] = useState(false)
  const [spaceSecretsId, setSpaceSecretsId] = useState<number | null>(null)
  const [archivedBoardsOpen, setArchivedBoardsOpen] = useState(false)
  const [archivedMilestonesOpen, setArchivedMilestonesOpen] = useState(false)
  const [archivedClientsOpen, setArchivedClientsOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [contactDialog, setContactDialog] = useState<{ open: boolean; mode: 'add' | 'edit'; data?: Contact }>({ open: false, mode: 'add' })
  const [showComments, setShowComments] = useState(false)
  const columns: Column[] = boardLists.length ? boardLists.map(list => ({ id: ({ Backlog: 'backlog', 'En progreso': 'progress', 'En revisión': 'review', Completado: 'done' } as Record<string, string>)[list.name] ?? `list-${list.id}`, dbId: list.id, title: list.name, color: list.color })) : fallbackColumns

  useEffect(() => {
    if (initialTasks.length && initialClients.length) {
      setActiveClient(initialClients[0]?.id ?? null)
      setLoading(false)
      return
    }
    Promise.all([fetch('/api/tasks').then(r => r.json()), fetch('/api/clients').then(r => r.json())]).then(([taskResult, clientResult]) => { const nextClients = clientResult.data ?? []; setTasks(taskResult.data ?? []); setClients(nextClients); setActiveClient(nextClients[0]?.id ?? null) }).finally(() => setLoading(false))
  }, [])
  useEffect(() => { if (!activeClient) return; fetch(`/api/spaces?clientId=${activeClient}`).then(r => r.json()).then(result => { setSpaces(result.data ?? []); setActiveSpace(result.data?.[0]?.id ?? null); if (!result.data?.length) { setBoards([]); setActiveBoard(null); setBoardLists([]) } const spaceIds = (result.data ?? []).map((s: Space) => s.id); return Promise.all(spaceIds.map((sid: number) => fetch(`/api/boards?spaceId=${sid}`).then(r => r.json()))) }).then(results => { const all = results.flatMap((r: { data?: Board[] }) => r.data ?? []); setAllBoards(all) }); if (!initialMilestones.length) fetch(`/api/milestones?clientId=${activeClient}`).then(r => r.json()).then(result => setMilestones(result.data ?? [])) }, [activeClient])
  useEffect(() => { if (!activeSpace) return; fetch(`/api/boards?spaceId=${activeSpace}`).then(r => r.json()).then(result => { setBoards(result.data ?? []); if (!selectedMilestoneId) setActiveBoard(result.data?.[0]?.id ?? null); if (!result.data?.length) { setBoardLists([]) } }) }, [activeSpace, selectedMilestoneId])
  useEffect(() => { if (!activeBoard || selectedMilestoneId) { if (selectedMilestoneId && allBoards.length) { Promise.all(allBoards.map(b => fetch(`/api/lists?boardId=${b.id}`).then(r => r.json()))).then(results => { const all = results.flatMap((r: { data?: BoardList[] }) => r.data ?? []); const seen = new Set<string>(); const unique = all.filter(l => { const key = l.name; if (seen.has(key)) return false; seen.add(key); return true }); setBoardLists(unique) }) } else { setBoardLists([]) } return } fetch(`/api/lists?boardId=${activeBoard}`).then(r => r.json()).then(result => setBoardLists(result.data ?? [])) }, [activeBoard, selectedMilestoneId, allBoards])
  useEffect(() => { fetch('/api/attachments').then(r => r.json()).then(result => { const counts: Record<number, number> = {}; for (const attachment of (result.data ?? []) as Attachment[]) counts[attachment.taskId] = (counts[attachment.taskId] ?? 0) + 1; setAttachmentCounts(counts) }) }, [tasks.length])
  useEffect(() => { if (milestoneId) { milestoneId.then(id => setResolvedMilestoneId(Number(id))) } }, [milestoneId])
  useEffect(() => { if (!initialContacts.length) fetch('/api/contacts').then(r => r.json()).then(result => setContacts(result.data ?? [])) }, [])
  useEffect(() => { if (!initialCrmStages.length) fetch('/api/crm/stages').then(r => r.json()).then(result => setCrmStages(result.data ?? [])) }, [])
  useEffect(() => { if (!initialCrmDeals.length) fetch('/api/crm/deals').then(r => r.json()).then(result => setCrmDeals(result.data ?? [])) }, [])
  useEffect(() => {
    if (selectedMilestoneId) {
      setFilterMilestone(selectedMilestoneId)
      return
    }
    if (resolvedMilestoneId) {
      setFilterMilestone(resolvedMilestoneId)
      return
    }
    setFilterMilestone('all')
  }, [selectedMilestoneId, resolvedMilestoneId])
  const visible = useMemo(() => {
    const base = selectedMilestoneId ? tasks.filter(t => t.milestoneId === selectedMilestoneId) : resolvedMilestoneId ? tasks.filter(t => t.milestoneId === resolvedMilestoneId) : activeBoard ? tasks.filter(t => (t as Task & { boardId?: number }).boardId === activeBoard) : []
    return base
      .filter(t => (filter === 'all' || t.priority === filter) && (filterStatus === 'all' || t.status === filterStatus) && (filterMilestone === 'all' ? true : filterMilestone === 'none' ? t.milestoneId == null : t.milestoneId === filterMilestone) && t.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => a.position - b.position)
  }, [tasks, search, filter, filterStatus, filterMilestone, activeBoard, resolvedMilestoneId, selectedMilestoneId])
  function clearFilters() {
    setSearch('')
    setFilter('all')
    setFilterStatus('all')
    setFilterMilestone(selectedMilestoneId ?? resolvedMilestoneId ?? 'all')
  }
  async function addClient() { setClientDialog({ open: true, mode: 'add' }) }
  async function editClient(client: Client) { setClientDialog({ open: true, mode: 'edit', data: client }) }
  async function handleClientSave(formData: { name: string; email: string; company: string }) {
    if (clientDialog.mode === 'add') {
      const res = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) return
      const { data } = await res.json()
      setClients(v => [...v, data])
      setActiveClient(data.id)
    } else if (clientDialog.data) {
      const res = await fetch(`/api/clients/${clientDialog.data.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) return
      const { data } = await res.json()
      setClients(v => v.map(item => item.id === data.id ? data : item))
    }
  }
  async function removeClient(client: Client) { if (clients.length <= 1) return; setConfirmDialog({ open: true, title: 'Eliminar cliente', message: `¿Eliminar ${client.name}, sus espacios y tareas?`, onConfirm: async () => { const res = await fetch(`/api/clients/${client.id}`, { method: 'DELETE' }); if (!res.ok) return; const remaining = clients.filter(item => item.id !== client.id); setClients(remaining); setActiveClient(remaining[0]?.id ?? null); setConfirmDialog(v => ({ ...v, open: false })) } }) }
  async function archiveClient(client: Client) { setConfirmDialog({ open: true, title: 'Archivar cliente', message: `¿Archivar el cliente ${client.name}? No se mostrará en el sidebar.`, confirmLabel: 'Archivar', variant: 'warning', onConfirm: async () => { const res = await fetch(`/api/clients/${client.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived: true }) }); if (!res.ok) return; setClients(v => v.filter(c => c.id !== client.id)); if (activeClient === client.id) setActiveClient(clients.find(c => c.id !== client.id)?.id ?? null); setConfirmDialog(v => ({ ...v, open: false })) } }) }
  async function restoreClient(client: Client) { const res = await fetch(`/api/clients/${client.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived: false }) }); if (!res.ok) return; setClients(v => [...v, client]) }
  async function addSpace() { setSpaceDialog({ open: true, mode: 'add' }) }
  async function editSpace(space: Space) { setSpaceDialog({ open: true, mode: 'edit', data: space }) }
  async function handleSpaceSave(formData: { name: string; color: string; secretPassword?: string | null }) {
    if (spaceDialog.mode === 'add') {
      const res = await fetch('/api/spaces', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, clientId: activeClient }) })
      if (!res.ok) return
      const { data } = await res.json()
      setSpaces(v => [...v, data])
      setActiveSpace(data.id)
    } else if (spaceDialog.data) {
      const res = await fetch(`/api/spaces/${spaceDialog.data.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) return
      const { data } = await res.json()
      setSpaces(v => v.map(item => item.id === data.id ? data : item))
    }
  }
  async function removeSpace(space: Space) { if (spaces.length <= 1) return; setConfirmDialog({ open: true, title: 'Eliminar espacio', message: `¿Eliminar el espacio ${space.name} y sus tableros?`, onConfirm: async () => { const res = await fetch(`/api/spaces/${space.id}`, { method: 'DELETE' }); if (!res.ok) return; const remaining = spaces.filter(s => s.id !== space.id); setSpaces(remaining); setActiveSpace(remaining[0]?.id ?? null); setTasks(v => v.filter(t => (t as Task & { boardId?: number }).boardId !== undefined)); setConfirmDialog(v => ({ ...v, open: false })) } }) }
  async function addBoard() { setBoardDialog({ open: true, mode: 'add' }) }
  async function editBoard(board: Board) { setBoardDialog({ open: true, mode: 'edit', data: board }) }
  async function handleBoardSave(formData: { name: string; type: string; paymentStatus?: import('@/lib/db').BoardPaymentStatus }) {
    if (boardDialog.mode === 'add') {
      const res = await fetch('/api/boards', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, spaceId: activeSpace }) })
      if (!res.ok) return
      const { data } = await res.json()
      setBoards(v => [...v, data])
      setActiveBoard(data.id)
    } else if (boardDialog.data) {
      const res = await fetch(`/api/boards/${boardDialog.data.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) return
      const { data } = await res.json()
      setBoards(v => v.map(item => item.id === data.id ? data : item))
    }
  }
  async function removeBoard(board: Board) { if (boards.length <= 1) return; setConfirmDialog({ open: true, title: 'Eliminar tablero', message: `¿Eliminar el tablero ${board.name} y sus listas?`, onConfirm: async () => { const res = await fetch(`/api/boards/${board.id}`, { method: 'DELETE' }); if (!res.ok) return; const remaining = boards.filter(b => b.id !== board.id); setBoards(remaining); setActiveBoard(remaining[0]?.id ?? null); setTasks(v => v.filter(t => (t as Task & { boardId?: number }).boardId !== board.id)); setConfirmDialog(v => ({ ...v, open: false })) } }) }
  async function updateBoardPaymentStatus(boardId: number, paymentStatus: import('@/lib/db').BoardPaymentStatus) { const res = await fetch(`/api/boards/${boardId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ paymentStatus }) }); if (!res.ok) return; const { data } = await res.json(); setBoards(v => v.map(b => b.id === data.id ? data : b)); if (data.paymentStatus !== 'pendiente' && activeBoard === boardId) setActiveBoard(null) }
  async function addMilestone() { setMilestoneDialog({ open: true, mode: 'add' }) }
  async function editMilestone(milestone: Milestone) { setMilestoneDialog({ open: true, mode: 'edit', data: milestone }) }
  async function handleMilestoneSave(formData: { name: string; color: string }) {
    if (milestoneDialog.mode === 'add') {
      const res = await fetch('/api/milestones', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formData, clientId: activeClient }) })
      if (!res.ok) return
      const { data } = await res.json()
      setMilestones(v => [...v, data])
    } else if (milestoneDialog.data) {
      const res = await fetch(`/api/milestones/${milestoneDialog.data.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) return
      const { data } = await res.json()
      setMilestones(v => v.map(item => item.id === data.id ? data : item))
    }
  }
  async function removeMilestone(milestone: Milestone) { setConfirmDialog({ open: true, title: 'Eliminar hito', message: `¿Eliminar el hito ${milestone.name}?`, onConfirm: async () => { const res = await fetch(`/api/milestones/${milestone.id}`, { method: 'DELETE' }); if (!res.ok) return; setMilestones(v => v.filter(m => m.id !== milestone.id)); setTasks(v => v.map(t => t.milestoneId === milestone.id ? { ...t, milestoneId: null } : t)); setConfirmDialog(v => ({ ...v, open: false })) } }) }
  async function archiveMilestone(milestone: Milestone) { setConfirmDialog({ open: true, title: 'Archivar hito', message: `¿Archivar el hito ${milestone.name}? No se mostrará en el sidebar.`, confirmLabel: 'Archivar', variant: 'warning', onConfirm: async () => { const res = await fetch(`/api/milestones/${milestone.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived: true }) }); if (!res.ok) return; setMilestones(v => v.filter(m => m.id !== milestone.id)); if (selectedMilestoneId === milestone.id) setSelectedMilestoneId(null); setConfirmDialog(v => ({ ...v, open: false })) } }) }
  async function restoreMilestone(milestone: Milestone) { const res = await fetch(`/api/milestones/${milestone.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived: false }) }); if (!res.ok) return; setMilestones(v => [...v, milestone]) }
  async function archiveBoard(board: Board) { setConfirmDialog({ open: true, title: 'Archivar tablero', message: `¿Archivar el tablero ${board.name}? No se mostrará en el sidebar.`, confirmLabel: 'Archivar', variant: 'warning', onConfirm: async () => { const res = await fetch(`/api/boards/${board.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived: true }) }); if (!res.ok) return; setBoards(v => v.filter(b => b.id !== board.id)); setAllBoards(v => v.filter(b => b.id !== board.id)); if (activeBoard === board.id) setActiveBoard(boards.find(b => b.id !== board.id)?.id ?? null); setConfirmDialog(v => ({ ...v, open: false })) } }) }
  async function restoreBoard(board: Board) { const res = await fetch(`/api/boards/${board.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ archived: false }) }); if (!res.ok) return; setBoards(v => [...v, board]); setAllBoards(v => [...v, board]) }
  async function addBoardList() { if (!activeBoard) return; setNewListDialog({ open: true, name: '' }) }
  async function submitBoardList() {
    if (!activeBoard) return
    const name = newListDialog.name.trim()
    if (!name) return
    const res = await fetch('/api/lists', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boardId: activeBoard, name }) })
    if (!res.ok) return
    const { data } = await res.json()
    setBoardLists(v => [...v, data])
    setNewTaskStatus(`list-${data.id}`)
    setNewListDialog({ open: false, name: '' })
  }
  async function moveBoardList(listId: number, targetPosition: number) {
    const currentIndex = boardLists.findIndex(list => list.id === listId)
    const nextPosition = Math.min(Math.max(targetPosition, 0), Math.max(boardLists.length - 1, 0))
    if (currentIndex === -1 || currentIndex === nextPosition) return
    const reordered = [...boardLists]
    const [moved] = reordered.splice(currentIndex, 1)
    reordered.splice(nextPosition, 0, moved)
    setBoardLists(reordered)
    await fetch(`/api/lists/${listId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ position: nextPosition })
    })
  }
  async function moveBoardListByModal(listId: number, targetPosition: number) {
    await moveBoardList(listId, targetPosition)
    setListMoveDialog({ open: false, listId: null, position: 1 })
  }
  async function removeBoardList(column: Column) { if (!column.dbId) return; setConfirmDialog({ open: true, title: 'Eliminar lista', message: `¿Eliminar la lista ${column.title}? Las tareas de esta lista también se eliminarán.`, onConfirm: async () => { const res = await fetch(`/api/lists/${column.dbId}`, { method: 'DELETE' }); if (!res.ok) return; setBoardLists(v => v.filter(list => list.id !== column.dbId)); setTasks(v => v.filter(task => task.status !== column.id)); setConfirmDialog(v => ({ ...v, open: false })) } }) }
  async function addTask(status: TaskStatus = 'backlog') { const title = (columnInputs[status] ?? newTitle).trim(); if (!title) return; const res = await fetch('/api/tasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title, status, boardId: activeBoard }) }); if (!res.ok) return; const { data } = await res.json(); setTasks(v => [...v, data]); setNewTitle(''); setColumnInputs(v => ({ ...v, [status]: '' })); setAddingToColumn(null) }
  async function move(id: number, status: TaskStatus, position: number) { setTasks(v => { const task = v.find(t => t.id === id); if (!task) return v; const sameColumn = v.filter(t => t.status === status && t.id !== id); const updated = v.map(t => t.id === id ? { ...t, status, position } : t); const others = updated.filter(t => t.status === status && t.id !== id).sort((a, b) => a.position - b.position); others.splice(position, 0, { ...task, status, position }); return updated.map(t => { if (t.status !== status || t.id === id) return t; const idx = others.findIndex(o => o.id === t.id); return idx >= 0 ? { ...t, position: idx } : t }) }); setSelected(v => v?.id === id ? { ...v, status } : v); await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status, position }) }) }
  async function loadAttachments(taskId: number) { const result = await fetch(`/api/attachments?taskId=${taskId}`).then(r => r.json()); setAttachments(Array.isArray(result.data) ? result.data.filter((item: Attachment | null | undefined): item is Attachment => Boolean(item && item.id && item.name)) : []) }
  async function selectTask(task: Task) { setSelected(task); await loadAttachments(task.id) }
  async function uploadFiles(files: FileList | File[]) { if (!selected || !files.length) return; setUploadError(null); setIsUploading(true); try { const uploaded = await Promise.all(Array.from(files).map(async file => { const form = new FormData(); form.append('taskId', String(selected.id)); form.append('file', file); const response = await fetch('/api/attachments', { method: 'POST', body: form }); const payload = await response.json(); if (!response.ok || !payload.data?.id) throw new Error(payload.error || `No se pudo subir ${file.name}`); return payload.data as Attachment })); const valid = uploaded.filter(item => item?.id && item.name); setAttachments(v => [...valid, ...v]); setAttachmentCounts(v => ({ ...v, [selected.id]: (v[selected.id] ?? 0) + valid.length })) } catch (error) { setUploadError(error instanceof Error ? error.message : 'No se pudo subir el archivo') } finally { setIsUploading(false) } }
  async function removeAttachment(attachment: Attachment) { await fetch(`/api/attachments/${attachment.id}`, { method: 'DELETE' }); setAttachments(v => v.filter(item => item.id !== attachment.id)) }
  async function updateMilestoneOnTask(id: number, milestoneId: number | null) { const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ milestoneId }) }); if (!res.ok) return; const { data } = await res.json(); setTasks(v => v.map(t => t.id === data.id ? data : t)); setSelected(prev => prev?.id === data.id ? { ...prev, milestoneId: data.milestoneId } : prev) }
  async function updateTaskDates(id: number, field: 'startDate' | 'dueDate', value: string | null) { const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value }) }); if (!res.ok) return; const { data } = await res.json(); setTasks(v => v.map(t => t.id === data.id ? data : t)); setSelected(prev => prev?.id === data.id ? { ...prev, [field]: value } : prev) }
  async function updateTaskDescription(id: number, description: string) { const res = await fetch(`/api/tasks/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description }) }); if (!res.ok) return; const { data } = await res.json(); setTasks(v => v.map(t => t.id === data.id ? data : t)); setSelected(prev => prev?.id === data.id ? { ...prev, description } : prev) }
  async function remove(id: number) { await fetch(`/api/tasks/${id}`, { method: 'DELETE' }); setTasks(v => v.filter(t => t.id !== id)); setSelected(null) }
  async function addContact() { setContactDialog({ open: true, mode: 'add' }) }
  async function editContact(contact: Contact) { setContactDialog({ open: true, mode: 'edit', data: contact }) }
  async function handleContactSave(formData: { name: string; email: string; phone: string; company: string; position: string; address: string; website: string; notes: string }) {
    if (contactDialog.mode === 'add') {
      const res = await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) return
      const { data } = await res.json()
      setContacts(v => [...v, data])
    } else if (contactDialog.data) {
      const res = await fetch(`/api/contacts/${contactDialog.data.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) })
      if (!res.ok) return
      const { data } = await res.json()
      setContacts(v => v.map(c => c.id === data.id ? data : c))
    }
  }
  async function removeContact(contact: Contact) { setConfirmDialog({ open: true, title: 'Eliminar contacto', message: `¿Eliminar el contacto ${contact.name} y sus deals?`, onConfirm: async () => { const res = await fetch(`/api/contacts/${contact.id}`, { method: 'DELETE' }); if (!res.ok) return; setContacts(v => v.filter(c => c.id !== contact.id)); setCrmDeals(v => v.filter(d => d.contactId !== contact.id)); setConfirmDialog(v => ({ ...v, open: false })) } }) }
  async function handleContactPanelAdd(data: { name: string; email: string; phone: string; company: string; position: string; address: string; website: string; notes: string }) { const res = await fetch('/api/contacts', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (!res.ok) return; const { data: newContact } = await res.json(); setContacts(v => [...v, newContact]) }
  async function handleContactPanelEdit(id: number, data: { name: string; email: string; phone: string; company: string; position: string; address: string; website: string; notes: string }) { const res = await fetch(`/api/contacts/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); if (!res.ok) return; const { data: updated } = await res.json(); setContacts(v => v.map(c => c.id === updated.id ? updated : c)) }
  async function handleContactPanelDelete(id: number) { await fetch(`/api/contacts/${id}`, { method: 'DELETE' }); setContacts(v => v.filter(c => c.id !== id)); setCrmDeals(v => v.filter(d => d.contactId !== id)) }
  async function loadCrmInteractions(dealId: number) { const res = await fetch(`/api/crm/interactions?dealId=${dealId}`); const result = await res.json(); setCrmInteractions(v => ({ ...v, [dealId]: result.data ?? [] })) }
  async function addCrmDeal(contactId: number, stageId: number) { const res = await fetch('/api/crm/deals', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contactId, stageId }) }); if (!res.ok) return; const { data } = await res.json(); setCrmDeals(v => [...v, data]) }
  async function moveCrmDeal(dealId: number, stageId: number) { const res = await fetch(`/api/crm/deals/${dealId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ stageId }) }); if (!res.ok) return; const { data } = await res.json(); setCrmDeals(v => v.map(d => d.id === data.id ? data : d)) }
  async function deleteCrmDeal(dealId: number) { await fetch(`/api/crm/deals/${dealId}`, { method: 'DELETE' }); setCrmDeals(v => v.filter(d => d.id !== dealId)); setCrmInteractions(v => { const next = { ...v }; delete next[dealId]; return next }) }
  async function addCrmStage(name: string, color: string) { const res = await fetch('/api/crm/stages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, color }) }); if (!res.ok) return; const { data } = await res.json(); setCrmStages(v => [...v, data]) }
  async function moveCrmStage(id: number, position: number) { const res = await fetch('/api/crm/stages', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, position }) }); if (!res.ok) return; const { data } = await res.json(); setCrmStages(data) }
  async function deleteCrmStage(id: number) { await fetch(`/api/crm/stages/${id}`, { method: 'DELETE' }); setCrmStages(v => v.filter(s => s.id !== id)); setCrmDeals(v => v.filter(d => d.stageId !== id)) }
  async function addCrmInteraction(dealId: number, type: CrmInteraction['type'], description: string, date: string) { const res = await fetch('/api/crm/interactions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ dealId, type, description, date }) }); if (!res.ok) return; await loadCrmInteractions(dealId) }
  async function deleteCrmInteraction(id: number) { await fetch(`/api/crm/interactions/${id}`, { method: 'DELETE' }); for (const dealId of Object.keys(crmInteractions)) { setCrmInteractions(v => ({ ...v, [dealId]: (v[Number(dealId)] ?? []).filter(i => i.id !== id) })) } }
  const completed = tasks.filter(t => t.status === 'done').length
  const isMilestoneView = !!(resolvedMilestoneId || selectedMilestoneId)
  const activeMilestoneId = resolvedMilestoneId ?? selectedMilestoneId
  const activeMilestone = milestones.find(m => m.id === activeMilestoneId)
  const milestoneTasks = isMilestoneView ? tasks.filter(t => t.milestoneId === activeMilestoneId) : []
  const milestoneBoards = allBoards.filter(b => milestoneTasks.some(t => (t as Task & { boardId?: number }).boardId === b.id))

  function handleSelectClient(id: number) {
    setActiveClient(id)
    setSelectedMilestoneId(null)
    fetch(`/api/spaces?clientId=${id}`)
      .then(r => r.json())
      .then(d => {
        const spaces = d.data ?? []
        if (spaces.length > 0) {
          const firstSpaceId = spaces[0].id
          setActiveSpace(firstSpaceId)
          fetch(`/api/boards?spaceId=${firstSpaceId}`)
            .then(r => r.json())
            .then(b => {
              const boards = b.data ?? []
              if (boards.length > 0) {
                setActiveBoard(boards[0].id)
              }
            })
        }
      })
  }

  return <>
    <main className="min-h-screen bg-background text-foreground" onClick={() => menu && setMenu(null)}>
    <Sidebar activeView={activeView} onSelectView={view => setActiveView(view)} crmDealCount={crmDeals.length} clients={clients} milestones={milestones} activeClient={activeClient} onSelectClient={handleSelectClient} onEditClient={editClient} onAddClient={addClient} onArchiveClient={archiveClient} onShowArchivedClients={() => setArchivedClientsOpen(true)} spaces={spaces} activeSpace={activeSpace} onSelectSpace={id => { setActiveSpace(id); setSelectedMilestoneId(null) }} onEditSpace={editSpace} onRemoveSpace={removeSpace} onAddSpace={addSpace} onOpenSecrets={(spaceId) => { setSpaceSecretsId(spaceId); setSpaceSecretsOpen(true) }} boards={boards} activeBoard={activeBoard} onSelectBoard={id => { setActiveBoard(id); setSelectedMilestoneId(null); setActiveView(null) }} onEditBoard={editBoard} onAddBoard={addBoard} onArchiveBoard={archiveBoard} onAddMilestone={addMilestone} onEditMilestone={editMilestone} onArchiveMilestone={archiveMilestone} onSelectMilestone={ms => setSelectedMilestoneId(ms.id === selectedMilestoneId ? null : ms.id)} highlightMilestoneId={selectedMilestoneId} onShowArchivedBoards={() => setArchivedBoardsOpen(true)} onShowArchivedMilestones={() => setArchivedMilestonesOpen(true)} onCollapsedChange={setSidebarCollapsed} />
    <section className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:pl-24' : 'lg:pl-64'}`}>
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-5 md:px-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const sidebar = document.querySelector('aside')
              const overlay = document.getElementById('sidebar-overlay')
              if (sidebar) {
                sidebar.classList.remove('-translate-x-full')
                overlay?.classList.remove('-translate-x-full')
              }
            }}
            className="rounded-sm border border-border bg-background/80 p-2 text-muted-foreground transition hover:border-primary/30 hover:bg-secondary hover:text-foreground lg:hidden"
            aria-label="Abrir menú"
          >
            <PanelLeftOpen className="size-5" />
          </button>
          <div>
            {isMilestoneView ? (
            <>
              <h1 className="mt-1 flex items-center gap-3 text-xl font-semibold tracking-tight">Hito 
                {activeMilestone && <span className={`size-2 rounded-sm ${activeMilestone.color}`} />}
                {activeMilestone?.name ?? 'Hito'}
              </h1>
            </>
          ) : activeView === 'crm' || activeView === 'pipelines' ? (
            <>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Pipelines</h1>
            </>
          ) : activeView === 'contacts' ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Contactos</h1>
            </>
          ) : activeView === 'invoices' ? (
            <>
              <h1 className="text-2xl font-semibold tracking-tight">Facturas</h1>
            </>
          ) : (
            <>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight">Tablero {boards.find(b => b.id === activeBoard)?.name ?? 'Tablero'}</h1>
            </>
          )}
          </div>
        </div>
      </header>

      {isMilestoneView ? (
        <div className="px-5 py-6 md:px-10">
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-sm border border-border p-4 text-center">
              <p className="text-2xl font-bold">{milestoneTasks.length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Tareas</p>
            </div>
            <div className="rounded-sm border border-border p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">{milestoneTasks.filter(t => t.status === 'done').length}</p>
              <p className="mt-1 text-xs text-muted-foreground">Completadas</p>
            </div>
            <div className="rounded-sm border border-border p-4 text-center">
              <p className="text-2xl font-bold">{milestoneTasks.length ? Math.round(milestoneTasks.filter(t => t.status === 'done').length / milestoneTasks.length * 100) : 0}%</p>
              <p className="mt-1 text-xs text-muted-foreground">Progreso</p>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded bg-border">
            <div className="h-full rounded bg-emerald-500 transition-all" style={{ width: `${milestoneTasks.length ? Math.round(milestoneTasks.filter(t => t.status === 'done').length / milestoneTasks.length * 100) : 0}%` }} />
          </div>
          <div className="mt-8 flex flex-col gap-6">
            {milestoneBoards.map(board => {
              const boardTasks = milestoneTasks.filter(t => (t as Task & { boardId?: number }).boardId === board.id).sort((a, b) => a.position - b.position)
              const boardDone = boardTasks.filter(t => t.status === 'done').length
              return (
                <div key={board.id} className="rounded-sm border border-border bg-card">
                  <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <h2 className="text-sm font-semibold">{board.name}</h2>
                    <span className="text-xs text-muted-foreground">{boardDone}/{boardTasks.length} completadas</span>
                  </div>
                  <div className="divide-y divide-border">
                    {boardTasks.map(task => (
                      <button key={task.id} onClick={() => void selectTask(task)} className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-secondary/60">
                        <span className="flex items-center gap-3">
                          <span className={`size-2 rounded-sm ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                          <span className="text-sm font-medium">{task.title}</span>
                        </span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="rounded-sm bg-secondary px-2 py-0.5">{columns.find(c => c.id === task.status)?.title}</span>
                          {task.dueDate && <span className={new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-destructive font-medium' : ''}>{new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
            {milestoneBoards.length === 0 && <p className="text-center text-sm text-muted-foreground">No hay tareas asociadas a este hito.</p>}
          </div>
        </div>
      ) : activeView === 'crm' || activeView === 'pipelines' ? (
        <>
          {activeView === 'contacts' ? <ContactPanel contacts={contacts} onAdd={handleContactPanelAdd} onEdit={handleContactPanelEdit} onDelete={handleContactPanelDelete} /> : <CrmBoard stages={crmStages} deals={crmDeals} contacts={contacts} interactions={crmInteractions} onAddDeal={addCrmDeal} onMoveDeal={moveCrmDeal} onDeleteDeal={deleteCrmDeal} onAddStage={addCrmStage} onDeleteStage={deleteCrmStage} onMoveStage={moveCrmStage} onAddInteraction={addCrmInteraction} onDeleteInteraction={deleteCrmInteraction} onRefreshInteractions={loadCrmInteractions} onAddContact={addContact} />}
        </>
      ) : activeView === 'contacts' ? (
        <ContactPanel contacts={contacts} onAdd={handleContactPanelAdd} onEdit={handleContactPanelEdit} onDelete={handleContactPanelDelete} />
      ) : activeView === 'invoices' ? (
        <ClientInvoiceView clients={clients} />
      ) : (
        <div className="px-5 py-6 md:px-10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} className="w-full rounded-sm border border-border bg-card pl-9 pr-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary" placeholder="Buscar tareas..." />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2.5">
                <SlidersHorizontal className="size-4 text-muted-foreground" />
                <select value={filter} onChange={e => setFilter(e.target.value as TaskPriority | 'all')} className="bg-card text-sm font-medium text-foreground outline-none cursor-pointer" aria-label="Filtrar por prioridad">
                  <option value="all" className="bg-card text-foreground">Prioridad</option>
                  <option value="high" className="bg-card text-foreground">Alta</option>
                  <option value="medium" className="bg-card text-foreground">Media</option>
                  <option value="low" className="bg-card text-foreground">Baja</option>
                </select>
                {filter !== 'all' && <button onClick={() => setFilter('all')} className="ml-1 rounded-sm bg-primary/10 p-0.5 text-primary hover:bg-primary/20"><X className="size-3" /></button>}
              </div>

              <div className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2.5">
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as TaskStatus | 'all')} className="bg-card text-sm font-medium text-foreground outline-none cursor-pointer" aria-label="Filtrar por estado">
                  <option value="all" className="bg-card text-foreground">Estado</option>
                  {boardLists.map(list => {
                    const mappedId = ({ Backlog: 'backlog', 'En progreso': 'progress', 'En revisión': 'review', Completado: 'done' } as Record<string, string>)[list.name] ?? `list-${list.id}`
                    return <option key={list.id} value={mappedId} className="bg-card text-foreground">{list.name}</option>
                  })}
                </select>
                {filterStatus !== 'all' && <button onClick={() => setFilterStatus('all')} className="ml-1 rounded-sm bg-primary/10 p-0.5 text-primary hover:bg-primary/20"><X className="size-3" /></button>}
              </div>

              <div className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2.5">
                <select value={filterMilestone} onChange={e => setFilterMilestone(e.target.value === 'all' || e.target.value === 'none' ? e.target.value : Number(e.target.value))} className="bg-card text-sm font-medium text-foreground outline-none cursor-pointer" aria-label="Filtrar por hito">
                  <option value="all" className="bg-card text-foreground">Hito</option>
                  {milestones.map(ms => <option key={ms.id} value={ms.id} className="bg-card text-foreground">{ms.name}</option>)}
                  <option value="none" className="bg-card text-foreground">Sin hito</option>
                </select>
                {filterMilestone !== 'all' && <button onClick={() => setFilterMilestone(selectedMilestoneId ?? resolvedMilestoneId ?? 'all')} className="ml-1 rounded-sm bg-primary/10 p-0.5 text-primary hover:bg-primary/20"><X className="size-3" /></button>}
              </div>

              {(search || filter !== 'all' || filterStatus !== 'all' || (filterMilestone !== 'all' && filterMilestone !== selectedMilestoneId && filterMilestone !== resolvedMilestoneId)) && (
                <button onClick={clearFilters} className="flex items-center gap-1.5 rounded-sm bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/20">
                  <X className="size-3.5" />
                  Limpiar
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setView(view === 'board' ? 'list' : 'board')} className="rounded-sm border border-border p-2.5 text-muted-foreground hover:bg-secondary" aria-label="Cambiar vista">{view === 'board' ? <List className="size-4" /> : <LayoutGrid className="size-4" />}</button>
              {activeBoard && <button onClick={() => setBudgetOpen(true)} className="flex items-center gap-2 rounded-sm border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"><DollarSign className="size-4" /> Presupuesto</button>}
            </div>
          </div>
          {view === 'list' ? <div className="mt-8 overflow-hidden rounded-sm border border-border bg-card">{visible.map(task => <button key={task.id} onClick={() => void selectTask(task)} className="flex w-full items-center justify-between border-b border-border px-4 py-4 text-left last:border-0 hover:bg-secondary/60"><span><span className="flex items-center gap-2 text-sm font-medium">{task.title}<span className="inline-flex items-center gap-1 text-xs font-normal text-muted-foreground"><Paperclip className="size-3" />{attachmentCounts[task.id] ?? 0}</span></span><span className="text-xs text-muted-foreground">{columns.find(c => c.id === task.status)?.title} · {priorityLabels[task.priority]}</span>{task.dueDate && <span className={`ml-2 text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>{new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</span>}</span></button>)}</div> : <div className="mt-8 flex items-start gap-5 overflow-x-auto pb-4 min-h-screen">{columns.filter(column => filterStatus === 'all' || column.id === filterStatus).map(column => <div key={column.id} className={`flex w-[290px] min-w-[290px] flex-col rounded-sm p-2 transition-colors ${dragOver === column.id ? 'bg-secondary/70' : ''}`} onDragOver={e => { e.preventDefault(); if (draggingColumnId) { setDragOver(column.id); return } const colTasks = visible.filter(t => t.status === column.id && t.id !== draggedId); let idx = colTasks.length; const articles = e.currentTarget.querySelectorAll('article'); for (let i = 0; i < articles.length; i++) { const r = articles[i].getBoundingClientRect(); if (e.clientY < r.top + r.height / 2) { idx = i; break } } setDropIndex(idx) }} onDragLeave={() => { setDragOver(null); setDropIndex(null) }} onDrop={e => { e.preventDefault(); if (draggedId !== null) { const colTasks = visible.filter(t => t.status === column.id && t.id !== draggedId); const rect = e.currentTarget.getBoundingClientRect(); const y = e.clientY - rect.top; let pos = colTasks.length; const articles = e.currentTarget.querySelectorAll('article'); for (let i = 0; i < articles.length; i++) { const articleRect = articles[i].getBoundingClientRect(); if (y < articleRect.top + articleRect.height / 2) { pos = i; break } } void move(draggedId, column.id, pos); setDraggedId(null); setDragOver(null); setDropIndex(null); return } if (draggingColumnId && column.dbId) { const targetIdx = boardLists.findIndex(l => l.id === column.dbId); if (targetIdx !== -1) void moveBoardList(Number(draggingColumnId), targetIdx) } setDraggingColumnId(null); setDraggedId(null); setDragOver(null); setDropIndex(null) }}><div className="mb-3 flex items-center justify-between"><div className="flex items-center gap-2"><span draggable onDragStart={e => { e.stopPropagation(); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/column", String(column.dbId ?? "")); setDraggingColumnId(column.dbId) }} onDragEnd={() => setDraggingColumnId(null)} className="cursor-grab text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"><GripVertical className="size-3.5" /></span><span className={`size-2.5 rounded-sm ${column.color}`} /><h2 className="text-sm font-semibold">{column.title}</h2><span className="rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">{visible.filter(t => t.status === column.id).length}</span></div><div className="relative flex items-center gap-1.5"><button onClick={e => { e.stopPropagation(); setMenu(menu === column.id ? null : column.id) }} className="rounded border border-border bg-background p-1.5 text-muted-foreground transition hover:bg-secondary" aria-label={`Más opciones ${column.title}`}><MoreHorizontal className="size-3.5" /></button>{menu === column.id && <div className="absolute right-0 top-10 z-10 w-44 rounded border border-border bg-card p-1 shadow-lg"><button onClick={e => { e.stopPropagation(); if (column.dbId) setListMoveDialog({ open: true, listId: column.dbId, position: boardLists.findIndex(list => list.id === column.dbId) + 1 }); setMenu(null) }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"><MoveHorizontal className="size-4" /> Reordenar</button><div className="my-1 h-px bg-border" /><button onClick={e => { e.stopPropagation(); void removeBoardList(column); setMenu(null) }} className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm text-destructive hover:bg-secondary"><Trash2 className="size-4" /> Eliminar lista</button></div>}</div></div><div className="flex min-h-0 flex-1 flex-col gap-3">{loading ? <p className="text-sm text-muted-foreground">Cargando...</p> : visible.filter(t => t.status === column.id).map((task, taskIdx) => <span key={task.id}><span className={`block h-0.5 rounded bg-primary transition-all ${dragOver === column.id && dropIndex === taskIdx && draggedId !== task.id ? 'opacity-100' : 'opacity-0'}`} /><article draggable onDragStart={e => { e.stopPropagation(); setDraggedId(task.id); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(task.id)) }} onDragEnd={() => { if (draggingColumnId && column.dbId) { const targetIdx = boardLists.findIndex(l => l.id === column.dbId); if (targetIdx !== -1) void moveBoardList(Number(draggingColumnId), targetIdx) } setDraggingColumnId(null); setDraggedId(null); setDragOver(null); setDropIndex(null) }} onClick={() => void selectTask(task)} className={`cursor-grab rounded border border-border bg-card p-4 shadow-sm transition hover:border-primary/50 active:cursor-grabbing ${draggedId === task.id ? 'opacity-50' : ''}`}><div className="flex items-start justify-between gap-3"><h3 className="text-sm font-medium leading-5"><span className="flex items-center gap-1.5">{task.title}<span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground"><Paperclip className="size-3" /> Adjuntos · {attachmentCounts[task.id] ?? 0}</span></span></h3><span className={`size-2 shrink-0 rounded-sm ${task.priority === 'high' ? 'bg-destructive' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-muted-foreground'}`} /></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{task.description || 'Sin descripción todavía.'}</p><div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>{task.assignee}</span><span className={task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-destructive font-medium' : ''}>{task.dueDate ? new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }) : 'Sin fecha'}</span></div></article></span>)}</div><span className={`block h-0.5 rounded bg-primary transition-all ${dragOver === column.id && dropIndex === visible.filter(t => t.status === column.id).length && draggedId !== null ? 'opacity-100' : 'opacity-0'}`} />{addingToColumn === column.id ? <div className="mt-3 flex flex-col gap-2"><input autoFocus value={columnInputs[column.id] ?? ''} onChange={e => setColumnInputs(v => ({ ...v, [column.id]: e.target.value }))} onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); void addTask(column.id) } if (e.key === 'Escape') setAddingToColumn(null) }} className="w-full rounded border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary" placeholder="Título de la tarjeta..." /><div className="flex gap-2"><button onClick={() => void addTask(column.id)} className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">Añadir</button><button onClick={() => setAddingToColumn(null)} className="rounded border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-secondary">Cancelar</button></div></div> : <button onClick={() => { setAddingToColumn(column.id); setColumnInputs(v => ({ ...v, [column.id]: '' })) }} className="mt-auto flex w-full items-center gap-2 rounded border border-dashed border-border px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-secondary"><Plus className="size-4" /> Añadir tarjeta</button>}</div>)}<button onClick={() => void addBoardList()} className="flex h-[40px] min-w-[290px] shrink-0 items-center justify-center gap-2 rounded border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary/50 hover:bg-secondary/50 hover:text-foreground"><Plus className="size-4" /> Añadir lista</button></div>}
        </div>
      )}
    </section>
    {selected && (
      <TaskDetailModal
        task={selected}
        milestones={milestones}
        attachments={attachments}
        isUploading={isUploading}
        uploadError={uploadError}
        detailTab={detailTab}
        showComments={showComments}
        onClose={() => setSelected(null)}
        onSetDetailTab={(tab: 'details' | 'checklists' | 'attachments') => { setDetailTab(tab); setShowComments(false) }}
        onSetShowComments={setShowComments}
        onUpdateDescription={updateTaskDescription}
        onUpdateMilestone={updateMilestoneOnTask}
        onUpdateDates={updateTaskDates}
        onDelete={remove}
        onUploadFiles={(files: FileList | File[]) => void uploadFiles(files)}
        onRemoveAttachment={(a: Attachment) => void removeAttachment(a)}
      />
    )}
    </main>
    <ClientDialog open={clientDialog.open} onClose={() => setClientDialog(v => ({ ...v, open: false }))} onSave={handleClientSave} initialData={clientDialog.data ? { name: clientDialog.data.name, email: clientDialog.data.email, company: clientDialog.data.company } : undefined} title={clientDialog.mode === 'add' ? 'Nuevo cliente' : 'Editar cliente'} />
    <SpaceDialog open={spaceDialog.open} onClose={() => setSpaceDialog(v => ({ ...v, open: false }))} onSave={handleSpaceSave} initialData={spaceDialog.data ? { name: spaceDialog.data.name, color: spaceDialog.data.color, secretPassword: spaceDialog.data.secretPassword ?? null } : undefined} title={spaceDialog.mode === 'add' ? 'Nuevo espacio' : 'Editar espacio'} />
    <BoardDialog open={boardDialog.open} onClose={() => setBoardDialog(v => ({ ...v, open: false }))} onSave={handleBoardSave} initialData={boardDialog.data ? { name: boardDialog.data.name, type: boardDialog.data.type, paymentStatus: boardDialog.data.paymentStatus } : undefined} title={boardDialog.mode === 'add' ? 'Nuevo tablero' : 'Editar tablero'} />
    <MilestoneDialog open={milestoneDialog.open} onClose={() => setMilestoneDialog(v => ({ ...v, open: false }))} onSave={handleMilestoneSave} initialData={milestoneDialog.data ? { name: milestoneDialog.data.name, color: milestoneDialog.data.color } : undefined} title={milestoneDialog.mode === 'add' ? 'Nuevo hito' : 'Editar hito'} />
    <NewListDialog open={newListDialog.open} name={newListDialog.name} onSetName={(name) => setNewListDialog(v => ({ ...v, name }))} onClose={() => setNewListDialog({ open: false, name: '' })} onSubmit={() => void submitBoardList()} />
    <ListMoveDialog open={listMoveDialog.open} listId={listMoveDialog.listId} position={listMoveDialog.position} boardLists={boardLists} onSetPosition={(pos) => setListMoveDialog(v => ({ ...v, position: pos }))} onClose={() => setListMoveDialog({ open: false, listId: null, position: 1 })} onMove={(listId, pos) => void moveBoardListByModal(listId, pos)} />
    {budgetOpen && activeBoard && <BudgetPanel key={activeBoard} boardId={activeBoard} onClose={() => setBudgetOpen(false)} />}
    {spaceSecretsOpen && spaceSecretsId && <SpaceSecretsPanel spaceId={spaceSecretsId} onClose={() => { setSpaceSecretsOpen(false); setSpaceSecretsId(null) }} />}
    <ArchivedBoardsModal open={archivedBoardsOpen} spaceId={activeSpace} onClose={() => setArchivedBoardsOpen(false)} onRestore={restoreBoard} onDelete={removeBoard} />
    <ArchivedMilestonesModal open={archivedMilestonesOpen} clientId={activeClient} onClose={() => setArchivedMilestonesOpen(false)} onRestore={restoreMilestone} onDelete={removeMilestone} />
    <ArchivedClientsModal open={archivedClientsOpen} onClose={() => setArchivedClientsOpen(false)} onRestore={restoreClient} onDelete={removeClient} />
    <ConfirmDialog open={confirmDialog.open} title={confirmDialog.title} message={confirmDialog.message} confirmLabel={confirmDialog.confirmLabel} variant={confirmDialog.variant} onConfirm={confirmDialog.onConfirm} onCancel={() => setConfirmDialog(v => ({ ...v, open: false }))} />
    <ContactDialog open={contactDialog.open} onClose={() => setContactDialog(v => ({ ...v, open: false }))} onSave={handleContactSave} initialData={contactDialog.data ? { name: contactDialog.data.name, email: contactDialog.data.email, phone: contactDialog.data.phone, company: contactDialog.data.company, position: contactDialog.data.position, address: contactDialog.data.address, website: contactDialog.data.website, notes: contactDialog.data.notes } : undefined} title={contactDialog.mode === 'add' ? 'Nuevo contacto' : 'Editar contacto'} />
    {archiveOpen && <ArchivePanel boards={boards} onClose={() => setArchiveOpen(false)} onUpdate={updateBoardPaymentStatus} />}
  </>
}

