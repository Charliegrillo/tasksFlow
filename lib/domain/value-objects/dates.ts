export class DateRange {
  constructor(
    public readonly start: Date,
    public readonly end: Date
  ) {
    if (start > end) throw new Error('Start date must be before end date')
  }

  contains(date: Date): boolean {
    return date >= this.start && date <= this.end
  }

  overlaps(other: DateRange): boolean {
    return this.start <= other.end && other.start <= this.end
  }

  durationInDays(): number {
    const diff = this.end.getTime() - this.start.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  static fromStrings(start: string, end: string): DateRange {
    return new DateRange(new Date(start), new Date(end))
  }
}

export class CalendarDate {
  constructor(public readonly value: Date) {}

  get isPast(): boolean {
    return this.value < new Date()
  }

  get isFuture(): boolean {
    return this.value > new Date()
  }

  get isToday(): boolean {
    const today = new Date()
    return (
      this.value.getFullYear() === today.getFullYear() &&
      this.value.getMonth() === today.getMonth() &&
      this.value.getDate() === today.getDate()
    )
  }

  get daysUntil(): number {
    const diff = this.value.getTime() - new Date().getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  format(): string {
    return this.value.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  formatShort(): string {
    return this.value.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  equals(other: CalendarDate): boolean {
    return this.value.toISOString() === other.value.toISOString()
  }

  static fromString(date: string): CalendarDate | null {
    try {
      const d = new Date(date)
      if (isNaN(d.getTime())) return null
      return new CalendarDate(d)
    } catch {
      return null
    }
  }

  static today(): CalendarDate {
    return new CalendarDate(new Date())
  }
}
