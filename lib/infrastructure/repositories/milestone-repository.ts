import { db } from '@/lib/infrastructure/database/connection'
import { mapMilestone } from '@/lib/infrastructure/database/mappers'
import type { IMilestoneRepository } from '@/lib/repositories/milestone-repository'
import type { Milestone } from '@/lib/domain/entities/milestone'
import type { CreateMilestoneInput, UpdateMilestoneInput } from '@/lib/types'

export class MilestoneRepository implements IMilestoneRepository {
  async findById(id: number): Promise<Milestone | null> {
    const row = await db.prepare('SELECT * FROM milestones WHERE id=?').get(id)
    return row ? mapMilestone(row) : null
  }

  async findByClientId(clientId: number, includeArchived = false): Promise<Milestone[]> {
    const query = includeArchived
      ? 'SELECT * FROM milestones WHERE client_id=? ORDER BY id ASC'
      : 'SELECT * FROM milestones WHERE client_id=? AND archived=0 ORDER BY id ASC'
    return (await db.prepare(query).all(clientId)).map(mapMilestone)
  }

  async create(data: CreateMilestoneInput): Promise<Milestone> {
    const result = await db.prepare('INSERT INTO milestones (name, color, client_id) VALUES (?, ?, ?)')
      .run(data.name.trim(), data.color ?? 'bg-violet-500', data.clientId)
    return mapMilestone(await db.prepare('SELECT * FROM milestones WHERE id=?').get(result.lastInsertRowid)!)
  }

  async update(id: number, data: UpdateMilestoneInput): Promise<Milestone | null> {
    const current = await db.prepare('SELECT * FROM milestones WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE milestones SET name=?, color=? WHERE id=?')
      .run(data.name?.trim() || current.name, data.color || current.color, id)
    return mapMilestone(await db.prepare('SELECT * FROM milestones WHERE id=?').get(id)!)
  }

  async delete(id: number): Promise<boolean> {
    await db.prepare('UPDATE tasks SET milestone_id=NULL WHERE milestone_id=?').run(id)
    return (await db.prepare('DELETE FROM milestones WHERE id=?').run(id)).changes > 0
  }

  async archive(id: number): Promise<Milestone | null> {
    const current = await db.prepare('SELECT * FROM milestones WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE milestones SET archived=1 WHERE id=?').run(id)
    return mapMilestone(await db.prepare('SELECT * FROM milestones WHERE id=?').get(id)!)
  }

  async unarchive(id: number): Promise<Milestone | null> {
    const current = await db.prepare('SELECT * FROM milestones WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE milestones SET archived=0 WHERE id=?').run(id)
    return mapMilestone(await db.prepare('SELECT * FROM milestones WHERE id=?').get(id)!)
  }

  async listArchived(): Promise<Milestone[]> {
    return (await db.prepare('SELECT * FROM milestones WHERE archived=1 ORDER BY id ASC').all()).map(mapMilestone)
  }

  async count(): Promise<number> {
    const result = await db.prepare('SELECT COUNT(*) as count FROM milestones').get() as { count: number }
    return result.count
  }
}
