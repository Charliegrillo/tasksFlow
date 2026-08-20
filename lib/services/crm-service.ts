import type { ICrmRepository } from '@/lib/repositories/crm-repository'
import type { IContactRepository } from '@/lib/repositories/contact-repository'
import type { CreateCrmStageInput, CreateCrmDealInput, CreateCrmInteractionInput } from '@/lib/types'
import type { CrmStage, CrmDeal, CrmInteraction, CrmDealComment, CrmDealAttachment } from '@/lib/domain/entities/crm'
import type { Contact } from '@/lib/domain/entities/contact'

export interface CrmStageWithDeals {
  id: number
  name: string
  color: string
  position: number
  createdAt: Date
  deals: { id: number; contactId: number; stageId: number; budgetAmount: number; notes: string; createdAt: Date; updatedAt: Date; contact: Contact | null }[]
}

export class CrmService {
  constructor(
    private crmRepo: ICrmRepository,
    private contactRepo: IContactRepository
  ) {}

  async getStages(): Promise<CrmStage[]> {
    return this.crmRepo.findStages()
  }

  async createStage(data: CreateCrmStageInput): Promise<CrmStage> {
    return this.crmRepo.createStage(data)
  }

  async updateStage(id: number, data: { name?: string; color?: string }): Promise<CrmStage | null> {
    return this.crmRepo.updateStage(id, data)
  }

  async deleteStage(id: number): Promise<boolean> {
    return this.crmRepo.deleteStage(id)
  }

  async reorderStage(id: number, newPosition: number): Promise<void> {
    await this.crmRepo.reorderStage(id, newPosition)
  }

  async getStagesWithDeals(): Promise<CrmStageWithDeals[]> {
    const stages = await this.crmRepo.findStages()
    const result: CrmStageWithDeals[] = []

    for (const stage of stages) {
      const deals = await this.crmRepo.findDealsByStageId(stage.id)
      const dealsWithContacts: { id: number; contactId: number; stageId: number; budgetAmount: number; notes: string; createdAt: Date; updatedAt: Date; contact: Contact | null }[] = []

      for (const deal of deals) {
        const contact = await this.contactRepo.findById(deal.contactId)
        dealsWithContacts.push({
          id: deal.id,
          contactId: deal.contactId,
          stageId: deal.stageId,
          budgetAmount: deal.budgetAmount,
          notes: deal.notes,
          createdAt: deal.createdAt,
          updatedAt: deal.updatedAt,
          contact
        })
      }

      result.push({
        id: stage.id,
        name: stage.name,
        color: stage.color,
        position: stage.position,
        createdAt: stage.createdAt,
        deals: dealsWithContacts
      })
    }

    return result
  }

  async createDeal(data: CreateCrmDealInput): Promise<CrmDeal> {
    const contact = await this.contactRepo.findById(data.contactId)
    if (!contact) throw new Error('Contact not found')
    return this.crmRepo.createDeal(data)
  }

  async updateDeal(id: number, data: { stageId?: number; budgetAmount?: number; notes?: string }): Promise<CrmDeal | null> {
    return this.crmRepo.updateDeal(id, data)
  }

  async deleteDeal(id: number): Promise<boolean> {
    return this.crmRepo.deleteDeal(id)
  }

  async moveDeal(dealId: number, newStageId: number): Promise<CrmDeal | null> {
    return this.crmRepo.updateDeal(dealId, { stageId: newStageId })
  }

  async getInteractions(dealId: number): Promise<CrmInteraction[]> {
    return this.crmRepo.findInteractions(dealId)
  }

  async addInteraction(data: CreateCrmInteractionInput): Promise<CrmInteraction> {
    return this.crmRepo.createInteraction(data)
  }

  async deleteInteraction(id: number): Promise<boolean> {
    return this.crmRepo.deleteInteraction(id)
  }

  async getDealComments(dealId: number): Promise<CrmDealComment[]> {
    return this.crmRepo.findDealComments(dealId)
  }

  async addDealComment(dealId: number, author: string, content: string): Promise<CrmDealComment> {
    return this.crmRepo.createDealComment(dealId, author, content)
  }

  async deleteDealComment(id: number): Promise<boolean> {
    return this.crmRepo.deleteDealComment(id)
  }

  async getDealAttachments(dealId: number): Promise<CrmDealAttachment[]> {
    return this.crmRepo.findDealAttachments(dealId)
  }

  async addDealAttachment(dealId: number, data: { name: string; pathname: string; size: number; contentType: string }): Promise<CrmDealAttachment> {
    return this.crmRepo.createDealAttachment(dealId, data)
  }

  async deleteDealAttachment(id: number): Promise<boolean> {
    return this.crmRepo.deleteDealAttachment(id)
  }

  async getAllContacts(): Promise<Contact[]> {
    return this.contactRepo.findAll()
  }

  async searchContacts(query: string): Promise<Contact[]> {
    return this.contactRepo.search(query)
  }
}
