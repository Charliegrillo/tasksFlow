import { createClient as createLibsqlClient, type InArgs, type Client as LibsqlClient } from '@libsql/client'
import path from 'node:path'

export type DbRow = Record<string, unknown>
export type DbRunResult = { changes: number; lastInsertRowid: number }

export type Db = {
  exec(sql: string): Promise<void>
  prepare(sql: string): {
    get(...args: unknown[]): Promise<DbRow>
    all(...args: unknown[]): Promise<DbRow[]>
    run(...args: unknown[]): Promise<DbRunResult>
  }
}

const dbMode = process.env.DB_MODE ?? 'local'
const isRemote = dbMode === 'turso' || dbMode === 'remote'
const databaseUrl = isRemote
  ? (process.env.TURSO_DATABASE_URL as string)
  : 'file:' + path.join(process.cwd(), 'kanban.sqlite')

if (isRemote && !databaseUrl) throw new Error('TURSO_DATABASE_URL es requerido cuando DB_MODE=turso|remote')
if (isRemote && !process.env.TURSO_AUTH_TOKEN) throw new Error('TURSO_AUTH_TOKEN es requerido cuando DB_MODE=turso|remote')

const globalForDb = globalThis as unknown as { libsql?: LibsqlClient }
const client = globalForDb.libsql ?? createLibsqlClient({ url: databaseUrl, authToken: process.env.TURSO_AUTH_TOKEN })
if (process.env.NODE_ENV !== 'production') globalForDb.libsql = client

export const db: Db = {
  async exec(sql) { await client.executeMultiple(sql) },
  prepare(sql) {
    const execute = async (args: unknown[]) => {
      for (let attempt = 0; ; attempt += 1) {
        try {
          return await client.execute({ sql, args: args as InArgs })
        } catch (error) {
          if (dbMode !== 'local' || attempt >= 5 || !String(error).includes('SQLITE_BUSY')) throw error
          await new Promise(resolve => setTimeout(resolve, 25 * (attempt + 1)))
        }
      }
    }
    return {
      async get(...args) { const result = await execute(args); return result.rows[0] as DbRow },
      async all(...args) { const result = await execute(args); return result.rows as DbRow[] },
      async run(...args) { const result = await execute(args); return { changes: Number(result.rowsAffected ?? 0), lastInsertRowid: Number(result.lastInsertRowid ?? 0) } },
    }
  },
}

export { dbMode, isRemote }
