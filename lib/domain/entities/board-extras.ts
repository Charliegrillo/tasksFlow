import type { BoardPaymentStatus } from '@/lib/types'

export class BoardList {
  constructor(
    public readonly id: number,
    public boardId: number,
    public name: string,
    public color: string,
    public position: number,
    public readonly createdAt: Date
  ) {}

  updateName(name: string): void {
    if (!name.trim()) throw new Error('Name cannot be empty')
    this.name = name.trim()
  }

  updateColor(color: string): void {
    this.color = color
  }

  reorder(newPosition: number): void {
    this.position = newPosition
  }
}

export class Attachment {
  constructor(
    public readonly id: number,
    public taskId: number,
    public name: string,
    public pathname: string,
    public size: number,
    public contentType: string,
    public readonly createdAt: Date
  ) {}

  get isImage(): boolean {
    return this.contentType.startsWith('image/')
  }

  get formattedSize(): string {
    if (this.size < 1024) return `${this.size} B`
    if (this.size < 1024 * 1024) return `${(this.size / 1024).toFixed(1)} KB`
    return `${(this.size / (1024 * 1024)).toFixed(1)} MB`
  }
}
