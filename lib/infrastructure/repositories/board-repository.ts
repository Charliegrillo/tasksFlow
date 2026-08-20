import { db } from '@/lib/infrastructure/database/connection'
import { mapBoard, mapBoardList } from '@/lib/infrastructure/database/mappers'
import type { IBoardRepository } from '@/lib/repositories/board-repository'
import type { Board } from '@/lib/domain/entities/board'
import type { BoardList } from '@/lib/domain/entities/board-extras'
import type { CreateBoardInput, UpdateBoardInput, BoardPaymentStatus } from '@/lib/types'

export class BoardRepository implements IBoardRepository {
  async findById(id: number): Promise<Board | null> {
    const row = await db.prepare('SELECT * FROM boards WHERE id=?').get(id)
    return row ? mapBoard(row) : null
  }

  async findBySpaceId(spaceId: number, includeArchived = false): Promise<Board[]> {
    const query = includeArchived
      ? 'SELECT * FROM boards WHERE space_id=? ORDER BY id ASC'
      : 'SELECT * FROM boards WHERE space_id=? AND archived=0 ORDER BY id ASC'
    return (await db.prepare(query).all(spaceId)).map(mapBoard)
  }

  async create(data: CreateBoardInput): Promise<Board> {
    const result = await db.prepare('INSERT INTO boards (name, type, space_id, payment_status) VALUES (?, ?, ?, ?)')
      .run(data.name.trim(), data.type ?? 'roadmap', data.spaceId, data.paymentStatus ?? 'pendiente')
    return mapBoard(await db.prepare('SELECT * FROM boards WHERE id=?').get(result.lastInsertRowid)!)
  }

  async update(id: number, data: UpdateBoardInput): Promise<Board | null> {
    const current = await db.prepare('SELECT * FROM boards WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE boards SET name=?, type=?, payment_status=? WHERE id=?')
      .run(data.name?.trim() || current.name, data.type || current.type, data.paymentStatus ?? current.payment_status, id)
    return mapBoard(await db.prepare('SELECT * FROM boards WHERE id=?').get(id)!)
  }

  async delete(id: number): Promise<boolean> {
    const board = await db.prepare('SELECT * FROM boards WHERE id=?').get(id) as { space_id: number } | undefined
    if (!board) return false
    const count = await db.prepare('SELECT COUNT(*) as count FROM boards WHERE space_id=?').get(board.space_id) as { count: number }
    if (count.count <= 1) return false
    const lists = await db.prepare('SELECT * FROM board_lists WHERE board_id=?').all(id) as { id: number; name: string }[]
    for (const list of lists) {
      const legacyStatus = ({ Backlog: 'backlog', 'En progreso': 'progress', 'En revisión': 'review', Completado: 'done' } as Record<string, string>)[list.name] ?? `list-${list.id}`
      await db.prepare('DELETE FROM tasks WHERE board_id=? AND status=?').run(id, legacyStatus)
    }
    await db.prepare('DELETE FROM board_lists WHERE board_id=?').run(id)
    await db.prepare('DELETE FROM boards WHERE id=?').run(id)
    return true
  }

  async archive(id: number): Promise<Board | null> {
    const current = await db.prepare('SELECT * FROM boards WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE boards SET archived=1 WHERE id=?').run(id)
    return mapBoard(await db.prepare('SELECT * FROM boards WHERE id=?').get(id)!)
  }

  async unarchive(id: number): Promise<Board | null> {
    const current = await db.prepare('SELECT * FROM boards WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE boards SET archived=0 WHERE id=?').run(id)
    return mapBoard(await db.prepare('SELECT * FROM boards WHERE id=?').get(id)!)
  }

  async listArchived(): Promise<Board[]> {
    return (await db.prepare('SELECT * FROM boards WHERE archived=1 ORDER BY id ASC').all()).map(mapBoard)
  }

  async reorder(boardId: number, newPosition: number): Promise<void> {
    // Board reorder not implemented in original - placeholder
  }

  async findLists(boardId: number): Promise<BoardList[]> {
    return (await db.prepare('SELECT * FROM board_lists WHERE board_id=? ORDER BY position, id').all(boardId)).map(mapBoardList)
  }

  async createList(boardId: number, name: string, color: string): Promise<BoardList> {
    const position = (await db.prepare('SELECT COALESCE(MAX(position), -1) + 1 as position FROM board_lists WHERE board_id=?').get(boardId) as { position: number }).position
    const result = await db.prepare('INSERT INTO board_lists (board_id, name, color, position) VALUES (?, ?, ?, ?)').run(boardId, name.trim(), color, position)
    return mapBoardList(await db.prepare('SELECT * FROM board_lists WHERE id=?').get(result.lastInsertRowid)!)
  }

  async updateList(id: number, data: { name?: string; color?: string }): Promise<BoardList | null> {
    const current = await db.prepare('SELECT * FROM board_lists WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE board_lists SET name=?, color=? WHERE id=?')
      .run(data.name?.trim() || current.name, data.color || current.color, id)
    return mapBoardList(await db.prepare('SELECT * FROM board_lists WHERE id=?').get(id)!)
  }

  async deleteList(id: number): Promise<boolean> {
    const list = await db.prepare('SELECT * FROM board_lists WHERE id=?').get(id) as { board_id: number; name: string } | undefined
    if (!list) return false
    const count = await db.prepare('SELECT COUNT(*) as count FROM board_lists WHERE board_id=?').get(list.board_id) as { count: number }
    if (count.count <= 1) return false
    await db.prepare('DELETE FROM board_lists WHERE id=?').run(id)
    const legacyStatus = ({ Backlog: 'backlog', 'En progreso': 'progress', 'En revisión': 'review', Completado: 'done' } as Record<string, string>)[list.name] ?? `list-${id}`
    await db.prepare('DELETE FROM tasks WHERE board_id=? AND status=?').run(list.board_id, legacyStatus)
    return true
  }

  async reorderList(id: number, newPosition: number): Promise<void> {
    const current = await db.prepare('SELECT * FROM board_lists WHERE id=?').get(id) as { board_id: number } | undefined
    if (!current) return
    const rows = await db.prepare('SELECT * FROM board_lists WHERE board_id=? ORDER BY position, id').all(current.board_id)
    const ordered = rows.map(mapBoardList)
    const currentIndex = ordered.findIndex(list => list.id === id)
    if (currentIndex === -1) return
    const maxIndex = Math.max(0, ordered.length - 1)
    const targetIndex = Math.min(Math.max(0, newPosition), maxIndex)
    const [moved] = ordered.splice(currentIndex, 1)
    ordered.splice(targetIndex, 0, moved)
    for (const [index, list] of ordered.entries()) {
      await db.prepare('UPDATE board_lists SET position=? WHERE id=?').run(index, list.id)
    }
  }

  async count(): Promise<number> {
    const result = await db.prepare('SELECT COUNT(*) as count FROM boards').get() as { count: number }
    return result.count
  }
}
