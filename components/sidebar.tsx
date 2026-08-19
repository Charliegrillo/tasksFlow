'use client'

import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Sparkles, Users, Handshake, GitBranch, ChevronDown, ChevronRight, PanelLeftClose, PanelLeftOpen, Lock, Unlock, ListTodo, Flag, FolderOpen, LayoutDashboard, Eye, LogOut, Archive } from 'lucide-react'
import type { Board, Client, CrmDeal, CrmStage, Milestone, Space, Task } from '@/lib/db'

interface SidebarProps {
  activeView?: 'board' | 'crm' | 'contacts' | 'pipelines' | null
  onSelectView?: (view: 'board' | 'crm' | 'contacts' | 'pipelines') => void
  crmDealCount?: number
  clients?: Client[]
  milestones?: Milestone[]
  activeClient?: number | null
  onSelectClient?: (id: number) => void
  onEditClient?: (client: Client) => void
  onAddClient?: () => void
  onArchiveClient?: (client: Client) => void
  onShowArchivedClients?: () => void
  spaces?: Space[]
  activeSpace?: number | null
  onSelectSpace?: (id: number) => void
  onEditSpace?: (space: Space) => void
  onRemoveSpace?: (space: Space) => void
  onAddSpace?: () => void
  onOpenSecrets?: (spaceId: number) => void
  boards?: Board[]
  activeBoard?: number | null
  onSelectBoard?: (id: number) => void
  onEditBoard?: (board: Board) => void
  onAddBoard?: () => void
  onAddMilestone?: () => void
  onEditMilestone?: (milestone: Milestone) => void
  onArchiveMilestone?: (milestone: Milestone) => void
  onSelectMilestone?: (milestone: Milestone) => void
  highlightMilestoneId?: number | null
  onArchiveBoard?: (board: Board) => void
  onShowArchivedBoards?: () => void
  onShowArchivedMilestones?: () => void
}

export function Sidebar({
  activeView, onSelectView, crmDealCount,
  clients: providedClients,
  milestones: providedMilestones,
  activeClient, onSelectClient, onEditClient, onAddClient, onArchiveClient, onShowArchivedClients,
  spaces, activeSpace, onSelectSpace, onEditSpace, onRemoveSpace, onAddSpace, onOpenSecrets,
  boards, activeBoard, onSelectBoard, onEditBoard, onAddBoard,
  onAddMilestone, onEditMilestone, onArchiveMilestone, onSelectMilestone, highlightMilestoneId,
  onArchiveBoard, onShowArchivedBoards, onShowArchivedMilestones
}: SidebarProps) {
  const [localClients, setLocalClients] = useState<Client[]>([])
  const [localMilestones, setLocalMilestones] = useState<Milestone[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [localSpaces, setLocalSpaces] = useState<Space[]>([])
  const [localBoards, setLocalBoards] = useState<Board[]>([])
  const [collapsed, setCollapsed] = useState(false)
  const [sectionOpen, setSectionOpen] = useState({
    clients: true,
    milestones: true,
    spaces: true,
    boards: true,
  })
  const [sidebarTab, setSidebarTab] = useState<'tasks' | 'crm'>('tasks')

  const clients = providedClients ?? localClients
  const effectiveSpaces = spaces ?? localSpaces
  const effectiveBoards = boards ?? localBoards
  const milestones = providedMilestones ?? localMilestones

  const toggleSection = (key: keyof typeof sectionOpen) => {
    setSectionOpen(prev => ({ ...prev, [key]: !prev[key] }))
  }

  useEffect(() => {
    if (activeView === 'contacts' || activeView === 'pipelines' || activeView === 'crm') {
      setSidebarTab('crm')
    } else if (activeView === 'board' || activeView === null) {
      setSidebarTab('tasks')
    }
  }, [activeView])

  const handleTabChange = (tab: 'tasks' | 'crm') => {
    setSidebarTab(tab)
    if (tab === 'tasks') {
      onSelectView?.('board')
      return
    }
    onSelectView?.('crm')
  }

  useEffect(() => {
    if (providedClients) return
    fetch('/api/clients').then(r => r.json()).then(d => setLocalClients(d.data ?? []))
    fetch('/api/tasks').then(r => r.json()).then(d => setTasks(d.data ?? []))
  }, [providedClients])

  useEffect(() => {
    if (providedMilestones) return

    if (activeClient) {
      fetch(`/api/milestones?clientId=${activeClient}`).then(r => r.json()).then(d => setLocalMilestones(d.data ?? []))
    } else if (clients.length) {
      const fetches = clients.map(c => fetch(`/api/milestones?clientId=${c.id}`).then(r => r.json()))
      Promise.all(fetches).then(results => setLocalMilestones(results.flatMap(r => r.data ?? [])))
    } else {
      setLocalMilestones([])
    }
  }, [activeClient, clients, providedMilestones])

  useEffect(() => {
    if (!spaces) {
      if (activeClient) {
        fetch(`/api/spaces?clientId=${activeClient}`).then(r => r.json()).then(d => setLocalSpaces(d.data ?? []))
      } else if (clients.length) {
        const fetches = clients.map(c => fetch(`/api/spaces?clientId=${c.id}`).then(r => r.json()))
        Promise.all(fetches).then(results => setLocalSpaces(results.flatMap(r => r.data ?? [])))
      } else {
        setLocalSpaces([])
      }
    }
  }, [activeClient, clients, spaces])

  useEffect(() => {
    if (!boards) {
      if (activeSpace) {
        fetch(`/api/boards?spaceId=${activeSpace}`).then(r => r.json()).then(d => setLocalBoards(d.data ?? []))
      } else if (localSpaces.length) {
        const fetches = localSpaces.map(s => fetch(`/api/boards?spaceId=${s.id}`).then(r => r.json()))
        Promise.all(fetches).then(results => setLocalBoards(results.flatMap(r => r.data ?? [])))
      } else {
        setLocalBoards([])
      }
    }
  }, [activeSpace, boards, localSpaces])

  const completed = tasks.filter(t => t.status === 'done').length
  const visibleSpaces = activeClient ? effectiveSpaces.filter(s => s.clientId === activeClient) : effectiveSpaces
  const visibleBoards = activeSpace ? effectiveBoards.filter(b => b.spaceId === activeSpace) : effectiveBoards
  const sectionLabelClass = 'flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'
  const sectionItemClass = 'flex w-full items-center justify-between rounded-sm px-3 py-2 text-left text-[11px] font-medium transition-colors'
  const entryClass = 'group flex items-center gap-2 rounded-sm px-2.5 py-2 text-sm font-medium transition-colors'

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 border-r border-border bg-card/95 backdrop-blur-sm shadow-[0_0_0_1px_rgba(15,23,42,0.02)] transition-all duration-300 flex flex-col -translate-x-full lg:translate-x-0 ${collapsed ? 'w-24' : 'w-72'}`}>
      <div className="flex h-full w-full flex-col px-3 py-4">
        <div className={`flex items-center gap-3 border-b border-border/80 pb-4 ${collapsed ? 'justify-center' : ''}`}>
          <div className="grid size-9 place-items-center rounded-sm bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm ring-1 ring-primary/20">
            <Sparkles className="size-4" />
          </div>
          {!collapsed && <span className="text-lg font-semibold tracking-tight">Taskflow</span>}
        </div>

        <div className="sidebar-scroll mt-5 flex-1 overflow-y-auto overflow-x-hidden pr-1">
          <div className="mb-3 flex items-center gap-1 rounded-md bg-secondary/50 p-1" role="tablist" aria-label="Navegación principal">
            <button
              type="button"
              role="tab"
              aria-selected={sidebarTab === 'tasks'}
              onClick={() => handleTabChange('tasks')}
              className={`flex-1 rounded px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] transition flex items-center justify-center gap-1.5 ${sidebarTab === 'tasks' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <ListTodo className="size-4" />
              {!collapsed && 'Tasks'}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={sidebarTab === 'crm'}
              onClick={() => handleTabChange('crm')}
              className={`flex-1 rounded px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.12em] transition flex items-center justify-center gap-1.5 ${sidebarTab === 'crm' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <Handshake className="size-4" />
              {!collapsed && 'CRM'}
            </button>
          </div>

          {sidebarTab === 'crm' ? (
            <div className="space-y-3">
              <section>
                <div className="mt-2 flex flex-col gap-1">
                  <button onClick={() => onSelectView?.('contacts')} className={`${entryClass} ${activeView === 'contacts' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/80'}`}>
                    <Users className="size-4" />
                    {!collapsed && <span className="truncate">Contactos</span>}
                    {!collapsed && crmDealCount !== undefined && <span className="ml-auto shrink-0 rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{crmDealCount}</span>}
                  </button>
                  <button onClick={() => onSelectView?.('pipelines')} className={`${entryClass} ${activeView === 'pipelines' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/80'}`}>
                    <GitBranch className="size-4" />
                    {!collapsed && <span className="truncate">Pipelines</span>}
                  </button>
                </div>
              </section>
            </div>
          ) : (
            <div className="space-y-3">
              <section>
                <div className="group/header flex items-center justify-between rounded-sm px-1.5 py-2">
                  <button type="button" onClick={() => toggleSection('clients')} className={`${sectionLabelClass} ${collapsed ? 'w-full justify-center p-2 rounded-sm hover:bg-background/80 transition' : ''}`} title="Clientes">
                    {collapsed ? <Users className="size-4" /> : <ChevronRight className={`size-3.5 transition-transform ${sectionOpen.clients ? 'rotate-90' : ''}`} />}
                    {!collapsed && 'Clientes'}
                  </button>
                  {!collapsed && (
                    <div className="invisible flex items-center gap-1 group-hover/header:visible">
                      {onShowArchivedClients && <button onClick={e => { e.stopPropagation(); onShowArchivedClients() }} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground" aria-label="Ver clientes archivados" title="Ver archivados"><Archive className="size-4" /></button>}
                      {onAddClient && <button onClick={e => { e.stopPropagation(); onAddClient() }} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground" aria-label="Agregar cliente"><Plus className="size-4" /></button>}
                    </div>
                  )}
                </div>
                {sectionOpen.clients && !collapsed && (
                  <div className="mt-2 flex flex-col gap-1">
                    {clients.map(client => (
                      <div key={client.id} className={`${entryClass} ${activeClient === client.id ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/80'}`}>
                        <button onClick={e => { e.stopPropagation(); onSelectClient?.(client.id) }} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                          <span className="grid size-6 shrink-0 place-items-center rounded-sm bg-primary/10 text-[10px] font-bold text-primary">{client.name.slice(0, 2).toUpperCase()}</span>
                          <span className="truncate">{client.name}</span>
                        </button>
                        {onEditClient && <button onClick={e => { e.stopPropagation(); onEditClient(client) }} className="invisible rounded-md p-1 text-muted-foreground hover:text-primary group-hover:visible" aria-label={`Editar cliente ${client.name}`}><Pencil className="size-3.5" /></button>}
                        {onArchiveClient && <button onClick={e => { e.stopPropagation(); onArchiveClient(client) }} className="invisible rounded-md p-1 text-muted-foreground hover:text-amber-500 group-hover:visible" aria-label={`Archivar cliente ${client.name}`}><Archive className="size-3.5" /></button>}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <div className="group/header flex items-center justify-between rounded-sm px-1.5 py-2">
                  <button type="button" onClick={() => toggleSection('milestones')} className={`${sectionLabelClass} ${collapsed ? 'w-full justify-center p-2 rounded-sm hover:bg-background/80 transition' : ''}`} title="Hitos">
                    {collapsed ? <Flag className="size-4" /> : <ChevronRight className={`size-3.5 transition-transform ${sectionOpen.milestones ? 'rotate-90' : ''}`} />}
                    {!collapsed && 'Hitos'}
                  </button>
                  {!collapsed && (
                    <div className="invisible flex items-center gap-1 group-hover/header:visible">
                      {onShowArchivedMilestones && <button onClick={e => { e.stopPropagation(); onShowArchivedMilestones() }} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground" aria-label="Ver hitos archivados" title="Ver archivados"><Archive className="size-4" /></button>}
                      {onAddMilestone && <button onClick={e => { e.stopPropagation(); onAddMilestone() }} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground" aria-label="Agregar hito"><Plus className="size-4" /></button>}
                    </div>
                  )}
                </div>
                {sectionOpen.milestones && !collapsed && (
                  <div className="mt-2 flex flex-col gap-1">
                    {milestones.map(ms => {
                      const msTasks = tasks.filter(t => t.milestoneId === ms.id)
                      const done = msTasks.filter(t => t.status === 'done').length
                      const isActive = highlightMilestoneId === ms.id
                      return (
                        <div key={ms.id} className={`${entryClass} ${isActive ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/80'}`}>
                          <button onClick={e => { e.stopPropagation(); onSelectMilestone?.(ms) }} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                            <span className={`size-2 shrink-0 rounded-sm ${ms.color}`} />
                            <span className="truncate">{ms.name}</span>
                            <span className="ml-auto shrink-0 rounded-sm bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{done}/{msTasks.length}</span>
                          </button>
                          {onEditMilestone && <button onClick={e => { e.stopPropagation(); onEditMilestone(ms) }} className="invisible rounded-md p-1 text-muted-foreground hover:text-primary group-hover:visible" aria-label={`Editar hito ${ms.name}`}><Pencil className="size-3.5" /></button>}
                          {onArchiveMilestone && <button onClick={e => { e.stopPropagation(); onArchiveMilestone(ms) }} className="invisible rounded-md p-1 text-muted-foreground hover:text-amber-500 group-hover:visible" aria-label={`Archivar hito ${ms.name}`}><Archive className="size-3.5" /></button>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>

              {(activeClient || visibleSpaces.length > 0) && <section>
                <div className="group/header flex items-center justify-between rounded-sm px-1.5 py-2">
                  <button type="button" onClick={() => toggleSection('spaces')} className={`${sectionLabelClass} ${collapsed ? 'w-full justify-center p-2 rounded-sm hover:bg-background/80 transition' : ''}`} title="Espacios">
                    {collapsed ? <FolderOpen className="size-4" /> : <ChevronRight className={`size-3.5 transition-transform ${sectionOpen.spaces ? 'rotate-90' : ''}`} />}
                    {!collapsed && 'Espacios'}
                  </button>
                  {!collapsed && onAddSpace && <button onClick={e => { e.stopPropagation(); onAddSpace() }} className="invisible rounded-md p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground group-hover/header:visible" aria-label="Agregar espacio"><Plus className="size-4" /></button>}
                </div>
                {sectionOpen.spaces && !collapsed && (
                  <div className="mt-2 flex flex-col gap-1">
                    {visibleSpaces.map(space => {
                      const hasPassword = !!space.secretPassword?.trim()
                      return (
                        <div key={space.id} className={`${entryClass} ${activeSpace === space.id ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/80'}`}>
                          <button onClick={e => { e.stopPropagation(); onSelectSpace?.(space.id) }} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                            <span className={`size-2 shrink-0 rounded-sm ${space.color}`} />
                            <span className="truncate">{space.name}</span>
                          </button>
                          {onOpenSecrets && (
                            <button
                              onClick={e => { e.stopPropagation(); onOpenSecrets(space.id) }}
                              className={`invisible rounded-md p-1 transition-colors group-hover:visible text-white hover:text-white-400'}`}
                              aria-label={hasPassword ? `Espacio protegido ${space.name}` : `Espacio sin contraseña ${space.name}`}
                              title={hasPassword ? 'Protegido con contraseña' : 'Sin contraseña'}
                            >
                              {hasPassword ? <Lock className="size-4" /> : <Eye className="size-4" />}
                            </button>
                          )}
                          {onEditSpace && <button onClick={e => { e.stopPropagation(); onEditSpace(space) }} className="invisible rounded-md p-1 text-muted-foreground hover:text-primary group-hover:visible" aria-label={`Editar espacio ${space.name}`}><Pencil className="size-3.5" /></button>}
                          {onRemoveSpace && <button onClick={e => { e.stopPropagation(); onRemoveSpace(space) }} className="invisible rounded-md p-1 text-muted-foreground hover:text-destructive group-hover:visible" aria-label={`Eliminar espacio ${space.name}`}><Trash2 className="size-3.5" /></button>}
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>}

              {(activeSpace || visibleBoards.length > 0) && <section>
                <div className="group/header flex items-center justify-between rounded-sm px-1.5 py-2">
                  <button type="button" onClick={() => toggleSection('boards')} className={`${sectionLabelClass} ${collapsed ? 'w-full justify-center p-2 rounded-sm hover:bg-background/80 transition' : ''}`} title="Tableros">
                    {collapsed ? <LayoutDashboard className="size-4" /> : <ChevronRight className={`size-3.5 transition-transform ${sectionOpen.boards ? 'rotate-90' : ''}`} />}
                    {!collapsed && 'Tableros'}
                  </button>
                  {!collapsed && (
                    <div className="invisible flex items-center gap-1 group-hover/header:visible">
                      {onShowArchivedBoards && <button onClick={e => { e.stopPropagation(); onShowArchivedBoards() }} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground" aria-label="Ver tableros archivados" title="Ver archivados"><Archive className="size-4" /></button>}
                      {onAddBoard && <button onClick={e => { e.stopPropagation(); onAddBoard() }} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground" aria-label="Agregar tablero"><Plus className="size-4" /></button>}
                    </div>
                  )}
                </div>
                {sectionOpen.boards && !collapsed && (
                  <div className="mt-2 flex flex-col gap-1">
                    {visibleBoards.map(board => (
                      <div key={board.id} className={`${entryClass} ${activeBoard === board.id ? 'bg-background shadow-sm' : 'text-muted-foreground hover:bg-background/80'}`}>
                        <button onClick={e => { e.stopPropagation(); onSelectBoard?.(board.id) }} className="flex min-w-0 flex-1 items-center gap-2 text-left">
                          <span className="truncate">{board.name}</span>
                        </button>
                        {onEditBoard && <button onClick={e => { e.stopPropagation(); onEditBoard(board) }} className="invisible rounded-md p-1 text-muted-foreground hover:text-primary group-hover:visible" aria-label={`Editar tablero ${board.name}`}><Pencil className="size-3.5" /></button>}
                        {onArchiveBoard && <button onClick={e => { e.stopPropagation(); onArchiveBoard(board) }} className="invisible rounded-md p-1 text-muted-foreground hover:text-amber-500 group-hover:visible" aria-label={`Archivar tablero ${board.name}`}><Archive className="size-3.5" /></button>}
                      </div>
                    ))}
                  </div>
                )}
              </section>}
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="mt-4 shrink-0 rounded-sm border border-border bg-gradient-to-br from-secondary to-secondary/60 p-4 shadow-sm">
            <p className="text-sm font-medium">Progreso semanal</p>
            <p className="mt-1 text-xs text-muted-foreground">{completed} de {tasks.length} tareas completadas</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded bg-background/80">
              <div className="h-full rounded bg-gradient-to-r from-emerald-500 to-green-400" style={{ width: `${tasks.length ? completed / tasks.length * 100 : 0}%` }} />
            </div>
          </div>
        )}

        <div className="mt-auto pt-4 shrink-0">
          <button
            type="button"
            onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.href = '/login' }}
            className={`flex items-center justify-center gap-2 rounded-sm border border-border bg-background/80 text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive ${collapsed ? 'w-full justify-center p-2' : 'w-full px-3 py-2'}`}
            aria-label="Cerrar sesión"
          >
            <LogOut className="size-4" />
            {!collapsed && <span className="text-sm">Cerrar sesión</span>}
          </button>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setCollapsed(prev => !prev)}
        className="absolute right-0 top-4 -translate-y-0 translate-x-1/2 z-50 rounded-full border border-border bg-card p-1.5 text-muted-foreground shadow-md transition hover:border-primary/30 hover:bg-secondary hover:text-foreground"
        aria-label={collapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
      >
        {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
      </button>
    </aside>
  )
}
