'use client'

import { MoreHorizontal, Paperclip, GripVertical } from 'lucide-react'
import type { Task, TaskStatus } from '@/lib/db'

type Column = { id: TaskStatus; title: string; color: string; dbId?: number }

interface BoardColumnProps {
  column: Column
  visible: Task[]
  draggedId: number | null
  draggingColumnId: number | null
  dragOver: TaskStatus | null
  dropIndex: number | null
  menu: TaskStatus | null
  columnInputs: Record<string, string>
  addingToColumn: TaskStatus | null
  attachmentCounts: Record<number, number>
  onDragOver: (e: React.DragEvent, columnId: TaskStatus) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent, columnId: TaskStatus) => void
  onTaskDragStart: (e: React.DragEvent, taskId: number) => void
  onTaskDragEnd: () => void
  onListDragStart: (e: React.DragEvent, listId: number) => void
  onSelectTask: (task: Task) => void
  onSetMenu: (menu: TaskStatus | null) => void
  onSetColumnInput: (key: string, value: string) => void
  onSetAddingToColumn: (status: TaskStatus | null) => void
  onAddTask: (status: TaskStatus) => void
  onDeleteList: (column: Column) => void
  onMoveList: (listId: number, position: number) => void
  onSetListMoveDialog: (dialog: { open: boolean; listId: number | null; position: number }) => void
}

export function BoardColumn({
  column,
  visible,
  draggedId,
  draggingColumnId,
  dragOver,
  dropIndex,
  menu,
  columnInputs,
  addingToColumn,
  attachmentCounts,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskDragStart,
  onTaskDragEnd,
  onListDragStart,
  onSelectTask,
  onSetMenu,
  onSetColumnInput,
  onSetAddingToColumn,
  onAddTask,
  onDeleteList,
  onSetListMoveDialog,
}: BoardColumnProps) {
  const colTasks = visible.filter((t) => t.status === column.id)

  return (
    <div
      className={`flex w-[290px] min-w-[290px] flex-col rounded-sm p-2 transition-colors ${dragOver === column.id ? 'bg-secondary/70' : ''}`}
      onDragOver={(e) => onDragOver(e, column.id)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, column.id)}
    >
      <div className="mb-2 flex items-center gap-2 px-1 pt-0.5 pb-1" draggable={!draggingColumnId} onDragStart={(e) => { if (column.dbId) onListDragStart(e, column.dbId) }}>
        <button className="cursor-grab text-muted-foreground hover:text-foreground" tabIndex={-1} aria-label="Reordenar columna">
          <GripVertical className="size-4" />
        </button>
        <span className={`size-2 rounded-sm ${column.color}`} />
        <h3 className="flex-1 text-sm font-semibold">{column.title}</h3>
        <span className="text-xs text-muted-foreground">{colTasks.length}</span>
        <div className="relative">
          <button onClick={() => onSetMenu(menu === column.id ? null : column.id)} className="rounded-sm p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Opciones de columna">
            <MoreHorizontal className="size-4" />
          </button>
          {menu === column.id && (
            <div className="absolute right-0 top-full z-30 mt-1 w-40 rounded-sm border border-border bg-card py-1 shadow-xl">
              {column.dbId && <button onClick={() => { onSetMenu(null); onSetListMoveDialog({ open: true, listId: column.dbId!, position: 1 }) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-secondary">Mover</button>}
              <button onClick={() => { onSetMenu(null); onDeleteList(column) }} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10">Eliminar</button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2">
        {colTasks.map((task) => (
          <article
            key={task.id}
            draggable
            onDragStart={(e) => onTaskDragStart(e, task.id)}
            onDragEnd={onTaskDragEnd}
            onClick={() => onSelectTask(task)}
            className={`cursor-pointer rounded-sm border border-border bg-card p-3 transition-shadow hover:shadow-md ${draggedId === task.id ? 'opacity-50' : ''}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={`size-2 shrink-0 rounded-sm ${task.priority === 'high' ? 'bg-red-500' : task.priority === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                <p className="text-sm font-medium leading-tight">{task.title}</p>
              </div>
              {(attachmentCounts[task.id] ?? 0) > 0 && (
                <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                  <Paperclip className="size-3" />
                  {attachmentCounts[task.id]}
                </span>
              )}
            </div>
            {task.dueDate && (
              <p className={`mt-2 text-xs ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'text-destructive font-medium' : 'text-muted-foreground'}`}>
                {new Date(task.dueDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
              </p>
            )}
          </article>
        ))}
      </div>

      <div className="mt-2">
        {addingToColumn === column.id ? (
          <div className="flex gap-1">
            <input
              autoFocus
              value={columnInputs[column.id] ?? ''}
              onChange={(e) => onSetColumnInput(column.id, e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onAddTask(column.id); if (e.key === 'Escape') onSetAddingToColumn(null) }}
              className="flex-1 rounded-sm border border-border bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
              placeholder="Título de la tarea..."
            />
            <button onClick={() => onAddTask(column.id)} className="rounded-sm bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90">+</button>
            <button onClick={() => onSetAddingToColumn(null)} className="rounded-sm border border-border px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary">x</button>
          </div>
        ) : (
          <button onClick={() => onSetAddingToColumn(column.id)} className="flex w-full items-center gap-1.5 rounded-sm px-2 py-1.5 text-xs text-muted-foreground hover:bg-secondary hover:text-foreground">
            <span className="text-sm">+</span> Añadir tarea
          </button>
        )}
      </div>
    </div>
  )
}
