export class Space {
  constructor(
    public readonly id: number,
    public name: string,
    public color: string,
    public readonly createdAt: Date,
    public clientId: number,
    public secretPassword: string | null = null
  ) {}

  get hasPassword(): boolean {
    return this.secretPassword !== null && this.secretPassword.trim() !== ''
  }

  updateName(name: string): void {
    if (!name.trim()) throw new Error('Name cannot be empty')
    this.name = name.trim()
  }

  updateColor(color: string): void {
    this.color = color
  }

  setPassword(password: string | null): void {
    this.secretPassword = password
  }
}
