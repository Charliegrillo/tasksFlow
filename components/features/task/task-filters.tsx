'use client'

import { Search, SlidersHorizontal, X, LayoutGrid, List, DollarSign } from 'lucide-react'
import type { BoardList, Milestone, TaskPriority, TaskStatus } from '@/lib/db'

interface TaskFiltersProps {
  search: string
  filter: TaskPriority | 'all'
  filterStatus: TaskStatus | 'all'
  filterMilestone: number | 'all' | 'none'
  view: 'board' | 'list'
  boardLists: BoardList[]
  milestones: Milestone[]
  selectedMilestoneId: number | null
  resolvedMilestoneId: number | null
  activeBoard: boolean
  onSetSearch: (search: string) => void
  onSetFilter: (filter: TaskPriority | 'all') => void
  onSetFilterStatus: (status: TaskStatus | 'all') => void
  onSetFilterMilestone: (milestone: number | 'all' | 'none') => void
  onSetView: (view: 'board' | 'list') => void
  onSetBudgetOpen: (open: boolean) => void
  onClearFilters: () => void
}

export function TaskFilters({
  search,
  filter,
  filterStatus,
  filterMilestone,
  view,
  boardLists,
  milestones,
  selectedMilestoneId,
  resolvedMilestoneId,
  activeBoard,
  onSetSearch,
  onSetFilter,
  onSetFilterStatus,
  onSetFilterMilestone,
  onSetView,
  onSetBudgetOpen,
  onClearFilters,
}: TaskFiltersProps) {
  const hasActiveFilters = search || filter !== 'all' || filterStatus !== 'all' || (filterMilestone !== 'all' && filterMilestone !== selectedMilestoneId && filterMilestone !== resolvedMilestoneId)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <input value={search} onChange={e => onSetSearch(e.target.value)} className="w-full rounded-sm border border-border bg-card pl-9 pr-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-primary" placeholder="Buscar tareas..." />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2.5">
          <SlidersHorizontal className="size-4 text-muted-foreground" />
          <select value={filter} onChange={e => onSetFilter(e.target.value as TaskPriority | 'all')} className="bg-card text-sm font-medium text-foreground outline-none cursor-pointer" aria-label="Filtrar por prioridad">
            <option value="all" className="bg-card text-foreground">Prioridad</option>
            <option value="high" className="bg-card text-foreground">Alta</option>
            <option value="medium" className="bg-card text-foreground">Media</option>
            <option value="low" className="bg-card text-foreground">Baja</option>
          </select>
          {filter !== 'all' && <button onClick={() => onSetFilter('all')} className="ml-1 rounded-sm bg-primary/10 p-0.5 text-primary hover:bg-primary/20"><X className="size-3" /></button>}
        </div>

        <div className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2.5">
          <select value={filterStatus} onChange={e => onSetFilterStatus(e.target.value as TaskStatus | 'all')} className="bg-card text-sm font-medium text-foreground outline-none cursor-pointer" aria-label="Filtrar por estado">
            <option value="all" className="bg-card text-foreground">Estado</option>
            {boardLists.map(list => {
              const mappedId = ({ Backlog: 'backlog', 'En progreso': 'progress', 'En revisión': 'review', Completado: 'done' } as Record<string, string>)[list.name] ?? `list-${list.id}`
              return <option key={list.id} value={mappedId} className="bg-card text-foreground">{list.name}</option>
            })}
          </select>
          {filterStatus !== 'all' && <button onClick={() => onSetFilterStatus('all')} className="ml-1 rounded-sm bg-primary/10 p-0.5 text-primary hover:bg-primary/20"><X className="size-3" /></button>}
        </div>

        <div className="flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-2.5">
          <select value={filterMilestone} onChange={e => onSetFilterMilestone(e.target.value === 'all' || e.target.value === 'none' ? e.target.value : Number(e.target.value))} className="bg-card text-sm font-medium text-foreground outline-none cursor-pointer" aria-label="Filtrar por hito">
            <option value="all" className="bg-card text-foreground">Hito</option>
            {milestones.map(ms => <option key={ms.id} value={ms.id} className="bg-card text-foreground">{ms.name}</option>)}
            <option value="none" className="bg-card text-foreground">Sin hito</option>
          </select>
          {filterMilestone !== 'all' && <button onClick={() => onSetFilterMilestone(selectedMilestoneId ?? resolvedMilestoneId ?? 'all')} className="ml-1 rounded-sm bg-primary/10 p-0.5 text-primary hover:bg-primary/20"><X className="size-3" /></button>}
        </div>

        {hasActiveFilters && (
          <button onClick={onClearFilters} className="flex items-center gap-1.5 rounded-sm bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/20">
            <X className="size-3.5" />
            Limpiar
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button onClick={() => onSetView(view === 'board' ? 'list' : 'board')} className="rounded-sm border border-border p-2.5 text-muted-foreground hover:bg-secondary" aria-label="Cambiar vista">{view === 'board' ? <List className="size-4" /> : <LayoutGrid className="size-4" />}</button>
        {activeBoard && <button onClick={() => onSetBudgetOpen(true)} className="flex items-center gap-2 rounded-sm border border-border px-3 py-2.5 text-sm text-muted-foreground hover:bg-secondary"><DollarSign className="size-4" /> Presupuesto</button>}
      </div>
    </div>
  )
}
