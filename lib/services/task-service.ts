import type { ITaskRepository } from '@/lib/repositories/task-repository'
import type { ICommentRepository } from '@/lib/repositories/comment-repository'
import type { IChecklistRepository } from '@/lib/repositories/checklist-repository'
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/types'
import type { Task } from '@/lib/domain/entities/task'
import type { Comment } from '@/lib/domain/entities/comment'
import type { Checklist, ChecklistItem } from '@/lib/domain/entities/checklist'

export class TaskService {
  constructor(
    private taskRepo: ITaskRepository,
    private commentRepo: ICommentRepository,
    private checklistRepo: IChecklistRepository
  ) {}

  async findByBoardId(boardId: number): Promise<Task[]> {
    return this.taskRepo.findByBoardId(boardId)
  }

  async findById(id: number): Promise<Task | null> {
    return this.taskRepo.findById(id)
  }

  async create(data: CreateTaskInput): Promise<Task> {
    if (!data.title?.trim()) throw new Error('Title is required')
    return this.taskRepo.create(data)
  }

  async update(id: number, data: UpdateTaskInput): Promise<Task | null> {
    return this.taskRepo.update(id, data)
  }

  async delete(id: number): Promise<boolean> {
    return this.taskRepo.delete(id)
  }

  async move(taskId: number, newStatus: string, newPosition: number): Promise<void> {
    await this.taskRepo.reorder(taskId, newPosition)
  }

  async bulkMove(tasks: { id: number; position: number; status: string }[]): Promise<void> {
    await this.taskRepo.bulkUpdate(tasks)
  }

  async getComments(taskId: number): Promise<Comment[]> {
    return this.commentRepo.findByTaskId(taskId)
  }

  async addComment(taskId: number, author: string, content: string): Promise<Comment> {
    if (!content.trim()) throw new Error('Comment content is required')
    return this.commentRepo.create({ taskId, author, content })
  }

  async updateComment(id: number, content: string): Promise<Comment | null> {
    return this.commentRepo.update(id, content)
  }

  async deleteComment(id: number): Promise<boolean> {
    return this.commentRepo.delete(id)
  }

  async getChecklists(taskId: number): Promise<{ id: number; taskId: number; title: string; position: number; createdAt: Date; items: ChecklistItem[] }[]> {
    const checklists = await this.checklistRepo.findByTaskId(taskId)
    const result: { id: number; taskId: number; title: string; position: number; createdAt: Date; items: ChecklistItem[] }[] = []
    for (const cl of checklists) {
      const items = await this.checklistRepo.findItems(cl.id)
      result.push({
        id: cl.id,
        taskId: cl.taskId,
        title: cl.title,
        position: cl.position,
        createdAt: cl.createdAt,
        items
      })
    }
    return result
  }

  async addChecklist(taskId: number, title: string): Promise<Checklist> {
    return this.checklistRepo.create({ taskId, title })
  }

  async updateChecklist(id: number, title: string): Promise<Checklist | null> {
    return this.checklistRepo.update(id, { title })
  }

  async deleteChecklist(id: number): Promise<boolean> {
    return this.checklistRepo.delete(id)
  }

  async addChecklistItem(checklistId: number, title: string): Promise<ChecklistItem> {
    return this.checklistRepo.createItem({ checklistId, title })
  }

  async updateChecklistItem(id: number, data: { title?: string; description?: string; dueDate?: string | null; checked?: boolean }): Promise<ChecklistItem | null> {
    return this.checklistRepo.updateItem(id, data)
  }

  async deleteChecklistItem(id: number): Promise<boolean> {
    return this.checklistRepo.deleteItem(id)
  }
}
