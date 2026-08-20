export class Contact {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public phone: string,
    public company: string,
    public position: string,
    public address: string,
    public website: string,
    public notes: string,
    public readonly createdAt: Date
  ) {}

  get displayName(): string {
    return this.name || this.email || 'Sin nombre'
  }

  get hasEmail(): boolean {
    return this.email.trim() !== ''
  }

  get hasPhone(): boolean {
    return this.phone.trim() !== ''
  }

  update(data: {
    name?: string
    email?: string
    phone?: string
    company?: string
    position?: string
    address?: string
    website?: string
    notes?: string
  }): void {
    if (data.name !== undefined) {
      if (!data.name.trim()) throw new Error('Name cannot be empty')
      this.name = data.name.trim()
    }
    if (data.email !== undefined) this.email = data.email.trim()
    if (data.phone !== undefined) this.phone = data.phone.trim()
    if (data.company !== undefined) this.company = data.company.trim()
    if (data.position !== undefined) this.position = data.position.trim()
    if (data.address !== undefined) this.address = data.address.trim()
    if (data.website !== undefined) this.website = data.website.trim()
    if (data.notes !== undefined) this.notes = data.notes.trim()
  }
}
