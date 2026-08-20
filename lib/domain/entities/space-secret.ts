export type SpaceSecretType = 'password' | 'config' | 'key' | 'token' | 'other'

export class SpaceSecret {
  constructor(
    public readonly id: number,
    public spaceId: number,
    public name: string,
    public value: string,
    public type: SpaceSecretType,
    public notes: string,
    public readonly createdAt: Date
  ) {}

  updateName(name: string): void {
    if (!name.trim()) throw new Error('Name cannot be empty')
    this.name = name.trim()
  }

  updateValue(value: string): void {
    this.value = value
  }

  updateType(type: SpaceSecretType): void {
    this.type = type
  }

  updateNotes(notes: string): void {
    this.notes = notes
  }
}
