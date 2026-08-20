import { db } from '@/lib/infrastructure/database/connection'
import { mapCrmStage, mapCrmDeal, mapCrmInteraction, mapCrmDealComment, mapCrmDealAttachment } from '@/lib/infrastructure/database/mappers'
import type { ICrmRepository } from '@/lib/repositories/crm-repository'
import type { CrmStage, CrmDeal, CrmInteraction, CrmDealComment, CrmDealAttachment } from '@/lib/domain/entities/crm'
import type { CreateCrmStageInput, CreateCrmDealInput, CreateCrmInteractionInput } from '@/lib/types'

export class CrmRepository implements ICrmRepository {
  async findStages(): Promise<CrmStage[]> {
    return (await db.prepare('SELECT * FROM crm_stages ORDER BY position ASC, id ASC').all()).map(mapCrmStage)
  }

  async findStageById(id: number): Promise<CrmStage | null> {
    const row = await db.prepare('SELECT * FROM crm_stages WHERE id=?').get(id)
    return row ? mapCrmStage(row) : null
  }

  async createStage(data: CreateCrmStageInput): Promise<CrmStage> {
    const maxPos = (await db.prepare('SELECT COALESCE(MAX(position), -1) + 1 as pos FROM crm_stages').get() as { pos: number }).pos
    const result = await db.prepare('INSERT INTO crm_stages (name, color, position) VALUES (?, ?, ?)')
      .run(data.name.trim(), data.color ?? 'bg-violet-500', data.position ?? maxPos)
    return mapCrmStage(await db.prepare('SELECT * FROM crm_stages WHERE id=?').get(result.lastInsertRowid)!)
  }

  async updateStage(id: number, data: { name?: string; color?: string }): Promise<CrmStage | null> {
    const current = await db.prepare('SELECT * FROM crm_stages WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE crm_stages SET name=?, color=? WHERE id=?')
      .run(data.name?.trim() || current.name, data.color || current.color, id)
    return mapCrmStage(await db.prepare('SELECT * FROM crm_stages WHERE id=?').get(id)!)
  }

  async deleteStage(id: number): Promise<boolean> {
    const stageCount = await db.prepare('SELECT COUNT(*) as count FROM crm_stages').get() as { count: number }
    if (stageCount.count <= 1) return false
    await db.prepare('DELETE FROM crm_interactions WHERE deal_id IN (SELECT id FROM crm_deals WHERE stage_id=?)').run(id)
    await db.prepare('DELETE FROM crm_deals WHERE stage_id=?').run(id)
    return (await db.prepare('DELETE FROM crm_stages WHERE id=?').run(id)).changes > 0
  }

  async reorderStage(id: number, newPosition: number): Promise<void> {
    const rows = await db.prepare('SELECT * FROM crm_stages ORDER BY position, id').all()
    const ordered = rows.map(mapCrmStage)
    const currentIndex = ordered.findIndex(s => s.id === id)
    if (currentIndex === -1) return
    const maxIndex = Math.max(0, ordered.length - 1)
    const targetIndex = Math.min(Math.max(0, newPosition), maxIndex)
    const [moved] = ordered.splice(currentIndex, 1)
    ordered.splice(targetIndex, 0, moved)
    for (const [index, stage] of ordered.entries()) {
      await db.prepare('UPDATE crm_stages SET position=? WHERE id=?').run(index, stage.id)
    }
  }

  async findDeals(): Promise<CrmDeal[]> {
    return (await db.prepare('SELECT * FROM crm_deals ORDER BY id ASC').all()).map(mapCrmDeal)
  }

  async findDealById(id: number): Promise<CrmDeal | null> {
    const row = await db.prepare('SELECT * FROM crm_deals WHERE id=?').get(id)
    return row ? mapCrmDeal(row) : null
  }

  async findDealsByStageId(stageId: number): Promise<CrmDeal[]> {
    return (await db.prepare('SELECT * FROM crm_deals WHERE stage_id=? ORDER BY id ASC').all(stageId)).map(mapCrmDeal)
  }

  async findDealsByContactId(contactId: number): Promise<CrmDeal[]> {
    return (await db.prepare('SELECT * FROM crm_deals WHERE contact_id=? ORDER BY id ASC').all(contactId)).map(mapCrmDeal)
  }

  async createDeal(data: CreateCrmDealInput): Promise<CrmDeal> {
    const result = await db.prepare('INSERT INTO crm_deals (contact_id, stage_id, budget_amount, notes) VALUES (?, ?, ?, ?)')
      .run(data.contactId, data.stageId, data.budgetAmount ?? 0, data.notes ?? '')
    return mapCrmDeal(await db.prepare('SELECT * FROM crm_deals WHERE id=?').get(result.lastInsertRowid)!)
  }

  async updateDeal(id: number, data: { stageId?: number; budgetAmount?: number; notes?: string }): Promise<CrmDeal | null> {
    const current = await db.prepare('SELECT * FROM crm_deals WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE crm_deals SET stage_id=?, budget_amount=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?')
      .run(data.stageId ?? current.stage_id, data.budgetAmount ?? current.budget_amount, data.notes ?? current.notes ?? '', id)
    return mapCrmDeal(await db.prepare('SELECT * FROM crm_deals WHERE id=?').get(id)!)
  }

  async deleteDeal(id: number): Promise<boolean> {
    await db.prepare('DELETE FROM crm_interactions WHERE deal_id=?').run(id)
    await db.prepare('DELETE FROM crm_deal_comments WHERE deal_id=?').run(id)
    await db.prepare('DELETE FROM crm_deal_attachments WHERE deal_id=?').run(id)
    return (await db.prepare('DELETE FROM crm_deals WHERE id=?').run(id)).changes > 0
  }

  async findInteractions(dealId: number): Promise<CrmInteraction[]> {
    return (await db.prepare('SELECT * FROM crm_interactions WHERE deal_id=? ORDER BY id DESC').all(dealId)).map(mapCrmInteraction)
  }

  async createInteraction(data: CreateCrmInteractionInput): Promise<CrmInteraction> {
    const result = await db.prepare('INSERT INTO crm_interactions (deal_id, type, description, date) VALUES (?, ?, ?, ?)')
      .run(data.dealId, data.type, data.description?.trim() ?? '', data.date)
    await db.prepare('UPDATE crm_deals SET updated_at=CURRENT_TIMESTAMP WHERE id=?').run(data.dealId)
    return mapCrmInteraction(await db.prepare('SELECT * FROM crm_interactions WHERE id=?').get(result.lastInsertRowid)!)
  }

  async deleteInteraction(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM crm_interactions WHERE id=?').run(id)).changes > 0
  }

  async findDealComments(dealId: number): Promise<CrmDealComment[]> {
    return (await db.prepare('SELECT * FROM crm_deal_comments WHERE deal_id=? ORDER BY id ASC').all(dealId)).map(mapCrmDealComment)
  }

  async createDealComment(dealId: number, author: string, content: string): Promise<CrmDealComment> {
    const result = await db.prepare('INSERT INTO crm_deal_comments (deal_id, author, content) VALUES (?, ?, ?)')
      .run(dealId, author.trim() || 'Usuario', content.trim())
    await db.prepare('UPDATE crm_deals SET updated_at=CURRENT_TIMESTAMP WHERE id=?').run(dealId)
    return mapCrmDealComment(await db.prepare('SELECT * FROM crm_deal_comments WHERE id=?').get(result.lastInsertRowid)!)
  }

  async deleteDealComment(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM crm_deal_comments WHERE id=?').run(id)).changes > 0
  }

  async findDealAttachments(dealId: number): Promise<CrmDealAttachment[]> {
    return (await db.prepare('SELECT * FROM crm_deal_attachments WHERE deal_id=? ORDER BY id DESC').all(dealId)).map(mapCrmDealAttachment)
  }

  async createDealAttachment(dealId: number, data: { name: string; pathname: string; size: number; contentType: string }): Promise<CrmDealAttachment> {
    const result = await db.prepare('INSERT INTO crm_deal_attachments (deal_id, name, pathname, size, content_type) VALUES (?, ?, ?, ?, ?)')
      .run(dealId, data.name, data.pathname, data.size, data.contentType)
    await db.prepare('UPDATE crm_deals SET updated_at=CURRENT_TIMESTAMP WHERE id=?').run(dealId)
    return mapCrmDealAttachment(await db.prepare('SELECT * FROM crm_deal_attachments WHERE id=?').get(result.lastInsertRowid)!)
  }

  async deleteDealAttachment(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM crm_deal_attachments WHERE id=?').run(id)).changes > 0
  }
}
