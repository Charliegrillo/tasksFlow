export class Milestone {
  constructor(
    public readonly id: number,
    public name: string,
    public color: string,
    public clientId: number,
    public archived: boolean,
    public readonly createdAt: Date
  ) {}

  get isArchived(): boolean {
    return this.archived
  }

  archive(): void {
    this.archived = true
  }

  unarchive(): void {
    this.archived = false
  }

  updateName(name: string): void {
    if (!name.trim()) throw new Error('Name cannot be empty')
    this.name = name.trim()
  }

  updateColor(color: string): void {
    this.color = color
  }
}
