import type { IClientRepository } from '@/lib/repositories/client-repository'
import type { ISpaceRepository } from '@/lib/repositories/space-repository'
import type { CreateClientInput, UpdateClientInput } from '@/lib/types'
import type { Client } from '@/lib/domain/entities/client'
import type { Space } from '@/lib/domain/entities/space'

export class ClientService {
  constructor(
    private clientRepo: IClientRepository,
    private spaceRepo: ISpaceRepository
  ) {}

  async findById(id: number): Promise<Client | null> {
    return this.clientRepo.findById(id)
  }

  async findAll(includeArchived = false): Promise<Client[]> {
    return this.clientRepo.findAll(includeArchived)
  }

  async findArchived(): Promise<Client[]> {
    return this.clientRepo.findArchived()
  }

  async create(data: CreateClientInput): Promise<Client> {
    if (!data.name?.trim()) throw new Error('Client name is required')
    const existing = await this.clientRepo.findByName(data.name.trim())
    if (existing) throw new Error('Ya existe un cliente con ese nombre')
    return this.clientRepo.create(data)
  }

  async update(id: number, data: UpdateClientInput): Promise<Client | null> {
    return this.clientRepo.update(id, data)
  }

  async delete(id: number): Promise<boolean> {
    return this.clientRepo.delete(id)
  }

  async archive(id: number): Promise<Client | null> {
    return this.clientRepo.archive(id)
  }

  async unarchive(id: number): Promise<Client | null> {
    return this.clientRepo.unarchive(id)
  }

  async getSpaces(clientId: number): Promise<Space[]> {
    return this.spaceRepo.findByClientId(clientId)
  }

  async count(): Promise<number> {
    return this.clientRepo.count()
  }
}
