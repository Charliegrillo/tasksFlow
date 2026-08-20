import type { BoardPaymentStatus } from '@/lib/types'

export class Board {
  constructor(
    public readonly id: number,
    public name: string,
    public type: string,
    public spaceId: number,
    public paymentStatus: BoardPaymentStatus,
    public archived: boolean,
    public readonly createdAt: Date
  ) {}

  get isArchived(): boolean {
    return this.archived
  }

  get isRoadmap(): boolean {
    return this.type === 'roadmap'
  }

  archive(): void {
    this.archived = true
  }

  unarchive(): void {
    this.archived = false
  }

  changePaymentStatus(status: BoardPaymentStatus): void {
    this.paymentStatus = status
  }

  updateName(name: string): void {
    if (!name.trim()) throw new Error('Name cannot be empty')
    this.name = name.trim()
  }
}
