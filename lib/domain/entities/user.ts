export class User {
  constructor(
    public readonly id: number,
    public name: string,
    public email: string,
    public readonly createdAt: Date
  ) {}

  updateName(name: string): void {
    if (!name.trim()) throw new Error('Name cannot be empty')
    this.name = name.trim()
  }

  updateEmail(email: string): void {
    if (!email.trim()) throw new Error('Email cannot be empty')
    this.email = email.trim().toLowerCase()
  }
}

export class PasswordResetToken {
  constructor(
    public readonly id: number,
    public userId: number,
    public token: string,
    public expiresAt: Date,
    public readonly createdAt: Date
  ) {}

  get isExpired(): boolean {
    return new Date() > this.expiresAt
  }

  get isValid(): boolean {
    return !this.isExpired
  }
}
