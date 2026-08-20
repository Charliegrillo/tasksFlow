import { db } from '@/lib/infrastructure/database/connection'
import { mapUser } from '@/lib/infrastructure/database/mappers'
import type { IUserRepository } from '@/lib/repositories/user-repository'
import { User, PasswordResetToken } from '@/lib/domain/entities/user'

export class UserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    const row = await db.prepare('SELECT * FROM users WHERE id=?').get(id)
    return row ? mapUser(row) : null
  }

  async findByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
    const row = await db.prepare('SELECT * FROM users WHERE email=?').get(email.trim().toLowerCase()) as Record<string, unknown> | undefined
    if (!row) return null
    const user = mapUser(row)
    return Object.assign(user, { passwordHash: row.password_hash as string }) as User & { passwordHash: string }
  }

  async create(data: { name: string; email: string; passwordHash: string }): Promise<User> {
    const result = await db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
      .run(data.name.trim(), data.email.trim().toLowerCase(), data.passwordHash)
    return mapUser(await db.prepare('SELECT * FROM users WHERE id=?').get(result.lastInsertRowid)!)
  }

  async update(id: number, data: { name?: string; email?: string }): Promise<User | null> {
    const current = await db.prepare('SELECT * FROM users WHERE id=?').get(id)
    if (!current) return null
    await db.prepare('UPDATE users SET name=?, email=? WHERE id=?')
      .run(data.name?.trim() || current.name, data.email?.trim().toLowerCase() || current.email, id)
    return mapUser(await db.prepare('SELECT * FROM users WHERE id=?').get(id)!)
  }

  async delete(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM users WHERE id=?').run(id)).changes > 0
  }

  async updatePassword(id: number, passwordHash: string): Promise<boolean> {
    return (await db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(passwordHash, id)).changes > 0
  }

  async createResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken> {
    await db.prepare('DELETE FROM password_reset_tokens WHERE user_id=?').run(userId)
    const result = await db.prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)')
      .run(userId, token, expiresAt.toISOString())
    return new PasswordResetToken(result.lastInsertRowid as number, userId, token, expiresAt, new Date())
  }

  async findResetToken(token: string): Promise<PasswordResetToken | null> {
    const row = await db.prepare('SELECT * FROM password_reset_tokens WHERE token=?').get(token) as Record<string, unknown> | undefined
    if (!row) return null
    const expiresAt = new Date(row.expires_at as string)
    if (expiresAt < new Date()) {
      await db.prepare('DELETE FROM password_reset_tokens WHERE id=?').run(row.id)
      return null
    }
    return new PasswordResetToken(row.id as number, row.user_id as number, row.token as string, expiresAt, new Date(row.created_at as string))
  }

  async deleteResetToken(id: number): Promise<boolean> {
    return (await db.prepare('DELETE FROM password_reset_tokens WHERE id=?').run(id)).changes > 0
  }

  async deleteExpiredTokens(): Promise<number> {
    return (await db.prepare('DELETE FROM password_reset_tokens WHERE expires_at < CURRENT_TIMESTAMP').run()).changes
  }
}
