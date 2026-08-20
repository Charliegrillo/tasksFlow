import type { User, PasswordResetToken } from '@/lib/domain/entities/user'

export interface IUserRepository {
  findById(id: number): Promise<User | null>
  findByEmail(email: string): Promise<(User & { passwordHash: string }) | null>
  create(data: { name: string; email: string; passwordHash: string }): Promise<User>
  update(id: number, data: { name?: string; email?: string }): Promise<User | null>
  delete(id: number): Promise<boolean>

  // Password Reset
  createResetToken(userId: number, token: string, expiresAt: Date): Promise<PasswordResetToken>
  findResetToken(token: string): Promise<PasswordResetToken | null>
  deleteResetToken(id: number): Promise<boolean>
  deleteExpiredTokens(): Promise<number>
}
