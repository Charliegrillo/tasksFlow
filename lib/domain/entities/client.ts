export class Client {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public company: string,
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

  updateEmail(email: string): void {
    this.email = email.trim()
  }

  updateCompany(company: string): void {
    this.company = company.trim()
  }
}
