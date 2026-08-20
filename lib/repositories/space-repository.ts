import type { Space } from '@/lib/domain/entities/space'
import type { SpaceSecret } from '@/lib/domain/entities/space-secret'
import type { CreateSpaceInput, UpdateSpaceInput } from '@/lib/types'

export interface ISpaceRepository {
  findById(id: number): Promise<Space | null>
  findByClientId(clientId: number): Promise<Space[]>
  create(data: CreateSpaceInput): Promise<Space>
  update(id: number, data: UpdateSpaceInput): Promise<Space | null>
  delete(id: number): Promise<boolean>
  count(): Promise<number>

  // Secrets
  findSecrets(spaceId: number): Promise<SpaceSecret[]>
  createSecret(spaceId: number, data: { name: string; value: string; type: string; notes: string }): Promise<SpaceSecret>
  updateSecret(id: number, data: { name?: string; value?: string; type?: string; notes?: string }): Promise<SpaceSecret | null>
  deleteSecret(id: number): Promise<boolean>
}
