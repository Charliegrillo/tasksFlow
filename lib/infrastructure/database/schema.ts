import type { Db } from './connection'

export async function initializeSchema(db: Db): Promise<void> {
  await db.exec(`CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, email TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '', archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  try { await db.exec('ALTER TABLE clients ADD COLUMN archived INTEGER NOT NULL DEFAULT 0') } catch {}

  await db.exec(`CREATE TABLE IF NOT EXISTS spaces (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT 'bg-violet-500', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, client_id INTEGER, secret_password TEXT)`)
  try { await db.exec('ALTER TABLE spaces ADD COLUMN client_id INTEGER') } catch {}
  try { await db.exec('ALTER TABLE spaces ADD COLUMN secret_password TEXT') } catch {}
  try { await db.exec('CREATE UNIQUE INDEX IF NOT EXISTS spaces_client_name ON spaces(client_id, name)') } catch {}

  await db.exec(`CREATE TABLE IF NOT EXISTS space_secrets (id INTEGER PRIMARY KEY AUTOINCREMENT, space_id INTEGER NOT NULL, name TEXT NOT NULL, value TEXT NOT NULL DEFAULT '', type TEXT NOT NULL DEFAULT 'config', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  try { await db.exec('ALTER TABLE space_secrets ADD COLUMN notes TEXT NOT NULL DEFAULT ""') } catch {}
  try { await db.exec('ALTER TABLE space_secrets ADD COLUMN type TEXT NOT NULL DEFAULT "config"') } catch {}

  await db.exec(`CREATE TABLE IF NOT EXISTS boards (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, type TEXT NOT NULL DEFAULT 'roadmap', space_id INTEGER NOT NULL, archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  try { await db.exec("ALTER TABLE boards ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'pendiente'") } catch {}
  try { await db.exec('ALTER TABLE boards ADD COLUMN space_id INTEGER') } catch {}
  try { await db.exec('ALTER TABLE boards ADD COLUMN archived INTEGER NOT NULL DEFAULT 0') } catch {}

  await db.exec(`CREATE TABLE IF NOT EXISTS tasks (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT DEFAULT '', status TEXT NOT NULL DEFAULT 'backlog', priority TEXT NOT NULL DEFAULT 'medium', assignee TEXT NOT NULL DEFAULT 'AM', due_date TEXT, labels TEXT NOT NULL DEFAULT '[]', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, board_id INTEGER, position INTEGER NOT NULL DEFAULT 0)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS attachments (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id INTEGER NOT NULL, name TEXT NOT NULL, pathname TEXT NOT NULL, size INTEGER NOT NULL DEFAULT 0, content_type TEXT NOT NULL DEFAULT 'application/octet-stream', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS board_lists (id INTEGER PRIMARY KEY AUTOINCREMENT, board_id INTEGER NOT NULL, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT 'bg-slate-400', position INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS milestones (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT 'bg-violet-500', client_id INTEGER NOT NULL, archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  try { const cols = (await db.prepare("PRAGMA table_info(milestones)").all() as { name: string }[]).map(c => c.name); if (cols.includes('board_id')) { await db.exec('DROP TABLE milestones'); await db.exec(`CREATE TABLE milestones (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT 'bg-violet-500', client_id INTEGER NOT NULL, archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`) } } catch {}
  try { await db.exec('ALTER TABLE milestones ADD COLUMN archived INTEGER NOT NULL DEFAULT 0') } catch {}
  try { await db.exec('ALTER TABLE tasks ADD COLUMN board_id INTEGER') } catch {}
  try { await db.exec('ALTER TABLE tasks ADD COLUMN position INTEGER NOT NULL DEFAULT 0') } catch {}
  try { await db.exec('ALTER TABLE tasks ADD COLUMN milestone_id INTEGER') } catch {}
  try { await db.exec("ALTER TABLE tasks ADD COLUMN start_date TEXT") } catch {}

  await db.exec(`CREATE TABLE IF NOT EXISTS board_budgets (id INTEGER PRIMARY KEY AUTOINCREMENT, board_id INTEGER NOT NULL UNIQUE, estimated_total REAL NOT NULL DEFAULT 0, actual_total REAL NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  try { await db.exec('ALTER TABLE board_budgets ADD COLUMN tax_rate REAL NOT NULL DEFAULT 16') } catch {}
  try { await db.exec("ALTER TABLE board_budgets ADD COLUMN bank_name TEXT NOT NULL DEFAULT 'Banco de México'") } catch {}
  try { await db.exec("ALTER TABLE board_budgets ADD COLUMN account_holder TEXT NOT NULL DEFAULT 'Taskflow Studio'") } catch {}
  try { await db.exec("ALTER TABLE board_budgets ADD COLUMN account_number TEXT NOT NULL DEFAULT '0012 3456 7890 1234'") } catch {}
  try { await db.exec("ALTER TABLE board_budgets ADD COLUMN clabe TEXT NOT NULL DEFAULT '012345678901234567'") } catch {}
  try { await db.exec("ALTER TABLE board_budgets ADD COLUMN client_name TEXT NOT NULL DEFAULT ''") } catch {}
  try { await db.exec("ALTER TABLE board_budgets ADD COLUMN project_name TEXT NOT NULL DEFAULT ''") } catch {}
  try { await db.exec("ALTER TABLE board_budgets ADD COLUMN project_date TEXT NOT NULL DEFAULT ''") } catch {}

  await db.exec(`CREATE TABLE IF NOT EXISTS budget_items (id INTEGER PRIMARY KEY AUTOINCREMENT, budget_id INTEGER NOT NULL, type TEXT NOT NULL DEFAULT 'task', description TEXT NOT NULL, amount REAL NOT NULL DEFAULT 0, file_name TEXT, file_path TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS budget_payments (id INTEGER PRIMARY KEY AUTOINCREMENT, budget_id INTEGER NOT NULL, amount REAL NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '', date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id INTEGER NOT NULL, author TEXT NOT NULL DEFAULT 'Usuario', content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS checklists (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id INTEGER NOT NULL, title TEXT NOT NULL DEFAULT 'Checklist', position INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS checklist_items (id INTEGER PRIMARY KEY AUTOINCREMENT, checklist_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', due_date TEXT, checked INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  try { await db.exec(`ALTER TABLE checklist_items ADD COLUMN description TEXT NOT NULL DEFAULT ''`) } catch {}
  try { await db.exec(`ALTER TABLE checklist_items ADD COLUMN due_date TEXT`) } catch {}

  await db.exec(`CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '', position TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', website TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)

  await db.exec(`CREATE TABLE IF NOT EXISTS crm_stages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT 'bg-violet-500', position INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS crm_deals (id INTEGER PRIMARY KEY AUTOINCREMENT, contact_id INTEGER NOT NULL, stage_id INTEGER NOT NULL, budget_amount REAL NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  try { await db.exec('ALTER TABLE crm_deals ADD COLUMN notes TEXT NOT NULL DEFAULT ""') } catch {}
  await db.exec(`CREATE TABLE IF NOT EXISTS crm_interactions (id INTEGER PRIMARY KEY AUTOINCREMENT, deal_id INTEGER NOT NULL, type TEXT NOT NULL DEFAULT 'presupuesto', description TEXT NOT NULL DEFAULT '', date TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS crm_deal_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, deal_id INTEGER NOT NULL, author TEXT NOT NULL DEFAULT 'Usuario', content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS crm_deal_attachments (id INTEGER PRIMARY KEY AUTOINCREMENT, deal_id INTEGER NOT NULL, name TEXT NOT NULL, pathname TEXT NOT NULL, size INTEGER NOT NULL DEFAULT 0, content_type TEXT NOT NULL DEFAULT 'application/octet-stream', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)

  await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
  await db.exec(`CREATE TABLE IF NOT EXISTS password_reset_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`)
}
