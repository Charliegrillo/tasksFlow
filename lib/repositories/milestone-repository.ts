import type { Milestone } from '@/lib/domain/entities/milestone'
import type { CreateMilestoneInput, UpdateMilestoneInput } from '@/lib/types'

export interface IMilestoneRepository {
  findById(id: number): Promise<Milestone | null>
  findByClientId(clientId: number, includeArchived?: boolean): Promise<Milestone[]>
  create(data: CreateMilestoneInput): Promise<Milestone>
  update(id: number, data: UpdateMilestoneInput): Promise<Milestone | null>
  delete(id: number): Promise<boolean>
  archive(id: number): Promise<Milestone | null>
  unarchive(id: number): Promise<Milestone | null>
  listArchived(): Promise<Milestone[]>
  count(): Promise<number>
}
