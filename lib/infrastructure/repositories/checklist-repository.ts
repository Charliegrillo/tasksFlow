import { db } from '@/lib/infrastructure/database/connection'
import { mapChecklist, mapChecklistItem } from '@/lib/infrastructure/database/mappers'
import type { IChecklistRepository } from '@/lib/repositories/checklist-repository'
import type { Checklist, ChecklistItem } from '@/lib/domain/entities/checklist'
import type { CreateChecklistInput, UpdateChecklistInput, CreateChecklistItemInput, UpdateChecklistItemInput } from '@/lib/types'

export class ChecklistRepository implements IChecklistRepository {
  async findById(id: number): Promise<Checklist | null> {
    const row = await db.prepare('SELECT * FROM checklists WHERE id=?').get(id)
    return row ? mapChecklist(row) : null
  }

  async findByTaskId(taskId: number): Promise<Checklist[]> {
    return (await db.prepare('SELECT * FROM checklists WHERE task_id=? ORDER BY position ASC, id ASC').all(taskId)).map(mapChecklist)
  }

  async create(data: CreateChecklistInput): Promise<Checklist> {
    const maxPos = (await db.prepare('SELECT COALESCE(MAX(position), -1) + 1 as pos FROM checklists WHERE task_id=?').get(data.taskId) as { pos: number }).pos
    const result = await db.prepare('INSERT INTO checklists (task_id, title, position) VALUES (?, ?, ?)')
      .run(data.taskId, data.title.trim() || 'Checklist', maxPos)
    return mapChecklist(await db.prepare('SELECT * FROM checklists WHERE id=?').get(result.lastInsertRowid)!)
  }

  async update(id: number, data: UpdateChecklistInput): Promise<Checklist | null> {
    const current = await db.prepare('SELECT * FROM checklists WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE checklists SET title=? WHERE id=?').run(data.title.trim() || 'Checklist', id)
    return mapChecklist(await db.prepare('SELECT * FROM checklists WHERE id=?').get(id)!)
  }

  async delete(id: number): Promise<boolean> {
    await db.prepare('DELETE FROM checklist_items WHERE checklist_id=?').run(id)
    return (await db.prepare('DELETE FROM checklists WHERE id=?').run(id)).changes > 0
  }

  async reorder(id: number, newPosition: number): Promise<void> {
    await db.prepare('UPDATE checklists SET position=? WHERE id=?').run(newPosition, id)
  }

  async findItems(checklistId: number): Promise<ChecklistItem[]> {
    return (await db.prepare('SELECT * FROM checklist_items WHERE checklist_id=? ORDER BY position ASC, id ASC').all(checklistId)).map(mapChecklistItem)
  }

  async findItemById(id: number): Promise<ChecklistItem | null> {
    const row = await db.prepare('SELECT * FROM checklist_items WHERE id=?').get(id)
    return row ? mapChecklistItem(row) : null
  }

  async createItem(data: CreateChecklistItemInput): Promise<ChecklistItem> {
    const maxPos = (await db.prepare('SELECT COALESCE(MAX(position), -1) + 1 as pos FROM checklist_items WHERE checklist_id=?').get(data.checklistId) as { pos: number }).pos
    const result = await db.prepare('INSERT INTO checklist_items (checklist_id, title, position) VALUES (?, ?, ?)')
      .run(data.checklistId, data.title.trim(), maxPos)
    return mapChecklistItem(await db.prepare('SELECT * FROM checklist_items WHERE id=?').get(result.lastInsertRowid)!)
  }

  async updateItem(id: number, data: UpdateChecklistItemInput): Promise<ChecklistItem | null> {
    const current = await db.prepare('SELECT * FROM checklist_items WHERE id=?').get(id)
    if (!current) return null
    const next = {
      title: data.title ?? current.title as string,
      description: data.description ?? current.description as string,
      dueDate: data.dueDate !== undefined ? data.dueDate : current.due_date as string | null,
      checked: data.checked ?? Boolean(current.checked),
    }
    await db.prepare('UPDATE checklist_items SET title=?, description=?, due_date=?, checked=? WHERE id=?')
      .run(next.title, next.description, next.dueDate, next.checked ? 1 : 0, id)
    return mapChecklistItem(await db.prepare('SELECT * FROM checklist_items WHERE id=?').get(id)!)
  }

  async deleteItem(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM checklist_items WHERE id=?').run(id)).changes > 0
  }

  async reorderItem(id: number, newPosition: number): Promise<void> {
    await db.prepare('UPDATE checklist_items SET position=? WHERE id=?').run(newPosition, id)
  }
}
