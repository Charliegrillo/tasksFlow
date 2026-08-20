import type { Board } from '@/lib/domain/entities/board'
import type { BoardList } from '@/lib/domain/entities/board-extras'
import type { CreateBoardInput, UpdateBoardInput, BoardPaymentStatus } from '@/lib/types'

export interface IBoardRepository {
  findById(id: number): Promise<Board | null>
  findBySpaceId(spaceId: number, includeArchived?: boolean): Promise<Board[]>
  create(data: CreateBoardInput): Promise<Board>
  update(id: number, data: UpdateBoardInput): Promise<Board | null>
  delete(id: number): Promise<boolean>
  archive(id: number): Promise<Board | null>
  unarchive(id: number): Promise<Board | null>
  listArchived(): Promise<Board[]>
  reorder(boardId: number, newPosition: number): Promise<void>

  // Board Lists
  findLists(boardId: number): Promise<BoardList[]>
  createList(boardId: number, name: string, color: string): Promise<BoardList>
  updateList(id: number, data: { name?: string; color?: string }): Promise<BoardList | null>
  deleteList(id: number): Promise<boolean>
  reorderList(id: number, newPosition: number): Promise<void>
  count(): Promise<number>
}
