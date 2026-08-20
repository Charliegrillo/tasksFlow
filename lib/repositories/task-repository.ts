import type { Task } from '@/lib/domain/entities/task'
import type { CreateTaskInput, UpdateTaskInput } from '@/lib/types'

export interface ITaskRepository {
  findById(id: number): Promise<Task | null>
  findByBoardId(boardId: number): Promise<Task[]>
  findByMilestoneId(milestoneId: number): Promise<Task[]>
  create(data: CreateTaskInput): Promise<Task>
  update(id: number, data: UpdateTaskInput): Promise<Task | null>
  delete(id: number): Promise<boolean>
  reorder(id: number, newPosition: number): Promise<void>
  bulkUpdate(tasks: { id: number; position: number; status: string }[]): Promise<void>
  count(): Promise<number>
}
