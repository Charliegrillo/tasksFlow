import type { TaskStatus, TaskPriority } from '@/lib/types'

export class Task {
  constructor(
    public readonly id: number,
    public title: string,
    public description: string,
    public status: TaskStatus,
    public priority: TaskPriority,
    public assignee: string,
    public readonly createdAt: Date,
    public boardId?: number,
    public position: number = 0,
    public milestoneId: number | null = null,
    public startDate: Date | null = null,
    public dueDate: Date | null = null,
    public labels: string[] = []
  ) {}

  get isOverdue(): boolean {
    return this.dueDate ? this.dueDate < new Date() && this.status !== 'done' : false
  }

  get isDone(): boolean {
    return this.status === 'done'
  }

  get isHighPriority(): boolean {
    return this.priority === 'high'
  }

  changeStatus(newStatus: TaskStatus): void {
    this.status = newStatus
  }

  reorder(newPosition: number): void {
    this.position = newPosition
  }

  addLabel(label: string): void {
    if (!this.labels.includes(label)) {
      this.labels.push(label)
    }
  }

  removeLabel(label: string): void {
    this.labels = this.labels.filter((l) => l !== label)
  }

  updateTitle(title: string): void {
    if (!title.trim()) throw new Error('Title cannot be empty')
    this.title = title.trim()
  }
}
