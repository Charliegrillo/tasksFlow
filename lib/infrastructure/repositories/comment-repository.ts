import { db } from '@/lib/infrastructure/database/connection'
import { mapComment } from '@/lib/infrastructure/database/mappers'
import type { ICommentRepository } from '@/lib/repositories/comment-repository'
import type { Comment } from '@/lib/domain/entities/comment'
import type { CreateCommentInput } from '@/lib/types'

export class CommentRepository implements ICommentRepository {
  async findById(id: number): Promise<Comment | null> {
    const row = await db.prepare('SELECT * FROM comments WHERE id=?').get(id)
    return row ? mapComment(row) : null
  }

  async findByTaskId(taskId: number): Promise<Comment[]> {
    return (await db.prepare('SELECT * FROM comments WHERE task_id=? ORDER BY id ASC').all(taskId)).map(mapComment)
  }

  async create(data: CreateCommentInput): Promise<Comment> {
    const result = await db.prepare('INSERT INTO comments (task_id, author, content) VALUES (?, ?, ?)')
      .run(data.taskId, data.author?.trim() || 'Usuario', data.content.trim())
    return mapComment(await db.prepare('SELECT * FROM comments WHERE id=?').get(result.lastInsertRowid)!)
  }

  async update(id: number, content: string): Promise<Comment | null> {
    const current = await db.prepare('SELECT * FROM comments WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE comments SET content=? WHERE id=?').run(content.trim(), id)
    return mapComment(await db.prepare('SELECT * FROM comments WHERE id=?').get(id)!)
  }

  async delete(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM comments WHERE id=?').run(id)).changes > 0
  }
}
