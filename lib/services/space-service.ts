import type { ISpaceRepository } from '@/lib/repositories/space-repository'
import type { CreateSpaceInput, UpdateSpaceInput } from '@/lib/types'
import type { Space } from '@/lib/domain/entities/space'
import type { SpaceSecret } from '@/lib/domain/entities/space-secret'

export class SpaceService {
  constructor(private spaceRepo: ISpaceRepository) {}

  async findById(id: number): Promise<Space | null> {
    return this.spaceRepo.findById(id)
  }

  async findByClientId(clientId: number): Promise<Space[]> {
    return this.spaceRepo.findByClientId(clientId)
  }

  async create(data: CreateSpaceInput): Promise<Space> {
    if (!data.name?.trim()) throw new Error('Space name is required')
    return this.spaceRepo.create(data)
  }

  async update(id: number, data: UpdateSpaceInput): Promise<Space | null> {
    return this.spaceRepo.update(id, data)
  }

  async delete(id: number): Promise<boolean> {
    return this.spaceRepo.delete(id)
  }

  async validatePassword(spaceId: number, password: string): Promise<boolean> {
    const space = await this.spaceRepo.findById(spaceId)
    if (!space) return false
    if (!space.hasPassword) return true
    return space.secretPassword === password
  }

  async getSecrets(spaceId: number): Promise<SpaceSecret[]> {
    return this.spaceRepo.findSecrets(spaceId)
  }

  async createSecret(spaceId: number, data: { name: string; value: string; type: string; notes: string }): Promise<SpaceSecret> {
    return this.spaceRepo.createSecret(spaceId, data)
  }

  async updateSecret(id: number, data: { name?: string; value?: string; type?: string; notes?: string }): Promise<SpaceSecret | null> {
    return this.spaceRepo.updateSecret(id, data)
  }

  async deleteSecret(id: number): Promise<boolean> {
    return this.spaceRepo.deleteSecret(id)
  }

  async count(): Promise<number> {
    return this.spaceRepo.count()
  }
}
