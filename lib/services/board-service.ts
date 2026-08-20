import type { IBoardRepository } from '@/lib/repositories/board-repository'
import type { ISpaceRepository } from '@/lib/repositories/space-repository'
import type { CreateBoardInput, UpdateBoardInput, BoardPaymentStatus } from '@/lib/types'
import type { Board } from '@/lib/domain/entities/board'
import type { BoardList } from '@/lib/domain/entities/board-extras'

export class BoardService {
  constructor(
    private boardRepo: IBoardRepository,
    private spaceRepo: ISpaceRepository
  ) {}

  async findById(id: number): Promise<Board | null> {
    return this.boardRepo.findById(id)
  }

  async findBySpaceId(spaceId: number, includeArchived = false): Promise<Board[]> {
    return this.boardRepo.findBySpaceId(spaceId, includeArchived)
  }

  async create(data: CreateBoardInput): Promise<Board> {
    if (!data.name?.trim()) throw new Error('Board name is required')
    const space = await this.spaceRepo.findById(data.spaceId)
    if (!space) throw new Error('Space not found')
    return this.boardRepo.create(data)
  }

  async update(id: number, data: UpdateBoardInput): Promise<Board | null> {
    return this.boardRepo.update(id, data)
  }

  async delete(id: number): Promise<boolean> {
    return this.boardRepo.delete(id)
  }

  async archive(id: number): Promise<Board | null> {
    return this.boardRepo.archive(id)
  }

  async unarchive(id: number): Promise<Board | null> {
    return this.boardRepo.unarchive(id)
  }

  async listArchived(): Promise<Board[]> {
    return this.boardRepo.listArchived()
  }

  async getLists(boardId: number): Promise<BoardList[]> {
    return this.boardRepo.findLists(boardId)
  }

  async findListById(id: number): Promise<BoardList | null> {
    return this.boardRepo.findListById(id)
  }

  async createList(boardId: number, name: string, color: string): Promise<BoardList> {
    return this.boardRepo.createList(boardId, name, color)
  }

  async updateList(id: number, data: { name?: string; color?: string }): Promise<BoardList | null> {
    return this.boardRepo.updateList(id, data)
  }

  async deleteList(id: number): Promise<boolean> {
    return this.boardRepo.deleteList(id)
  }

  async reorderList(id: number, newPosition: number): Promise<void> {
    await this.boardRepo.reorderList(id, newPosition)
  }

  async updatePaymentStatus(id: number, status: BoardPaymentStatus): Promise<Board | null> {
    return this.boardRepo.update(id, { paymentStatus: status })
  }
}
