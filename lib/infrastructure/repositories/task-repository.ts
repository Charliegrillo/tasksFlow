import { db } from '@/lib/infrastructure/database/connection'
import { mapTask } from '@/lib/infrastructure/database/mappers'
import type { ITaskRepository } from '@/lib/repositories/task-repository'
import type { Task } from '@/lib/domain/entities/task'
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/types'

export class TaskRepository implements ITaskRepository {
  async findById(id: number): Promise<Task | null> {
    const row = await db.prepare('SELECT * FROM tasks WHERE id=?').get(id)
    return row ? mapTask(row) : null
  }

  async findByBoardId(boardId: number): Promise<Task[]> {
    const rows = await db.prepare('SELECT * FROM tasks WHERE board_id=? ORDER BY position ASC, id ASC').all(boardId)
    return rows.map(mapTask)
  }

  async findAll(): Promise<Task[]> {
    const rows = await db.prepare('SELECT * FROM tasks ORDER BY id ASC').all()
    return rows.map(mapTask)
  }

  async findByMilestoneId(milestoneId: number): Promise<Task[]> {
    const rows = await db.prepare('SELECT * FROM tasks WHERE milestone_id=? ORDER BY position ASC, id ASC').all(milestoneId)
    return rows.map(mapTask)
  }

  async create(data: CreateTaskInput): Promise<Task> {
    const boardId = data.boardId
    const status = data.status ?? 'backlog'
    const maxPos = (await db.prepare('SELECT COALESCE(MAX(position), -1) + 1 as pos FROM tasks WHERE board_id=? AND status=?').get(boardId, status) as { pos: number }).pos
    const result = await db.prepare(
      'INSERT INTO tasks (title, description, status, priority, assignee, start_date, due_date, labels, board_id, position, milestone_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(
      data.title, data.description ?? '', status, data.priority ?? 'medium', data.assignee ?? 'AM',
      data.startDate ?? null, data.dueDate ?? null, JSON.stringify(data.labels ?? []),
      boardId, maxPos, data.milestoneId ?? null
    )
    return mapTask(await db.prepare('SELECT * FROM tasks WHERE id=?').get(result.lastInsertRowid)!)
  }

  async update(id: number, input: UpdateTaskInput): Promise<Task | null> {
    const current = await db.prepare('SELECT * FROM tasks WHERE id=?').get(id)
    if (!current) return null
    const next = {
      title: input.title ?? current.title as string,
      description: input.description ?? current.description as string,
      status: input.status ?? current.status as string,
      priority: input.priority ?? current.priority as string,
      assignee: input.assignee ?? current.assignee as string,
      startDate: input.startDate !== undefined ? input.startDate : current.start_date as string | null,
      dueDate: input.dueDate !== undefined ? input.dueDate : current.due_date as string | null,
      labels: input.labels ?? JSON.parse(current.labels as string ?? '[]'),
      milestoneId: input.milestoneId !== undefined ? input.milestoneId : current.milestone_id as number | null,
    }
    await db.prepare('UPDATE tasks SET title=?, description=?, status=?, priority=?, assignee=?, start_date=?, due_date=?, labels=?, milestone_id=? WHERE id=?')
      .run(next.title, next.description, next.status, next.priority, next.assignee, next.startDate, next.dueDate, JSON.stringify(next.labels), next.milestoneId, id)
    return mapTask(await db.prepare('SELECT * FROM tasks WHERE id=?').get(id)!)
  }

  async delete(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM tasks WHERE id=?').run(id)).changes > 0
  }

  async reorder(id: number, newStatus: string, newPosition: number): Promise<void> {
    const task = await db.prepare('SELECT * FROM tasks WHERE id=?').get(id) as { board_id: number; status: string; position: number } | undefined
    if (!task) return
    const oldStatus = task.status
    await db.prepare('UPDATE tasks SET status=?, position=? WHERE id=?').run(newStatus, newPosition, id)
    if (oldStatus !== newStatus) {
      await db.prepare('UPDATE tasks SET position=position+1 WHERE board_id=? AND status=? AND position>=? AND id!=?').run(task.board_id, oldStatus, newPosition, id)
    } else {
      await db.prepare('UPDATE tasks SET position=position+1 WHERE board_id=? AND status=? AND position>=? AND id!=?').run(task.board_id, newStatus, newPosition, id)
    }
  }

  async bulkUpdate(tasks: { id: number; position: number; status: string }[]): Promise<void> {
    for (const t of tasks) {
      await db.prepare('UPDATE tasks SET position=?, status=? WHERE id=?').run(t.position, t.status, t.id)
    }
  }

  async count(): Promise<number> {
    const result = await db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }
    return result.count
  }
}
