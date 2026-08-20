import type { Contact } from '@/lib/domain/entities/contact'
import type { CreateContactInput, UpdateContactInput } from '@/lib/types'

export interface IContactRepository {
  findById(id: number): Promise<Contact | null>
  findAll(): Promise<Contact[]>
  search(query: string): Promise<Contact[]>
  create(data: CreateContactInput): Promise<Contact>
  update(id: number, data: UpdateContactInput): Promise<Contact | null>
  delete(id: number): Promise<boolean>
  count(): Promise<number>
}
