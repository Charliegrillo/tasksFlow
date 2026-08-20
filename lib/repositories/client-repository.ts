import type { Client } from '@/lib/domain/entities/client'
import type { CreateClientInput, UpdateClientInput } from '@/lib/types'

export interface IClientRepository {
  findById(id: number): Promise<Client | null>
  findByName(name: string): Promise<Client | null>
  findAll(includeArchived?: boolean): Promise<Client[]>
  findArchived(): Promise<Client[]>
  create(data: CreateClientInput): Promise<Client>
  update(id: number, data: UpdateClientInput): Promise<Client | null>
  delete(id: number): Promise<boolean>
  archive(id: number): Promise<Client | null>
  unarchive(id: number): Promise<Client | null>
  count(): Promise<number>
}
