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
    public startDate: string | null = null,
    public dueDate: string | null = null,
    public labels: string[] = []
  ) {}

  get isOverdue(): boolean {
    if (!this.dueDate || this.status === 'done') return false
    return new Date(this.dueDate) < new Date()
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
