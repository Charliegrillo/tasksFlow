export class Comment {
  constructor(
    public readonly id: number,
    public taskId: number,
    public author: string,
    public content: string,
    public readonly createdAt: Date
  ) {}

  updateContent(content: string): void {
    if (!content.trim()) throw new Error('Content cannot be empty')
    this.content = content.trim()
  }
}
