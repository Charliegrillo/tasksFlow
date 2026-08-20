import { db } from '@/lib/infrastructure/database/connection'
import { mapSpace, mapSpaceSecret } from '@/lib/infrastructure/database/mappers'
import type { ISpaceRepository } from '@/lib/repositories/space-repository'
import type { Space } from '@/lib/domain/entities/space'
import type { SpaceSecret } from '@/lib/domain/entities/space-secret'
import type { CreateSpaceInput, UpdateSpaceInput } from '@/lib/types'

export class SpaceRepository implements ISpaceRepository {
  async findById(id: number): Promise<Space | null> {
    const row = await db.prepare('SELECT * FROM spaces WHERE id=?').get(id)
    return row ? mapSpace(row) : null
  }

  async findByClientId(clientId: number): Promise<Space[]> {
    return (await db.prepare('SELECT * FROM spaces WHERE client_id=? ORDER BY id ASC').all(clientId)).map(mapSpace)
  }

  async findAll(): Promise<Space[]> {
    return (await db.prepare('SELECT * FROM spaces ORDER BY id ASC').all()).map(mapSpace)
  }

  async create(data: CreateSpaceInput): Promise<Space> {
    const result = await db.prepare('INSERT INTO spaces (name, color, client_id) VALUES (?, ?, ?)')
      .run(data.name.trim(), data.color ?? 'bg-violet-500', data.clientId)
    return mapSpace(await db.prepare('SELECT * FROM spaces WHERE id=?').get(result.lastInsertRowid)!)
  }

  async update(id: number, data: UpdateSpaceInput): Promise<Space | null> {
    const current = await db.prepare('SELECT * FROM spaces WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE spaces SET name=?, color=? WHERE id=?')
      .run(data.name?.trim() || current.name, data.color || current.color, id)
    return mapSpace(await db.prepare('SELECT * FROM spaces WHERE id=?').get(id)!)
  }

  async delete(id: number): Promise<boolean> {
    const count = await db.prepare('SELECT COUNT(*) as count FROM spaces').get() as { count: number }
    if (count.count <= 1) return false
    const deleted = (await db.prepare('DELETE FROM spaces WHERE id=?').run(id)).changes > 0
    if (deleted) {
      const boards = await db.prepare('SELECT id FROM boards WHERE space_id=?').all(id) as { id: number }[]
      for (const board of boards) {
        await db.prepare('DELETE FROM tasks WHERE board_id=?').run(board.id)
        await db.prepare('DELETE FROM board_lists WHERE board_id=?').run(board.id)
      }
      await db.prepare('DELETE FROM boards WHERE space_id=?').run(id)
      await db.prepare('DELETE FROM space_secrets WHERE space_id=?').run(id)
    }
    return deleted
  }

  async count(): Promise<number> {
    const result = await db.prepare('SELECT COUNT(*) as count FROM spaces').get() as { count: number }
    return result.count
  }

  async findSecrets(spaceId: number): Promise<SpaceSecret[]> {
    return (await db.prepare('SELECT * FROM space_secrets WHERE space_id=? ORDER BY id ASC').all(spaceId)).map(mapSpaceSecret)
  }

  async createSecret(spaceId: number, data: { name: string; value: string; type: string; notes: string }): Promise<SpaceSecret> {
    const result = await db.prepare('INSERT INTO space_secrets (space_id, name, value, type, notes) VALUES (?, ?, ?, ?, ?)')
      .run(spaceId, data.name.trim(), data.value, data.type ?? 'other', data.notes?.trim() ?? '')
    return mapSpaceSecret(await db.prepare('SELECT * FROM space_secrets WHERE id=?').get(result.lastInsertRowid)!)
  }

  async updateSecret(id: number, data: { name?: string; value?: string; type?: string; notes?: string }): Promise<SpaceSecret | null> {
    const current = await db.prepare('SELECT * FROM space_secrets WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE space_secrets SET name=?, value=?, type=?, notes=? WHERE id=?')
      .run(data.name?.trim() || current.name, data.value ?? current.value, data.type ?? current.type, data.notes?.trim() ?? current.notes ?? '', id)
    return mapSpaceSecret(await db.prepare('SELECT * FROM space_secrets WHERE id=?').get(id)!)
  }

  async deleteSecret(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM space_secrets WHERE id=?').run(id)).changes > 0
  }
}
