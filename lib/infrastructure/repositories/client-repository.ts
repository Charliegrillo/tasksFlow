import { db } from '@/lib/infrastructure/database/connection'
import { mapClient } from '@/lib/infrastructure/database/mappers'
import type { IClientRepository } from '@/lib/repositories/client-repository'
import type { Client } from '@/lib/domain/entities/client'
import type { CreateClientInput, UpdateClientInput } from '@/lib/types'

export class ClientRepository implements IClientRepository {
  async findById(id: number): Promise<Client | null> {
    const row = await db.prepare('SELECT * FROM clients WHERE id=?').get(id)
    return row ? mapClient(row) : null
  }

  async findByName(name: string): Promise<Client | null> {
    const row = await db.prepare('SELECT * FROM clients WHERE name=?').get(name)
    return row ? mapClient(row) : null
  }

  async findAll(includeArchived = false): Promise<Client[]> {
    const query = includeArchived
      ? 'SELECT * FROM clients ORDER BY id ASC'
      : 'SELECT * FROM clients WHERE archived=0 ORDER BY id ASC'
    return (await db.prepare(query).all()).map(mapClient)
  }

  async findArchived(): Promise<Client[]> {
    return (await db.prepare('SELECT * FROM clients WHERE archived=1 ORDER BY id ASC').all()).map(mapClient)
  }

  async create(data: CreateClientInput): Promise<Client> {
    const result = await db.prepare('INSERT INTO clients (name, email, company) VALUES (?, ?, ?)')
      .run(data.name.trim(), data.email?.trim() ?? '', data.company?.trim() ?? '')
    return mapClient(await db.prepare('SELECT * FROM clients WHERE id=?').get(result.lastInsertRowid)!)
  }

  async update(id: number, data: UpdateClientInput): Promise<Client | null> {
    const current = await db.prepare('SELECT * FROM clients WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE clients SET name=?, email=?, company=? WHERE id=?')
      .run(data.name?.trim() || current.name, data.email?.trim() ?? current.email, data.company?.trim() ?? current.company, id)
    return mapClient(await db.prepare('SELECT * FROM clients WHERE id=?').get(id)!)
  }

  async delete(id: number): Promise<boolean> {
    const count = await db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number }
    if (count.count <= 1) return false
    const deleted = (await db.prepare('DELETE FROM clients WHERE id=?').run(id)).changes > 0
    if (deleted) {
      const spaces = await db.prepare('SELECT id FROM spaces WHERE client_id=?').all(id) as { id: number }[]
      for (const space of spaces) {
        const boards = await db.prepare('SELECT id FROM boards WHERE space_id=?').all(space.id) as { id: number }[]
        for (const board of boards) {
          await db.prepare('DELETE FROM tasks WHERE board_id=?').run(board.id)
          await db.prepare('DELETE FROM board_lists WHERE board_id=?').run(board.id)
        }
        await db.prepare('DELETE FROM boards WHERE space_id=?').run(space.id)
      }
      await db.prepare('DELETE FROM spaces WHERE client_id=?').run(id)
    }
    return deleted
  }

  async archive(id: number): Promise<Client | null> {
    const current = await db.prepare('SELECT * FROM clients WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE clients SET archived=1 WHERE id=?').run(id)
    return mapClient(await db.prepare('SELECT * FROM clients WHERE id=?').get(id)!)
  }

  async unarchive(id: number): Promise<Client | null> {
    const current = await db.prepare('SELECT * FROM clients WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE clients SET archived=0 WHERE id=?').run(id)
    return mapClient(await db.prepare('SELECT * FROM clients WHERE id=?').get(id)!)
  }

  async count(): Promise<number> {
    const result = await db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number }
    return result.count
  }
}
