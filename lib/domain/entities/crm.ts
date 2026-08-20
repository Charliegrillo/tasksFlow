export type CrmInteractionType = 'presupuesto' | 'respuesta' | 'videollamada'

export class CrmStage {
  constructor(
    public readonly id: number,
    public name: string,
    public color: string,
    public position: number,
    public readonly createdAt: Date
  ) {}

  updateName(name: string): void {
    if (!name.trim()) throw new Error('Name cannot be empty')
    this.name = name.trim()
  }

  updateColor(color: string): void {
    this.color = color
  }

  reorder(newPosition: number): void {
    this.position = newPosition
  }
}

export class CrmDeal {
  constructor(
    public readonly id: number,
    public contactId: number,
    public stageId: number,
    public budgetAmount: number,
    public notes: string,
    public readonly createdAt: Date,
    public updatedAt: Date
  ) {}

  get hasBudget(): boolean {
    return this.budgetAmount > 0
  }

  updateStage(stageId: number): void {
    this.stageId = stageId
    this.updatedAt = new Date()
  }

  updateBudget(amount: number): void {
    if (amount < 0) throw new Error('Budget amount cannot be negative')
    this.budgetAmount = amount
    this.updatedAt = new Date()
  }

  updateNotes(notes: string): void {
    this.notes = notes
    this.updatedAt = new Date()
  }
}

export class CrmInteraction {
  constructor(
    public readonly id: number,
    public dealId: number,
    public type: CrmInteractionType,
    public description: string,
    public date: string,
    public readonly createdAt: Date
  ) {}

  updateDescription(description: string): void {
    this.description = description
  }

  updateType(type: CrmInteractionType): void {
    this.type = type
  }
}

export class CrmDealComment {
  constructor(
    public readonly id: number,
    public dealId: number,
    public author: string,
    public content: string,
    public readonly createdAt: Date
  ) {}
}

export class CrmDealAttachment {
  constructor(
    public readonly id: number,
    public dealId: number,
    public name: string,
    public pathname: string,
    public size: number,
    public contentType: string,
    public readonly createdAt: Date
  ) {}
}
