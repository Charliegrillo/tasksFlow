export class Checklist {
  constructor(
    public readonly id: number,
    public taskId: number,
    public title: string,
    public position: number,
    public readonly createdAt: Date
  ) {}

  get progress(): { checked: number; total: number; percentage: number } {
    return { checked: 0, total: 0, percentage: 0 }
  }

  updateTitle(title: string): void {
    if (!title.trim()) throw new Error('Title cannot be empty')
    this.title = title.trim()
  }

  reorder(newPosition: number): void {
    this.position = newPosition
  }
}

export class ChecklistItem {
  constructor(
    public readonly id: number,
    public checklistId: number,
    public title: string,
    public description: string,
    public dueDate: string | null,
    public checked: boolean,
    public position: number,
    public readonly createdAt: Date
  ) {}

  get isCompleted(): boolean {
    return this.checked
  }

  get isOverdue(): boolean {
    if (!this.dueDate || this.checked) return false
    return new Date(this.dueDate) < new Date()
  }

  toggle(): void {
    this.checked = !this.checked
  }

  check(): void {
    this.checked = true
  }

  uncheck(): void {
    this.checked = false
  }

  updateTitle(title: string): void {
    if (!title.trim()) throw new Error('Title cannot be empty')
    this.title = title.trim()
  }

  updateDescription(description: string): void {
    this.description = description
  }

  updateDueDate(dueDate: string | null): void {
    this.dueDate = dueDate
  }

  reorder(newPosition: number): void {
    this.position = newPosition
  }
}
