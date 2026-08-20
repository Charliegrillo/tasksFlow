import type { Comment } from '@/lib/domain/entities/comment'
import type { CreateCommentInput } from '@/lib/types'

export interface ICommentRepository {
  findById(id: number): Promise<Comment | null>
  findByTaskId(taskId: number): Promise<Comment[]>
  create(data: CreateCommentInput): Promise<Comment>
  update(id: number, content: string): Promise<Comment | null>
  delete(id: number): Promise<boolean>
}
