const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export class Email {
  public readonly value: string

  constructor(value: string) {
    const trimmed = value.trim()
    if (!EMAIL_REGEX.test(trimmed)) {
      throw new Error(`Invalid email: ${trimmed}`)
    }
    this.value = trimmed.toLowerCase()
  }

  equals(other: Email): boolean {
    return this.value === other.value
  }

  toString(): string {
    return this.value
  }

  static isValid(value: string): boolean {
    return EMAIL_REGEX.test(value.trim())
  }

  static create(value: string): Email | null {
    try {
      return new Email(value)
    } catch {
      return null
    }
  }
}
