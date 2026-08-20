import { db } from '@/lib/infrastructure/database/connection'
import { mapContact } from '@/lib/infrastructure/database/mappers'
import type { IContactRepository } from '@/lib/repositories/contact-repository'
import type { Contact } from '@/lib/domain/entities/contact'
import type { CreateContactInput, UpdateContactInput } from '@/lib/types'

export class ContactRepository implements IContactRepository {
  async findById(id: number): Promise<Contact | null> {
    const row = await db.prepare('SELECT * FROM contacts WHERE id=?').get(id)
    return row ? mapContact(row) : null
  }

  async findAll(): Promise<Contact[]> {
    return (await db.prepare('SELECT * FROM contacts ORDER BY id ASC').all()).map(mapContact)
  }

  async search(query: string): Promise<Contact[]> {
    const q = `%${query}%`
    return (await db.prepare('SELECT * FROM contacts WHERE name LIKE ? OR email LIKE ? OR company LIKE ? ORDER BY id ASC').all(q, q, q)).map(mapContact)
  }

  async create(data: CreateContactInput): Promise<Contact> {
    const result = await db.prepare('INSERT INTO contacts (name, email, phone, company, position, address, website, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .run(data.name?.trim() ?? '', data.email?.trim() ?? '', data.phone?.trim() ?? '', data.company?.trim() ?? '', data.position?.trim() ?? '', data.address?.trim() ?? '', data.website?.trim() ?? '', data.notes?.trim() ?? '')
    return mapContact(await db.prepare('SELECT * FROM contacts WHERE id=?').get(result.lastInsertRowid)!)
  }

  async update(id: number, data: UpdateContactInput): Promise<Contact | null> {
    const current = await db.prepare('SELECT * FROM contacts WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE contacts SET name=?, email=?, phone=?, company=?, position=?, address=?, website=?, notes=? WHERE id=?')
      .run(
        data.name?.trim() || current.name, data.email?.trim() ?? current.email,
        data.phone?.trim() ?? current.phone, data.company?.trim() ?? current.company,
        data.position?.trim() ?? current.position, data.address?.trim() ?? current.address,
        data.website?.trim() ?? current.website, data.notes?.trim() ?? current.notes, id
      )
    return mapContact(await db.prepare('SELECT * FROM contacts WHERE id=?').get(id)!)
  }

  async delete(id: number): Promise<boolean> {
    await db.prepare('DELETE FROM crm_interactions WHERE deal_id IN (SELECT id FROM crm_deals WHERE contact_id=?)').run(id)
    await db.prepare('DELETE FROM crm_deals WHERE contact_id=?').run(id)
    return (await db.prepare('DELETE FROM contacts WHERE id=?').run(id)).changes > 0
  }

  async count(): Promise<number> {
    const result = await db.prepare('SELECT COUNT(*) as count FROM contacts').get() as { count: number }
    return result.count
  }
}
