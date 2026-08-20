import type { CrmStage, CrmDeal, CrmInteraction, CrmDealComment, CrmDealAttachment } from '@/lib/domain/entities/crm'
import type { CreateCrmStageInput, CreateCrmDealInput, CreateCrmInteractionInput } from '@/lib/types'

export interface ICrmRepository {
  // Stages
  findStages(): Promise<CrmStage[]>
  findStageById(id: number): Promise<CrmStage | null>
  createStage(data: CreateCrmStageInput): Promise<CrmStage>
  updateStage(id: number, data: { name?: string; color?: string }): Promise<CrmStage | null>
  deleteStage(id: number): Promise<boolean>
  reorderStage(id: number, newPosition: number): Promise<void>

  // Deals
  findDeals(): Promise<CrmDeal[]>
  findDealById(id: number): Promise<CrmDeal | null>
  findDealsByStageId(stageId: number): Promise<CrmDeal[]>
  findDealsByContactId(contactId: number): Promise<CrmDeal[]>
  createDeal(data: CreateCrmDealInput): Promise<CrmDeal>
  updateDeal(id: number, data: { stageId?: number; budgetAmount?: number; notes?: string }): Promise<CrmDeal | null>
  deleteDeal(id: number): Promise<boolean>

  // Interactions
  findInteractions(dealId: number): Promise<CrmInteraction[]>
  createInteraction(data: CreateCrmInteractionInput): Promise<CrmInteraction>
  deleteInteraction(id: number): Promise<boolean>

  // Comments
  findDealComments(dealId: number): Promise<CrmDealComment[]>
  createDealComment(dealId: number, author: string, content: string): Promise<CrmDealComment>
  deleteDealComment(id: number): Promise<boolean>

  // Attachments
  findDealAttachments(dealId: number): Promise<CrmDealAttachment[]>
  createDealAttachment(dealId: number, data: { name: string; pathname: string; size: number; contentType: string }): Promise<CrmDealAttachment>
  deleteDealAttachment(id: number): Promise<boolean>
}
