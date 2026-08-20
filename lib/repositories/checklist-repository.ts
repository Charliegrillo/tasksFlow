import type { Checklist, ChecklistItem } from '@/lib/domain/entities/checklist'
import type { CreateChecklistInput, UpdateChecklistInput, CreateChecklistItemInput, UpdateChecklistItemInput } from '@/lib/types'

export interface IChecklistRepository {
  findById(id: number): Promise<Checklist | null>
  findByTaskId(taskId: number): Promise<Checklist[]>
  create(data: CreateChecklistInput): Promise<Checklist>
  update(id: number, data: UpdateChecklistInput): Promise<Checklist | null>
  delete(id: number): Promise<boolean>
  reorder(id: number, newPosition: number): Promise<void>

  // Items
  findItems(checklistId: number): Promise<ChecklistItem[]>
  findItemById(id: number): Promise<ChecklistItem | null>
  createItem(data: CreateChecklistItemInput): Promise<ChecklistItem>
  updateItem(id: number, data: UpdateChecklistItemInput): Promise<ChecklistItem | null>
  deleteItem(id: number): Promise<boolean>
  reorderItem(id: number, newPosition: number): Promise<void>
}
