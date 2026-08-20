import { createClient as createLibsqlClient, type InArgs, type Client as LibsqlClient } from '@libsql/client'
import path from 'node:path'
import type { TaskStatus, TaskPriority, Client, Space, SpaceSecret, BoardPaymentStatus, Board, BoardList, Attachment, Task, Milestone, BoardBudget, BudgetPayment, BudgetItem, Comment, Checklist, ChecklistItem, Contact, CrmStage, CrmDeal, CrmInteraction, CrmDealComment, CrmDealAttachment, User, PasswordResetToken } from './types'

export type { TaskStatus, TaskPriority, Client, Space, SpaceSecret, BoardPaymentStatus, Board, BoardList, Attachment, Task, Milestone, BoardBudget, BudgetPayment, BudgetItem, Comment, Checklist, ChecklistItem, Contact, CrmStage, CrmDeal, CrmInteraction, CrmDealComment, CrmDealAttachment, User, PasswordResetToken }

type DbRow = Record<string, unknown>
type DbRunResult = { changes: number; lastInsertRowid: number }
type Db = {
  exec(sql: string): Promise<void>
  prepare(sql: string): {
    get(...args: unknown[]): Promise<DbRow | undefined>
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

const db: Db = {
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
      async get(...args) { const result = await execute(args); return result.rows[0] as DbRow | undefined },
      async all(...args) { const result = await execute(args); return result.rows as DbRow[] },
      async run(...args) { const result = await execute(args); return { changes: Number(result.rowsAffected ?? 0), lastInsertRowid: Number(result.lastInsertRowid ?? 0) } },
    }
  },
}

let defaultClient: { id: number }
let defaultSpace: { id: number }
let defaultBoard: { id: number }

async function initializeDatabase() {
await db.exec(`CREATE TABLE IF NOT EXISTS clients (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL UNIQUE, email TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '', archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
try { await db.exec('ALTER TABLE clients ADD COLUMN archived INTEGER NOT NULL DEFAULT 0') } catch {}
const clientCount = await db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number }
if (!clientCount.count) await db.prepare('INSERT INTO clients (name, email, company) VALUES (?, ?, ?)').run('Cliente principal', 'contacto@empresa.com', 'Empresa')
defaultClient = await db.prepare('SELECT id FROM clients ORDER BY id LIMIT 1').get() as { id: number }

await db.exec(`CREATE TABLE IF NOT EXISTS spaces (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT 'bg-violet-500', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, client_id INTEGER, secret_password TEXT)`)
try { await db.exec('ALTER TABLE spaces ADD COLUMN client_id INTEGER') } catch {}
try { await db.exec('ALTER TABLE spaces ADD COLUMN secret_password TEXT') } catch {}
await db.prepare('UPDATE spaces SET client_id = ? WHERE client_id IS NULL').run(defaultClient.id)
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
try { await db.exec('ALTER TABLE board_budgets ADD COLUMN bank_name TEXT NOT NULL DEFAULT \'Banco de México\'') } catch {}
try { await db.exec('ALTER TABLE board_budgets ADD COLUMN account_holder TEXT NOT NULL DEFAULT \'Taskflow Studio\'') } catch {}
try { await db.exec('ALTER TABLE board_budgets ADD COLUMN account_number TEXT NOT NULL DEFAULT \'0012 3456 7890 1234\'') } catch {}
try { await db.exec('ALTER TABLE board_budgets ADD COLUMN clabe TEXT NOT NULL DEFAULT \'012345678901234567\'') } catch {}
try { await db.exec('ALTER TABLE board_budgets ADD COLUMN client_name TEXT NOT NULL DEFAULT \'\'') } catch {}
try { await db.exec('ALTER TABLE board_budgets ADD COLUMN project_name TEXT NOT NULL DEFAULT \'\'') } catch {}
try { await db.exec('ALTER TABLE board_budgets ADD COLUMN project_date TEXT NOT NULL DEFAULT \'\'') } catch {}
await db.exec(`CREATE TABLE IF NOT EXISTS budget_items (id INTEGER PRIMARY KEY AUTOINCREMENT, budget_id INTEGER NOT NULL, type TEXT NOT NULL DEFAULT 'task', description TEXT NOT NULL, amount REAL NOT NULL DEFAULT 0, file_name TEXT, file_path TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
await db.exec(`CREATE TABLE IF NOT EXISTS budget_payments (id INTEGER PRIMARY KEY AUTOINCREMENT, budget_id INTEGER NOT NULL, amount REAL NOT NULL DEFAULT 0, description TEXT NOT NULL DEFAULT '', date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
await db.exec(`CREATE TABLE IF NOT EXISTS comments (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id INTEGER NOT NULL, author TEXT NOT NULL DEFAULT 'Usuario', content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
await db.exec(`CREATE TABLE IF NOT EXISTS checklists (id INTEGER PRIMARY KEY AUTOINCREMENT, task_id INTEGER NOT NULL, title TEXT NOT NULL DEFAULT 'Checklist', position INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
await db.exec(`CREATE TABLE IF NOT EXISTS checklist_items (id INTEGER PRIMARY KEY AUTOINCREMENT, checklist_id INTEGER NOT NULL, title TEXT NOT NULL, description TEXT NOT NULL DEFAULT '', due_date TEXT, checked INTEGER NOT NULL DEFAULT 0, position INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
try { await db.exec(`ALTER TABLE checklist_items ADD COLUMN description TEXT NOT NULL DEFAULT ''`) } catch {}
try { await db.exec(`ALTER TABLE checklist_items ADD COLUMN due_date TEXT`) } catch {}

await db.exec(`CREATE TABLE IF NOT EXISTS contacts (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', company TEXT NOT NULL DEFAULT '', position TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', website TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
const contactSeedCount = await db.prepare('SELECT COUNT(*) as count FROM contacts').get() as { count: number }
if (!contactSeedCount.count) {
  const ins = db.prepare('INSERT INTO contacts (name, email, phone, company, position, address, website, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  const data: [string, string, string, string, string, string, string, string][] = [
    ['María García López', 'maria.garcia@techsolutions.mx', '+52 55 1234 5678', 'TechSolutions MX', 'Directora de Marketing', 'Av. Reforma 255, CDMX', 'https://techsolutions.mx', 'Contacto principal para campañas digitales'],
    ['Juan Carlos Ramírez', 'jc.ramirez@innovaweb.com', '+52 55 2345 6789', 'InnovaWeb', 'Gerente de Ventas', 'Calle Juárez 120, CDMX', 'https://innovaweb.com', 'Interesado en paquete empresarial'],
    ['Ana Sofía Hernández', 'ana.hernandez@globalcorp.mx', '+52 55 3456 7890', 'GlobalCorp', 'CTO', 'Blvd. Insurgentes 500, CDMX', 'https://globalcorp.mx', 'Decisión técnica sobre integraciones'],
    ['Roberto Martínez Vega', 'r.martinez@digitalstudio.io', '+52 33 4567 8901', 'Digital Studio', 'Director Creativo', 'Av. Vallarta 300, Guadalajara', 'https://digitalstudio.io', 'Proyectos de branding'],
    ['Laura Castillo Díaz', 'laura.castillo@softdev.mx', '+52 81 5678 9012', 'SoftDev', 'Líder de Proyecto', 'Av. Constitución 100, Monterrey', 'https://softdev.mx', 'Migración de plataforma en curso'],
    ['Fernando Ruiz Ortega', 'f.ruiz@mediapro.com.mx', '+52 55 6789 0123', 'MediaPro', 'Productor Ejecutivo', 'Calle Madero 85, CDMX', 'https://mediapro.com.mx', 'Producción de contenido audiovisual'],
    ['Patricia Morales Silva', 'patricia.m@ecoplus.com', '+52 55 7890 1234', 'EcoPlus', 'Gerente General', 'Av. Insurgentes Sur 1200, CDMX', 'https://ecoplus.com', 'Línea sustentable - interés alto'],
    ['Diego López Navarro', 'diego.lopez@startuplab.mx', '+52 55 8901 2345', 'StartupLab', 'Fundador', 'Calle Córdoba 45, Roma Norte, CDMX', 'https://startuplab.mx', 'Aceleradora de startups'],
    ['Sofía Ramos Flores', 'sofia.ramos@finanzasgp.com', '+52 55 9012 3456', 'FinanzasGP', 'Directora Financiera', 'Paseo de la Reforma 350, CDMX', 'https://finanzasgp.com', 'Análisis de costos pendiente'],
    ['Carlos Mendoza Torres', 'carlos.mendoza@logistik.mx', '+52 81 0123 4567', 'Logistik MX', 'Jefe de Operaciones', 'Av. Universidad 500, Monterrey', 'https://logistik.mx', 'Logística y cadenas de suministro'],
    ['Isabel Vargas Reyes', 'isabel.vargas@creativehub.io', '+52 33 1234 5678', 'CreativeHub', 'Diseñadora UX/UI', 'Calle Independencia 200, Guadalajara', 'https://creativehub.io', 'Diseño de interfaz para app móvil'],
    ['Miguel Ángel Orozco', 'm.orozco@industriasbay.mx', '+52 33 2345 6789', 'Industrias Bay', 'Director de Planta', 'Zona Industrial, Zapopan', 'https://industriasbay.mx', 'Sector manufacturero - NDA firmado'],
    ['Valentina Cruz Peña', 'valentina.cruz@agenciadigital.com', '+52 55 3456 7890', 'Agencia Digital', 'Social Media Manager', 'Condesa, CDMX', 'https://agenciadigital.com', 'Gestión de redes sociales'],
    ['Alejandro Jiménez Salas', 'a.jimenez@constructuramax.mx', '+52 55 4567 8901', 'ConstruMax', 'Arquitecto Lead', 'Av. Toluca 150, CDMX', 'https://constructuramax.mx', 'Proyectos de oficinas corporativas'],
    ['Camila Torres Blanco', 'camila.torres@nutritech.com', '+52 55 5678 9012', 'NutriTech', 'Directora de I+D', 'Ciudad de México', 'https://nutritech.com', 'Desarrollo de productos saludables'],
    ['Ricardo Pineda Castro', 'ricardo.pineda@seguridadtotal.mx', '+52 55 6789 0123', 'SeguridadTotal', 'Gerente de Ventas', 'Calle Sur 80, CDMX', 'https://seguridadtotal.mx', 'Soluciones de ciberseguridad'],
    ['Fernanda Domínguez Ríos', 'fernanda.d@educaplus.org', '+52 55 7890 1234', 'EducaPlus', 'Directora Académica', 'Av. Universidad 200, CDMX', 'https://educaplus.org', 'Plataforma e-learning'],
    ['Javier Herrera Luna', 'j.herrera@transportesgl.com', '+52 81 8901 2345', 'Transportes GL', 'Director Comercial', 'Av. Constitución 800, Monterrey', 'https://transportesgl.com', 'Transporte de carga pesada'],
    ['Daniela Aguilar Medina', 'daniela.aguilar@modainterior.com', '+52 33 9012 3456', 'Moda Interior', 'Diseñadora de Moda', 'Zona Centro, Guadalajara', 'https://modainterior.com', 'Línea de moda contemporánea'],
    ['Enrique Salazar Mora', 'e.salazar@biofarm.mx', '+52 55 0123 4567', 'BioFarm', 'Director Científico', 'Zona de Ciencias, CDMX', 'https://biofarm.mx', 'Farmacéutica - estudios clínicos'],
    ['Paula Ríos Delgado', 'paula.rios@cloudnine.mx', '+52 55 1234 5679', 'CloudNine', 'DevOps Lead', 'CDMX', 'https://cloudnine.mx', 'Infraestructura cloud'],
    ['Andrés Castillo Romero', 'a.castillo@proteccionmax.com', '+52 55 2345 6780', 'ProtecciónMax', 'Jefe de Seguridad', 'CDMX', 'https://proteccionmax.com', 'Servicios de vigilancia'],
    ['Gabriela Flores Quintana', 'g.flores@alimentosdelvalle.mx', '+52 55 3456 7891', 'Alimentos del Valle', 'Directora de Exportaciones', 'Puebla', 'https://alimentosdelvalle.mx', 'Exportación de alimentos procesados'],
    ['Luis Fernando Soto', 'l.soto@automatizaind.mx', '+52 81 4567 8902', 'AutomatizaInd', 'Ingeniero de Automatización', 'Monterrey', 'https://automatizaind.mx', 'Sistemas industriales automatizados'],
    ['Mariana Leal Peña', 'm.leal@arquitecturaverde.com', '+52 33 5678 9013', 'Arquitectura Verde', 'Socia Fundadora', 'Guadalajara', 'https://arquitecturaverde.com', 'Arquitectura sustentable'],
    ['Rogelio Garza Fuentes', 'r.garza@steeltech.mx', '+52 81 6789 0124', 'SteelTech', 'Gerente de Producción', 'Monterrey', 'https://steeltech.mx', 'Manufactura de acero especial'],
    ['Adriana Luna Carrillo', 'a.luna@viajespremium.com', '+52 55 7890 1235', 'Viajes Premium', 'Directora de Experiencias', 'CDMX', 'https://viajespremium.com', 'Turismo de lujo corporativo'],
    ['Óscar Domínguez Sandoval', 'o.dominguez@codecraft.mx', '+52 55 8901 2346', 'CodeCraft', 'CTO', 'CDMX', 'https://codecraft.mx', 'Desarrollo de software a medida'],
    ['Ximena Reyes Salinas', 'x.reyes@marketingpro.com', '+52 55 9012 3457', 'MarketingPro', 'Directora de Estrategia', 'CDMX', 'https://marketingpro.com', 'Campañas B2B'],
    ['Héctor Navarro Velasco', 'h.navarro@industrialpark.mx', '+52 81 0123 4568', 'IndustrialPark', 'Director de Inmuebles', 'Monterrey', 'https://industrialpark.mx', 'Parques industriales'],
    ['Teresa Ortiz Guzmán', 't.ortiz@labmed.mx', '+52 55 1234 5680', 'LabMed', 'Directora de Laboratorio', 'CDMX', 'https://labmed.mx', 'Diagnóstico médico avanzado'],
    ['Francisco Contreras Blasco', 'f.contreras@energialimpia.com', '+52 55 2345 6781', 'EnergíaLimpia', 'Director de Proyectos', 'CDMX', 'https://energialimpia.com', 'Energías renovables - solar'],
    ['Claudia Peñaloza Ríos', 'c.penaloza@eventoscorporativos.mx', '+52 55 3456 7892', 'Eventos Corp', 'Productora de Eventos', 'CDMX', 'https://eventoscorporativos.mx', 'Eventos empresariales y conferencias'],
    ['Armando Villanueva Sosa', 'a.villanueva@segurosintegrales.com', '+52 55 4567 8903', 'Seguros Integrales', 'Agente Senior', 'CDMX', 'https://segurosintegrales.com', 'Pólizas corporativas'],
    ['Brenda Rangel Torres', 'b.rangel@dataminds.mx', '+52 55 5678 9014', 'DataMinds', 'Científica de Datos', 'CDMX', 'https://dataminds.mx', 'Machine learning aplicado'],
    ['Roberto Garza Elizondo', 'r.garza@mobiliariocorp.com', '+52 81 6789 0125', 'MobiliarioCorp', 'Director de Ventas', 'Monterrey', 'https://mobiliariocorp.com', 'Mobiliario corporativo'],
    ['Lucía Fuentes Maldonado', 'l.fuentes@saludtotal.mx', '+52 55 7890 1236', 'SaludTotal', 'Gerente de Clínica', 'CDMX', 'https://saludtotal.mx', 'Clínica multiservicios'],
    ['Jorge Alonso Rivas', 'j.alonso@telecomscorp.com', '+52 55 8901 2347', 'TelecomsCorp', 'Director de Infraestructura', 'CDMX', 'https://telecomscorp.com', 'Redes y telecomunicaciones'],
    ['Ana Luisa Cardona', 'a.cardona@biotechgen.mx', '+52 55 9012 3458', 'BioTechGen', 'Directora de Biotecnología', 'CDMX', 'https://biotechgen.mx', 'Biotecnología agrícola'],
    ['Raúl Esquivel Domínguez', 'r.esquivel@construccionesmerito.mx', '+52 33 0123 4569', 'Construcciones Mérito', 'Superintendente', 'Guadalajara', 'https://construccionesmerito.mx', 'Construcción civil'],
    ['Gloria Sánchez Palacios', 'g.sanchez@fintechplus.com', '+52 55 1234 5681', 'FintechPlus', 'Directora de Producto', 'CDMX', 'https://fintechplus.com', 'Fintech - pagos digitales'],
    ['Iván Morales Aguilar', 'i.morales@agroindustrial.mx', '+52 81 2345 6782', 'AgroIndustrial', 'Gerente de Exportación', 'Monterrey', 'https://agroindustrial.mx', 'Agricultura de precisión'],
    ['Susana Cabrera Leal', 's.cabrera@designstudio.io', '+52 33 3456 7893', 'DesignStudio', 'Directora de Arte', 'Guadalajara', 'https://designstudio.io', 'Branding y diseño gráfico'],
    ['Manuel Herrera Figueroa', 'm.herrera@petroquimicamx.com', '+52 81 4567 8904', 'Petroquímica MX', 'Director de Planta', 'Monterrey', 'https://petroquimicamx.com', 'Petroquímica - certificaciones pendientes'],
    ['Liliana Vega Contreras', 'l.vega@modaverde.mx', '+52 55 5678 9015', 'ModaVerde', 'Fundadora', 'CDMX', 'https://modaverde.mx', 'Moda sustentable - tienda online'],
    ['Gustavo Ríos Paredes', 'g.rios@seguridadindustrial.com', '+52 81 6789 0126', 'SeguridadIndustrial', 'Director Técnico', 'Monterrey', 'https://seguridadindustrial.com', 'EPP y seguridad laboral'],
    ['Natalia Orozco Vega', 'n.orozco@hostingmx.com', '+52 55 7890 1237', 'HostingMX', 'Directora de Operaciones', 'CDMX', 'https://hostingmx.com', 'Hosting y data center'],
    ['Raúl Ponce de León', 'r.ponce@farmaciasalud.mx', '+52 55 8901 2348', 'Farmacia Salud', 'Farmacéutico Titular', 'CDMX', 'https://farmaciasalud.mx', 'Cadena de farmacias'],
    ['Adriana Flores Quintero', 'a.flores@publicidad360.com', '+52 55 9012 3459', 'Publicidad360', 'Directora Creativa', 'CDMX', 'https://publicidad360.com', 'Agencia de publicidad integral'],
    ['Francisco J. Moreno', 'fj.moreno@transportesurgentes.mx', '+52 81 0123 4570', 'Transportes Urgentes', 'Gerente de Flota', 'Monterrey', 'https://transportesurgentes.mx', 'Paquetería express'],
    ['Diana Peralta Sandoval', 'd.peralta@cloudhost.mx', '+52 55 1234 5682', 'CloudHost', 'DevOps Engineer', 'CDMX', 'https://cloudhost.mx', 'Servidores cloud'],
    ['Sergio Beltrán Núñez', 's.beltran@arquitecturacorp.com', '+52 55 2345 6783', 'ArquitecturaCorp', 'Director de Diseño', 'CDMX', 'https://arquitecturacorp.com', 'Arquitectura comercial'],
    ['Mónica Salinas Díaz', 'm.salinas@inversionesalto.mx', '+52 55 3456 7894', 'Inversiones Alto', 'Directora de Inversiones', 'CDMX', 'https://inversionesalto.mx', 'Fondos de inversión'],
    ['Eduardo Cabrera Ruiz', 'e.cabrera@roboticaindustrial.mx', '+52 81 4567 8905', 'Robótica Industrial', 'Director de Ingeniería', 'Monterrey', 'https://roboticaindustrial.mx', 'Automatización y robótica'],
    ['Verónica Lugo Castillo', 'v.lugo@clinicaestetica.com', '+52 55 5678 9016', 'Clínica Estética', 'Directora Médica', 'CDMX', 'https://clinicaestetica.com', 'Medicina estética'],
    ['César Monroy Peña', 'c.monroy@logisticapro.mx', '+52 81 6789 0127', 'LogísticaPro', 'Director de Cadena de Suministro', 'Monterrey', 'https://logisticapro.mx', 'Logística 3PL'],
    ['Laura Esmeralda Ríos', 'le.rios@educaciondigital.mx', '+52 55 7890 1238', 'EducaciónDigital', 'Directora de Contenido', 'CDMX', 'https://educaciondigital.mx', 'Plataformas educativas'],
    ['Ángel Herrera Cortés', 'a.herrera@construccionesmodernas.mx', '+52 55 8901 2349', 'Construcciones Modernas', 'Gerente de Obra', 'CDMX', 'https://construccionesmodernas.mx', 'Construcción residencial'],
    ['Daniela Rojas Mendoza', 'd.rojas@marketplaceplus.com', '+52 55 9012 3460', 'MarketplacePlus', 'Directora de Operaciones', 'CDMX', 'https://marketplaceplus.com', 'Marketplace B2B'],
    ['Fernando Villarreal Orozco', 'f.villarreal@biochem.mx', '+52 81 0123 4571', 'BioChem', 'Director de Investigación', 'Monterrey', 'https://biochem.mx', 'Química farmacéutica'],
    ['Patricia Garza Salinas', 'p.garza@arquitectos.asociados.mx', '+52 81 2345 6784', 'Arquitectos Asociados', 'Socia Directora', 'Monterrey', 'https://arquitectos.asociados.mx', 'Proyectos de oficinas'],
    ['Ricardo Luna Flores', 'r.luna@tecnologiaservicio.mx', '+52 55 3456 7895', 'TecnologíaServicio', 'Director Comercial', 'CDMX', 'https://tecnologiaservicio.mx', 'Outsourcing de TI'],
    ['Mariana Estrada Campos', 'm.estrada@farmaonline.mx', '+52 55 4567 8906', 'FarmaOnline', 'Directora General', 'CDMX', 'https://farmaonline.mx', 'Farmacia en línea'],
    ['Alejandro Rivas Ponce', 'a.rivas@ingenieria.mx', '+52 33 5678 9017', 'Ingeniería MX', 'Ingeniero Civil', 'Guadalajara', 'https://ingenieria.mx', 'Ingeniería estructural'],
    ['Sandra Leal Domínguez', 's.leal@comercioexterior.com', '+52 55 6789 0128', 'ComercioExterior', 'Agente Aduanal', 'CDMX', 'https://comercioexterior.com', 'Importación y exportación'],
    ['Javier Morales Blanco', 'j.morales@techstartup.mx', '+52 55 7890 1239', 'TechStartup', 'CEO', 'CDMX', 'https://techstartup.mx', 'Startup de IA'],
    ['Gabriela Orozco Salazar', 'g.orozco@mediosdigitales.com', '+52 55 8901 2350', 'MediosDigitales', 'Directora de Contenido', 'CDMX', 'https://mediosdigitales.com', 'Producción de contenido digital'],
    ['Óscar Domínguez Reyes', 'o.dominguez@industrial.mx', '+52 81 9012 3461', 'Industrial MX', 'Jefe de Mantenimiento', 'Monterrey', 'https://industrial.mx', 'Mantenimiento industrial'],
    ['Ximena Garza Flores', 'x.garza@seguros.mx', '+52 81 0123 4572', 'Seguros MX', 'Corredora de Seguros', 'Monterrey', 'https://seguros.mx', 'Seguros empresariales'],
    ['Manuel Castillo Ríos', 'm.castillo@transporte.com', '+52 55 1234 5683', 'Transporte MX', 'Director de Flota', 'CDMX', 'https://transporte.com', 'Flota de transporte de personal'],
    ['Laura Rangel Martínez', 'l.rangel@consultoria.mx', '+52 55 2345 6785', 'Consultoría MX', 'Consultora Senior', 'CDMX', 'https://consultoria.mx', 'Consultoría estratégica'],
  ]
  for (const row of data) await ins.run(...row)
}

await db.exec(`CREATE TABLE IF NOT EXISTS crm_stages (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT 'bg-violet-500', position INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
await db.exec(`CREATE TABLE IF NOT EXISTS crm_deals (id INTEGER PRIMARY KEY AUTOINCREMENT, contact_id INTEGER NOT NULL, stage_id INTEGER NOT NULL, budget_amount REAL NOT NULL DEFAULT 0, notes TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
try { await db.exec('ALTER TABLE crm_deals ADD COLUMN notes TEXT NOT NULL DEFAULT ""') } catch {}
await db.exec(`CREATE TABLE IF NOT EXISTS crm_interactions (id INTEGER PRIMARY KEY AUTOINCREMENT, deal_id INTEGER NOT NULL, type TEXT NOT NULL DEFAULT 'presupuesto', description TEXT NOT NULL DEFAULT '', date TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
await db.exec(`CREATE TABLE IF NOT EXISTS crm_deal_comments (id INTEGER PRIMARY KEY AUTOINCREMENT, deal_id INTEGER NOT NULL, author TEXT NOT NULL DEFAULT 'Usuario', content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
await db.exec(`CREATE TABLE IF NOT EXISTS crm_deal_attachments (id INTEGER PRIMARY KEY AUTOINCREMENT, deal_id INTEGER NOT NULL, name TEXT NOT NULL, pathname TEXT NOT NULL, size INTEGER NOT NULL DEFAULT 0, content_type TEXT NOT NULL DEFAULT 'application/octet-stream', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)

const stageCount = await db.prepare('SELECT COUNT(*) as count FROM crm_stages').get() as { count: number }
if (!stageCount.count) {
  const insert = db.prepare('INSERT INTO crm_stages (name, color, position) VALUES (?, ?, ?)')
  await insert.run('Contacto nuevo', 'bg-slate-400', 0)
  await insert.run('Presupuesto enviado', 'bg-amber-500', 1)
  await insert.run('En negociación', 'bg-violet-500', 2)
  await insert.run('Cerrado / Ganado', 'bg-emerald-500', 3)
}

const spaceCount = await db.prepare('SELECT COUNT(*) as count FROM spaces').get() as { count: number }
if (!spaceCount.count) await db.prepare('INSERT INTO spaces (name, color, client_id) VALUES (?, ?, ?)').run('Producto', 'bg-violet-500', defaultClient.id)
defaultSpace = await db.prepare('SELECT id FROM spaces ORDER BY id LIMIT 1').get() as { id: number }

const boardCount = await db.prepare('SELECT COUNT(*) as count FROM boards').get() as { count: number }
if (!boardCount.count) {
  const insertBoard = db.prepare('INSERT INTO boards (name, type, space_id) VALUES (?, ?, ?)')
  await insertBoard.run('Roadmap v1.0', 'roadmap', defaultSpace.id)
  await insertBoard.run('Roadmap v1.1', 'roadmap', defaultSpace.id)
  await insertBoard.run('Mantenimiento & Soporte', 'maintenance', defaultSpace.id)
}
defaultBoard = await db.prepare('SELECT id FROM boards ORDER BY id LIMIT 1').get() as { id: number }

await db.prepare('UPDATE tasks SET board_id = ? WHERE board_id IS NULL').run(defaultBoard.id)

const listCount = await db.prepare('SELECT COUNT(*) as count FROM board_lists').get() as { count: number }
const defaultLists = [['Backlog', 'bg-slate-400'], ['En progreso', 'bg-amber-500'], ['En revisión', 'bg-violet-500'], ['Completado', 'bg-emerald-500']]
if (!listCount.count) {
  const insertList = db.prepare('INSERT INTO board_lists (board_id, name, color, position) VALUES (?, ?, ?, ?)')
  for (const [index, [name, color]] of defaultLists.entries()) await insertList.run(defaultBoard.id, name, color, index)
}
for (const board of await db.prepare('SELECT id FROM boards').all() as { id: number }[]) {
  const count = await db.prepare('SELECT COUNT(*) as count FROM board_lists WHERE board_id=?').get(board.id) as { count: number }
  if (!count.count) {
    const insert = db.prepare('INSERT INTO board_lists (board_id, name, color, position) VALUES (?, ?, ?, ?)')
    for (const [index, [name, color]] of defaultLists.entries()) await insert.run(board.id, name, color, index)
  }
}

const taskCount = await db.prepare('SELECT COUNT(*) as count FROM tasks').get() as { count: number }
if (!taskCount.count) {
  const insert = db.prepare('INSERT INTO tasks (title, description, status, priority, assignee, due_date, labels, board_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  await insert.run('Auditar flujo de onboarding', 'Revisar los puntos de fricción del nuevo flujo.', 'backlog', 'high', 'AM', '2026-08-24', '["Research"]', defaultBoard.id)
  await insert.run('Diseñar pantalla de analítica', 'Explorar métricas y jerarquía visual.', 'progress', 'medium', 'JS', '2026-08-28', '["Design"]', defaultBoard.id)
  await insert.run('Configurar eventos de producto', 'Conectar eventos clave.', 'review', 'low', 'LC', '2026-08-30', '["Dev"]', defaultBoard.id)
  await insert.run('Publicar actualización v2.4', 'Release notes y checklist.', 'done', 'medium', 'AM', '2026-08-18', '["Launch"]', defaultBoard.id)
}
await db.exec(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE, password_hash TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)`)
await db.exec(`CREATE TABLE IF NOT EXISTS password_reset_tokens (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, token TEXT NOT NULL UNIQUE, expires_at TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE)`)

}

const databaseReady = initializeDatabase()

function mapClient(row: Record<string, unknown>): Client { return { id: row.id as number, name: row.name as string, email: row.email as string, company: row.company as string, archived: Boolean(row.archived), createdAt: row.created_at as string } }
function mapSpace(row: Record<string, unknown>): Space { return { id: row.id as number, name: row.name as string, color: row.color as string, createdAt: row.created_at as string, clientId: row.client_id as number, secretPassword: (row.secret_password as string | null) ?? null } }
function mapSpaceSecret(row: Record<string, unknown>): SpaceSecret { return { id: row.id as number, spaceId: row.space_id as number, name: row.name as string, value: row.value as string, type: (row.type as SpaceSecret['type']) ?? 'other', notes: row.notes as string, createdAt: row.created_at as string } }
function mapBoard(row: Record<string, unknown>): Board { return { id: row.id as number, name: row.name as string, type: row.type as string, spaceId: row.space_id as number, paymentStatus: (row.payment_status as BoardPaymentStatus) ?? 'pendiente', archived: Boolean(row.archived), createdAt: row.created_at as string } }
function mapBoardList(row: Record<string, unknown>): BoardList { return { id: row.id as number, boardId: row.board_id as number, name: row.name as string, color: row.color as string, position: row.position as number, createdAt: row.created_at as string } }
export async function listBoards(spaceId: number, includeArchived = false): Promise<Board[]> {
  await databaseReady
 const query = includeArchived ? 'SELECT * FROM boards WHERE space_id=? ORDER BY id ASC' : 'SELECT * FROM boards WHERE space_id=? AND archived=0 ORDER BY id ASC'; return (await db.prepare(query).all(spaceId) as Record<string, unknown>[]).map(mapBoard) }
export async function createBoard(name: string, type: string, spaceId: number): Promise<Board> {
  await databaseReady
 const result = await db.prepare('INSERT INTO boards (name, type, space_id) VALUES (?, ?, ?)').run(name.trim(), type, spaceId); return mapBoard(await db.prepare('SELECT * FROM boards WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateBoard(id: number, input: { name?: string; type?: string; paymentStatus?: BoardPaymentStatus }): Promise<Board | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM boards WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE boards SET name=?, type=?, payment_status=? WHERE id=?').run(input.name?.trim() || current.name, input.type || current.type, input.paymentStatus ?? current.payment_status, id); return mapBoard(await db.prepare('SELECT * FROM boards WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteBoard(id: number): Promise<boolean> {
  await databaseReady
 const board = await db.prepare('SELECT * FROM boards WHERE id=?').get(id) as { space_id: number } | undefined; if (!board) return false; const count = await db.prepare('SELECT COUNT(*) as count FROM boards WHERE space_id=?').get(board.space_id) as { count: number }; if (count.count <= 1) return false; const lists = await db.prepare('SELECT * FROM board_lists WHERE board_id=?').all(id) as { id: number; name: string }[]; for (const list of lists) { const legacyStatus = ({ Backlog: 'backlog', 'En progreso': 'progress', 'En revisión': 'review', Completado: 'done' } as Record<string, string>)[list.name] ?? `list-${list.id}`; await db.prepare('DELETE FROM tasks WHERE board_id=? AND status=?').run(id, legacyStatus); } await db.prepare('DELETE FROM board_lists WHERE board_id=?').run(id); await db.prepare('DELETE FROM boards WHERE id=?').run(id); return true }
export async function archiveBoard(id: number): Promise<Board | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM boards WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE boards SET archived=1 WHERE id=?').run(id); return mapBoard(await db.prepare('SELECT * FROM boards WHERE id=?').get(id) as Record<string, unknown>) }
export async function unarchiveBoard(id: number): Promise<Board | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM boards WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE boards SET archived=0 WHERE id=?').run(id); return mapBoard(await db.prepare('SELECT * FROM boards WHERE id=?').get(id) as Record<string, unknown>) }
export async function listArchivedBoards(spaceId: number): Promise<Board[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM boards WHERE space_id=? AND archived=1 ORDER BY id ASC').all(spaceId) as Record<string, unknown>[]).map(mapBoard) }
export async function listBoardLists(boardId: number): Promise<BoardList[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM board_lists WHERE board_id=? ORDER BY position, id').all(boardId) as Record<string, unknown>[]).map(mapBoardList) }
export async function createBoardList(boardId: number, name: string, color = 'bg-slate-400'): Promise<BoardList> {
  await databaseReady
 const position = (await db.prepare('SELECT COALESCE(MAX(position), -1) + 1 as position FROM board_lists WHERE board_id=?').get(boardId) as { position: number }).position; const result = await db.prepare('INSERT INTO board_lists (board_id, name, color, position) VALUES (?, ?, ?, ?)').run(boardId, name.trim(), color, position); return mapBoardList(await db.prepare('SELECT * FROM board_lists WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function reorderBoardList(id: number, newPosition: number): Promise<BoardList[]> {
  await databaseReady

  const current = await db.prepare('SELECT * FROM board_lists WHERE id=?').get(id) as Record<string, unknown> | undefined
  if (!current) return []
  const boardId = current.board_id as number
  const rows = await db.prepare('SELECT * FROM board_lists WHERE board_id=? ORDER BY position, id').all(boardId) as Record<string, unknown>[]
  const ordered = rows.map(mapBoardList)
  const currentIndex = ordered.findIndex(list => list.id === id)
  if (currentIndex === -1) return ordered
  const maxIndex = Math.max(0, ordered.length - 1)
  const targetIndex = Math.min(Math.max(0, newPosition), maxIndex)
  const [moved] = ordered.splice(currentIndex, 1)
  ordered.splice(targetIndex, 0, moved)
  for (const [index, list] of ordered.entries()) {
    await db.prepare('UPDATE board_lists SET position=? WHERE id=?').run(index, list.id)
  }
  return ordered
}
export async function deleteBoardList(id: number): Promise<boolean> {
  await databaseReady
 const list = await db.prepare('SELECT * FROM board_lists WHERE id=?').get(id) as { board_id: number; name: string } | undefined; if (!list) return false; const count = await db.prepare('SELECT COUNT(*) as count FROM board_lists WHERE board_id=?').get(list.board_id) as { count: number }; if (count.count <= 1) return false; await db.prepare('DELETE FROM board_lists WHERE id=?').run(id); const legacyStatus = ({ Backlog: 'backlog', 'En progreso': 'progress', 'En revisión': 'review', Completado: 'done' } as Record<string, string>)[list.name] ?? `list-${id}`; await db.prepare('DELETE FROM tasks WHERE board_id=? AND status=?').run(list.board_id, legacyStatus); return true }
function mapTask(row: Record<string, unknown>): Task { return { id: row.id as number, title: row.title as string, description: row.description as string, status: row.status as TaskStatus, priority: row.priority as TaskPriority, assignee: row.assignee as string, startDate: row.start_date as string | null, dueDate: row.due_date as string | null, labels: JSON.parse(row.labels as string), createdAt: row.created_at as string, boardId: row.board_id as number, position: (row.position as number) ?? 0, milestoneId: row.milestone_id as number | null } }
function mapMilestone(row: Record<string, unknown>): Milestone { return { id: row.id as number, name: row.name as string, color: row.color as string, clientId: row.client_id as number, archived: Boolean(row.archived), createdAt: row.created_at as string } }
export async function listClients(): Promise<Client[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM clients WHERE archived=0 ORDER BY id ASC').all() as Record<string, unknown>[]).map(mapClient) }
export async function createClient(input: Partial<Client>): Promise<Client> {
  await databaseReady
 const result = await db.prepare('INSERT INTO clients (name, email, company) VALUES (?, ?, ?)').run(input.name?.trim(), input.email?.trim() ?? '', input.company?.trim() ?? ''); return mapClient(await db.prepare('SELECT * FROM clients WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateClient(id: number, input: Partial<Client>): Promise<Client | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM clients WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE clients SET name=?, email=?, company=? WHERE id=?').run(input.name?.trim() || current.name, input.email?.trim() ?? current.email, input.company?.trim() ?? current.company, id); return mapClient(await db.prepare('SELECT * FROM clients WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteClient(id: number): Promise<boolean> {
  await databaseReady
 if ((await db.prepare('SELECT COUNT(*) as count FROM clients').get() as { count: number }).count <= 1) return false; const deleted = (await db.prepare('DELETE FROM clients WHERE id=?').run(id)).changes > 0; if (deleted) { const spaces = await db.prepare('SELECT id FROM spaces WHERE client_id=?').all(id) as { id: number }[]; for (const space of spaces) { const boards = await db.prepare('SELECT id FROM boards WHERE space_id=?').all(space.id) as { id: number }[]; for (const board of boards) { await db.prepare('DELETE FROM tasks WHERE board_id=?').run(board.id); await db.prepare('DELETE FROM board_lists WHERE board_id=?').run(board.id); } await db.prepare('DELETE FROM boards WHERE space_id=?').run(space.id); } await db.prepare('DELETE FROM spaces WHERE client_id=?').run(id) } return deleted }
export async function archiveClient(id: number): Promise<Client | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM clients WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE clients SET archived=1 WHERE id=?').run(id); return mapClient(await db.prepare('SELECT * FROM clients WHERE id=?').get(id) as Record<string, unknown>) }
export async function unarchiveClient(id: number): Promise<Client | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM clients WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE clients SET archived=0 WHERE id=?').run(id); return mapClient(await db.prepare('SELECT * FROM clients WHERE id=?').get(id) as Record<string, unknown>) }
export async function listArchivedClients(): Promise<Client[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM clients WHERE archived=1 ORDER BY id ASC').all() as Record<string, unknown>[]).map(mapClient) }
export async function listSpaces(clientId?: number): Promise<Space[]> {
  await databaseReady
 const rows = clientId ? await db.prepare('SELECT * FROM spaces WHERE client_id=? ORDER BY id ASC').all(clientId) : await db.prepare('SELECT * FROM spaces ORDER BY id ASC').all(); return (rows as Record<string, unknown>[]).map(mapSpace) }
export async function getSpace(id: number): Promise<Space | null> {
  await databaseReady
 const row = await db.prepare('SELECT * FROM spaces WHERE id=?').get(id) as Record<string, unknown> | undefined; return row ? mapSpace(row) : null }
export async function createSpace(name: string, color = 'bg-violet-500', clientId = defaultClient.id, secretPassword?: string | null): Promise<Space> {
  await databaseReady
 const result = await db.prepare('INSERT INTO spaces (name, color, client_id, secret_password) VALUES (?, ?, ?, ?)').run(name.trim(), color, clientId, secretPassword?.trim() || null); return mapSpace(await db.prepare('SELECT * FROM spaces WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateSpace(id: number, input: { name?: string; color?: string; secretPassword?: string | null }): Promise<Space | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM spaces WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; const nextPassword = input.secretPassword !== undefined ? (input.secretPassword?.trim() || null) : (current.secret_password as string | null) ?? null; await db.prepare('UPDATE spaces SET name=?, color=?, secret_password=? WHERE id=?').run(input.name?.trim() || current.name, input.color || current.color, nextPassword, id); return mapSpace(await db.prepare('SELECT * FROM spaces WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteSpace(id: number): Promise<boolean> {
  await databaseReady
 if ((await db.prepare('SELECT COUNT(*) as count FROM spaces').get() as { count: number }).count <= 1) return false; const deleted = (await db.prepare('DELETE FROM spaces WHERE id=?').run(id)).changes > 0; if (deleted) { const boards = await db.prepare('SELECT id FROM boards WHERE space_id=?').all(id) as { id: number }[]; for (const board of boards) { await db.prepare('DELETE FROM tasks WHERE board_id=?').run(board.id); await db.prepare('DELETE FROM board_lists WHERE board_id=?').run(board.id); } await db.prepare('DELETE FROM boards WHERE space_id=?').run(id); await db.prepare('DELETE FROM space_secrets WHERE space_id=?').run(id) } return deleted }
export async function validateSpacePassword(spaceId: number, password: string): Promise<boolean> {
  await databaseReady

  const row = await db.prepare('SELECT secret_password FROM spaces WHERE id=?').get(spaceId) as { secret_password: string | null } | undefined
  if (!row || row.secret_password === null || row.secret_password === '') return true
  return row.secret_password === password
}
export async function listSpaceSecrets(spaceId: number): Promise<SpaceSecret[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM space_secrets WHERE space_id=? ORDER BY id ASC').all(spaceId) as Record<string, unknown>[]).map(mapSpaceSecret) }
export async function createSpaceSecret(spaceId: number, input: { name: string; value: string; type?: SpaceSecret['type']; notes?: string }): Promise<SpaceSecret> {
  await databaseReady
 const result = await db.prepare('INSERT INTO space_secrets (space_id, name, value, type, notes) VALUES (?, ?, ?, ?, ?)').run(spaceId, input.name.trim(), input.value, input.type ?? 'other', input.notes?.trim() ?? ''); return mapSpaceSecret(await db.prepare('SELECT * FROM space_secrets WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateSpaceSecret(id: number, input: Partial<{ name: string; value: string; type: SpaceSecret['type']; notes: string }>): Promise<SpaceSecret | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM space_secrets WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE space_secrets SET name=?, value=?, type=?, notes=? WHERE id=?').run(input.name?.trim() || current.name, input.value ?? current.value, input.type ?? current.type, input.notes?.trim() ?? current.notes ?? '', id); return mapSpaceSecret(await db.prepare('SELECT * FROM space_secrets WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteSpaceSecret(id: number): Promise<boolean> {
  await databaseReady
 return (await db.prepare('DELETE FROM space_secrets WHERE id=?').run(id)).changes > 0 }
export async function listTasks(boardId?: number): Promise<Task[]> {
  await databaseReady
 const rows = boardId ? await db.prepare('SELECT * FROM tasks WHERE board_id=? ORDER BY id ASC').all(boardId) : await db.prepare('SELECT * FROM tasks ORDER BY id ASC').all(); return (rows as Record<string, unknown>[]).map(mapTask) }
export async function createTask(input: Partial<Task> & { boardId?: number }): Promise<Task> {
  await databaseReady
 const boardId = input.boardId ?? defaultBoard.id; const status = input.status ?? 'backlog'; const maxPos = (await db.prepare('SELECT COALESCE(MAX(position), -1) + 1 as pos FROM tasks WHERE board_id=? AND status=?').get(boardId, status) as { pos: number }).pos; const result = await db.prepare('INSERT INTO tasks (title, description, status, priority, assignee, start_date, due_date, labels, board_id, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(input.title, input.description ?? '', status, input.priority ?? 'medium', input.assignee ?? 'AM', input.startDate ?? null, input.dueDate ?? null, JSON.stringify(input.labels ?? []), boardId, maxPos); return mapTask(await db.prepare('SELECT * FROM tasks WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateTask(id: number, input: Partial<Task>): Promise<Task | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM tasks WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; const next = { ...mapTask(current), ...input }; await db.prepare('UPDATE tasks SET title=?, description=?, status=?, priority=?, assignee=?, start_date=?, due_date=?, labels=?, milestone_id=? WHERE id=?').run(next.title, next.description, next.status, next.priority, next.assignee, next.startDate ?? null, next.dueDate, JSON.stringify(next.labels), next.milestoneId ?? null, id); return mapTask(await db.prepare('SELECT * FROM tasks WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteTask(id: number): Promise<boolean> {
  await databaseReady
 return (await db.prepare('DELETE FROM tasks WHERE id=?').run(id)).changes > 0 }
export async function reorderTask(id: number, newStatus: string, newPosition: number): Promise<void> {
  await databaseReady
 const task = await db.prepare('SELECT * FROM tasks WHERE id=?').get(id) as { board_id: number; status: string; position: number } | undefined; if (!task) return; const oldStatus = task.status; await db.prepare('UPDATE tasks SET status=?, position=? WHERE id=?').run(newStatus, newPosition, id); if (oldStatus === newStatus) { await db.prepare('UPDATE tasks SET position=position+1 WHERE board_id=? AND status=? AND position>=? AND id!=?').run(task.board_id, newStatus, newPosition, id) } else { await db.prepare('UPDATE tasks SET position=position+1 WHERE board_id=? AND status=? AND position>=?').run(task.board_id, newStatus, newPosition); await db.prepare('UPDATE tasks SET position=position-1 WHERE board_id=? AND status=? AND position>?').run(task.board_id, oldStatus, task.position) } }
function mapAttachment(row: Record<string, unknown>): Attachment { return { id: row.id as number, taskId: row.task_id as number, name: row.name as string, pathname: row.pathname as string, size: row.size as number, contentType: row.content_type as string, createdAt: row.created_at as string } }
export async function listAttachments(taskId?: number): Promise<Attachment[]> {
  await databaseReady
 const rows = taskId ? await db.prepare('SELECT * FROM attachments WHERE task_id = ? ORDER BY id DESC').all(taskId) : await db.prepare('SELECT * FROM attachments ORDER BY id DESC').all(); return (rows as Record<string, unknown>[]).map(mapAttachment) }
export async function createAttachment(input: Omit<Attachment, 'id' | 'createdAt'>): Promise<Attachment> {
  await databaseReady
 const result = await db.prepare('INSERT INTO attachments (task_id, name, pathname, size, content_type) VALUES (?, ?, ?, ?, ?)').run(input.taskId, input.name, input.pathname, input.size, input.contentType); return mapAttachment(await db.prepare('SELECT * FROM attachments WHERE id = ?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function deleteAttachment(id: number): Promise<Attachment | null> {
  await databaseReady
 const attachment = await db.prepare('SELECT * FROM attachments WHERE id = ?').get(id) as Record<string, unknown> | undefined; if (!attachment) return null; await db.prepare('DELETE FROM attachments WHERE id = ?').run(id); return mapAttachment(attachment) }
export async function listMilestones(clientId: number, includeArchived = false): Promise<Milestone[]> {
  await databaseReady
 const query = includeArchived ? 'SELECT * FROM milestones WHERE client_id=? ORDER BY id ASC' : 'SELECT * FROM milestones WHERE client_id=? AND archived=0 ORDER BY id ASC'; return (await db.prepare(query).all(clientId) as Record<string, unknown>[]).map(mapMilestone) }
export async function createMilestone(name: string, color: string, clientId: number): Promise<Milestone> {
  await databaseReady
 const result = await db.prepare('INSERT INTO milestones (name, color, client_id) VALUES (?, ?, ?)').run(name.trim(), color, clientId); return mapMilestone(await db.prepare('SELECT * FROM milestones WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateMilestone(id: number, input: { name?: string; color?: string }): Promise<Milestone | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM milestones WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE milestones SET name=?, color=? WHERE id=?').run(input.name?.trim() || current.name, input.color || current.color, id); return mapMilestone(await db.prepare('SELECT * FROM milestones WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteMilestone(id: number): Promise<boolean> {
  await databaseReady
 await db.prepare('UPDATE tasks SET milestone_id=NULL WHERE milestone_id=?').run(id); return (await db.prepare('DELETE FROM milestones WHERE id=?').run(id)).changes > 0 }
export async function archiveMilestone(id: number): Promise<Milestone | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM milestones WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE milestones SET archived=1 WHERE id=?').run(id); return mapMilestone(await db.prepare('SELECT * FROM milestones WHERE id=?').get(id) as Record<string, unknown>) }
export async function unarchiveMilestone(id: number): Promise<Milestone | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM milestones WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE milestones SET archived=0 WHERE id=?').run(id); return mapMilestone(await db.prepare('SELECT * FROM milestones WHERE id=?').get(id) as Record<string, unknown>) }
export async function listArchivedMilestones(clientId: number): Promise<Milestone[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM milestones WHERE client_id=? AND archived=1 ORDER BY id ASC').all(clientId) as Record<string, unknown>[]).map(mapMilestone) }
function mapBudget(row: Record<string, unknown>): BoardBudget { return { id: row.id as number, boardId: row.board_id as number, estimatedTotal: row.estimated_total as number, actualTotal: row.actual_total as number, notes: row.notes as string, taxRate: row.tax_rate as number, bankName: row.bank_name as string, accountHolder: row.account_holder as string, accountNumber: row.account_number as string, clabe: row.clabe as string, clientName: row.client_name as string, projectName: row.project_name as string, projectDate: row.project_date as string, createdAt: row.created_at as string } }
function mapBudgetItem(row: Record<string, unknown>): BudgetItem { return { id: row.id as number, budgetId: row.budget_id as number, type: row.type as BudgetItem['type'], description: row.description as string, amount: row.amount as number, fileName: row.file_name as string | null, filePath: row.file_path as string | null, createdAt: row.created_at as string } }
export async function getOrCreateBudget(boardId: number): Promise<BoardBudget> {
  await databaseReady
 let row = await db.prepare('SELECT * FROM board_budgets WHERE board_id=?').get(boardId) as Record<string, unknown> | undefined; if (!row) { const result = await db.prepare('INSERT INTO board_budgets (board_id) VALUES (?)').run(boardId); row = await db.prepare('SELECT * FROM board_budgets WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown> } return mapBudget(row) }
export async function updateBudget(boardId: number, input: { estimatedTotal?: number; actualTotal?: number; notes?: string; taxRate?: number; bankName?: string; accountHolder?: string; accountNumber?: string; clabe?: string; clientName?: string; projectName?: string; projectDate?: string }): Promise<BoardBudget> {
  await databaseReady
 const budget = await getOrCreateBudget(boardId); const next = { estimatedTotal: input.estimatedTotal ?? budget.estimatedTotal, actualTotal: input.actualTotal ?? budget.actualTotal, notes: input.notes ?? budget.notes, taxRate: input.taxRate ?? budget.taxRate, bankName: input.bankName ?? budget.bankName, accountHolder: input.accountHolder ?? budget.accountHolder, accountNumber: input.accountNumber ?? budget.accountNumber, clabe: input.clabe ?? budget.clabe, clientName: input.clientName ?? budget.clientName, projectName: input.projectName ?? budget.projectName, projectDate: input.projectDate ?? budget.projectDate }; await db.prepare('UPDATE board_budgets SET estimated_total=?, actual_total=?, notes=?, tax_rate=?, bank_name=?, account_holder=?, account_number=?, clabe=?, client_name=?, project_name=?, project_date=? WHERE id=?').run(next.estimatedTotal, next.actualTotal, next.notes, next.taxRate, next.bankName, next.accountHolder, next.accountNumber, next.clabe, next.clientName, next.projectName, next.projectDate, budget.id); return mapBudget(await db.prepare('SELECT * FROM board_budgets WHERE id=?').get(budget.id) as Record<string, unknown>) }
export async function listBudgetItems(budgetId: number): Promise<BudgetItem[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM budget_items WHERE budget_id=? ORDER BY id ASC').all(budgetId) as Record<string, unknown>[]).map(mapBudgetItem) }
export async function addBudgetItem(budgetId: number, input: { type: BudgetItem['type']; description: string; amount?: number; fileName?: string | null; filePath?: string | null }): Promise<BudgetItem> {
  await databaseReady
 const result = await db.prepare('INSERT INTO budget_items (budget_id, type, description, amount, file_name, file_path) VALUES (?, ?, ?, ?, ?, ?)').run(budgetId, input.type, input.description.trim(), input.amount ?? 0, input.fileName ?? null, input.filePath ?? null); return mapBudgetItem(await db.prepare('SELECT * FROM budget_items WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function deleteBudgetItem(id: number): Promise<boolean> {
  await databaseReady
 return (await db.prepare('DELETE FROM budget_items WHERE id=?').run(id)).changes > 0 }

export async function updateBudgetItem(id: number, input: { type?: BudgetItem['type']; description?: string; amount?: number }): Promise<BudgetItem | null> {
  await databaseReady
 const existing = await db.prepare('SELECT * FROM budget_items WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!existing) return null; const next = { type: (input.type ?? existing.type) as BudgetItem['type'], description: (input.description ?? existing.description) as string, amount: (input.amount ?? existing.amount) as number }; await db.prepare('UPDATE budget_items SET type=?, description=?, amount=? WHERE id=?').run(next.type, next.description.trim(), next.amount, id); return mapBudgetItem(await db.prepare('SELECT * FROM budget_items WHERE id=?').get(id) as Record<string, unknown>) }
function mapPayment(row: Record<string, unknown>): BudgetPayment { return { id: row.id as number, budgetId: row.budget_id as number, amount: row.amount as number, description: row.description as string, date: row.date as string, createdAt: row.created_at as string } }
export async function listBudgetPayments(budgetId: number): Promise<BudgetPayment[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM budget_payments WHERE budget_id=? ORDER BY date DESC').all(budgetId) as Record<string, unknown>[]).map(mapPayment) }
export async function addBudgetPayment(budgetId: number, input: { amount: number; description?: string; date?: string }): Promise<BudgetPayment> {
  await databaseReady
 const result = await db.prepare('INSERT INTO budget_payments (budget_id, amount, description, date) VALUES (?, ?, ?, ?)').run(budgetId, input.amount, input.description ?? '', input.date ?? new Date().toISOString().slice(0, 10)); return mapPayment(await db.prepare('SELECT * FROM budget_payments WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function deleteBudgetPayment(id: number): Promise<boolean> {
  await databaseReady
 return (await db.prepare('DELETE FROM budget_payments WHERE id=?').run(id)).changes > 0 }
function mapComment(row: Record<string, unknown>): Comment { return { id: row.id as number, taskId: row.task_id as number, author: row.author as string, content: row.content as string, createdAt: row.created_at as string } }
export async function listComments(taskId: number): Promise<Comment[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM comments WHERE task_id=? ORDER BY id ASC').all(taskId) as Record<string, unknown>[]).map(mapComment) }
export async function addComment(taskId: number, author: string, content: string): Promise<Comment> {
  await databaseReady
 const result = await db.prepare('INSERT INTO comments (task_id, author, content) VALUES (?, ?, ?)').run(taskId, author.trim() || 'Usuario', content.trim()); return mapComment(await db.prepare('SELECT * FROM comments WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateComment(id: number, content: string): Promise<Comment | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM comments WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE comments SET content=? WHERE id=?').run(content.trim(), id); return mapComment(await db.prepare('SELECT * FROM comments WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteComment(id: number): Promise<boolean> {
  await databaseReady
 return (await db.prepare('DELETE FROM comments WHERE id=?').run(id)).changes > 0 }
function mapChecklist(row: Record<string, unknown>): Checklist { return { id: row.id as number, taskId: row.task_id as number, title: row.title as string, position: row.position as number, createdAt: row.created_at as string } }
function mapChecklistItem(row: Record<string, unknown>): ChecklistItem { return { id: row.id as number, checklistId: row.checklist_id as number, title: row.title as string, description: row.description as string, dueDate: row.due_date as string | null, checked: Boolean(row.checked), position: row.position as number, createdAt: row.created_at as string } }
export async function listChecklists(taskId: number): Promise<(Checklist & { items: ChecklistItem[] })[]> {
  await databaseReady
  const rows = await db.prepare('SELECT * FROM checklists WHERE task_id=? ORDER BY position ASC, id ASC').all(taskId) as Record<string, unknown>[]
  const result: (Checklist & { items: ChecklistItem[] })[] = []
  for (const row of rows) {
    const checklist = mapChecklist(row)
    const items = (await db.prepare('SELECT * FROM checklist_items WHERE checklist_id=? ORDER BY position ASC, id ASC').all(checklist.id) as Record<string, unknown>[]).map(mapChecklistItem)
    result.push({ ...checklist, items })
  }
  return result
}
export async function addChecklist(taskId: number, title: string): Promise<Checklist> {
  await databaseReady
 const maxPos = (await db.prepare('SELECT COALESCE(MAX(position), -1) + 1 as pos FROM checklists WHERE task_id=?').get(taskId) as { pos: number }).pos; const result = await db.prepare('INSERT INTO checklists (task_id, title, position) VALUES (?, ?, ?)').run(taskId, title.trim() || 'Checklist', maxPos); return mapChecklist(await db.prepare('SELECT * FROM checklists WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function deleteChecklist(id: number): Promise<boolean> {
  await databaseReady
 await db.prepare('DELETE FROM checklist_items WHERE checklist_id=?').run(id); return (await db.prepare('DELETE FROM checklists WHERE id=?').run(id)).changes > 0 }
export async function updateChecklist(id: number, title: string): Promise<Checklist | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM checklists WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE checklists SET title=? WHERE id=?').run(title.trim() || 'Checklist', id); return mapChecklist(await db.prepare('SELECT * FROM checklists WHERE id=?').get(id) as Record<string, unknown>) }
export async function addChecklistItem(checklistId: number, title: string): Promise<ChecklistItem> {
  await databaseReady
 const maxPos = (await db.prepare('SELECT COALESCE(MAX(position), -1) + 1 as pos FROM checklist_items WHERE checklist_id=?').get(checklistId) as { pos: number }).pos; const result = await db.prepare('INSERT INTO checklist_items (checklist_id, title, position) VALUES (?, ?, ?)').run(checklistId, title.trim(), maxPos); return mapChecklistItem(await db.prepare('SELECT * FROM checklist_items WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateChecklistItem(id: number, input: { title?: string; description?: string; dueDate?: string | null; checked?: boolean }): Promise<ChecklistItem | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM checklist_items WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; const next = { title: input.title ?? current.title as string, description: input.description ?? current.description as string, dueDate: input.dueDate !== undefined ? input.dueDate : current.due_date as string | null, checked: input.checked ?? Boolean(current.checked) }; await db.prepare('UPDATE checklist_items SET title=?, description=?, due_date=?, checked=? WHERE id=?').run(next.title, next.description, next.dueDate, next.checked ? 1 : 0, id); return mapChecklistItem(await db.prepare('SELECT * FROM checklist_items WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteChecklistItem(id: number): Promise<boolean> {
  await databaseReady
 return (await db.prepare('DELETE FROM checklist_items WHERE id=?').run(id)).changes > 0 }

function mapContact(row: Record<string, unknown>): Contact { return { id: row.id as number, name: row.name as string, email: row.email as string, phone: row.phone as string, company: row.company as string, position: row.position as string, address: row.address as string, website: row.website as string, notes: row.notes as string, createdAt: row.created_at as string } }
export async function listContacts(): Promise<Contact[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM contacts ORDER BY id ASC').all() as Record<string, unknown>[]).map(mapContact) }
export async function createContact(input: Partial<Contact>): Promise<Contact> {
  await databaseReady
 const result = await db.prepare('INSERT INTO contacts (name, email, phone, company, position, address, website, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(input.name?.trim() ?? '', input.email?.trim() ?? '', input.phone?.trim() ?? '', input.company?.trim() ?? '', input.position?.trim() ?? '', input.address?.trim() ?? '', input.website?.trim() ?? '', input.notes?.trim() ?? ''); return mapContact(await db.prepare('SELECT * FROM contacts WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateContact(id: number, input: Partial<Contact>): Promise<Contact | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM contacts WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE contacts SET name=?, email=?, phone=?, company=?, position=?, address=?, website=?, notes=? WHERE id=?').run(input.name?.trim() || current.name, input.email?.trim() ?? current.email, input.phone?.trim() ?? current.phone, input.company?.trim() ?? current.company, input.position?.trim() ?? current.position, input.address?.trim() ?? current.address, input.website?.trim() ?? current.website, input.notes?.trim() ?? current.notes, id); return mapContact(await db.prepare('SELECT * FROM contacts WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteContact(id: number): Promise<boolean> {
  await databaseReady
 await db.prepare('DELETE FROM crm_interactions WHERE deal_id IN (SELECT id FROM crm_deals WHERE contact_id=?)').run(id); await db.prepare('DELETE FROM crm_deals WHERE contact_id=?').run(id); return (await db.prepare('DELETE FROM contacts WHERE id=?').run(id)).changes > 0 }

function mapCrmStage(row: Record<string, unknown>): CrmStage { return { id: row.id as number, name: row.name as string, color: row.color as string, position: row.position as number, createdAt: row.created_at as string } }
export async function listCrmStages(): Promise<CrmStage[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM crm_stages ORDER BY position ASC, id ASC').all() as Record<string, unknown>[]).map(mapCrmStage) }
export async function createCrmStage(name: string, color: string): Promise<CrmStage> {
  await databaseReady
 const maxPos = (await db.prepare('SELECT COALESCE(MAX(position), -1) + 1 as pos FROM crm_stages').get() as { pos: number }).pos; const result = await db.prepare('INSERT INTO crm_stages (name, color, position) VALUES (?, ?, ?)').run(name.trim(), color, maxPos); return mapCrmStage(await db.prepare('SELECT * FROM crm_stages WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateCrmStage(id: number, input: { name?: string; color?: string; position?: number }): Promise<CrmStage | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM crm_stages WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE crm_stages SET name=?, color=?, position=? WHERE id=?').run(input.name?.trim() || current.name, input.color || current.color, input.position ?? current.position, id); return mapCrmStage(await db.prepare('SELECT * FROM crm_stages WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteCrmStage(id: number): Promise<boolean> {
  await databaseReady
 const stageCount = await db.prepare('SELECT COUNT(*) as count FROM crm_stages').get() as { count: number }; if (stageCount.count <= 1) return false; await db.prepare('DELETE FROM crm_interactions WHERE deal_id IN (SELECT id FROM crm_deals WHERE stage_id=?)').run(id); await db.prepare('DELETE FROM crm_deals WHERE stage_id=?').run(id); return (await db.prepare('DELETE FROM crm_stages WHERE id=?').run(id)).changes > 0 }
export async function reorderCrmStages(id: number, newPosition: number): Promise<CrmStage[]> {
  await databaseReady
  const rows = await db.prepare('SELECT * FROM crm_stages ORDER BY position, id').all() as Record<string, unknown>[]
  const ordered = rows.map(mapCrmStage)
  const currentIndex = ordered.findIndex(s => s.id === id)
  if (currentIndex === -1) return ordered
  const maxIndex = Math.max(0, ordered.length - 1)
  const targetIndex = Math.min(Math.max(0, newPosition), maxIndex)
  const [moved] = ordered.splice(currentIndex, 1)
  ordered.splice(targetIndex, 0, moved)
  for (const [index, stage] of ordered.entries()) await db.prepare('UPDATE crm_stages SET position=? WHERE id=?').run(index, stage.id)
  return ordered
}

function mapCrmDeal(row: Record<string, unknown>): CrmDeal { return { id: row.id as number, contactId: row.contact_id as number, stageId: row.stage_id as number, budgetAmount: row.budget_amount as number, notes: row.notes as string ?? '', createdAt: row.created_at as string, updatedAt: row.updated_at as string } }
export async function listCrmDeals(stageId?: number): Promise<CrmDeal[]> {
  await databaseReady
 const rows = stageId ? await db.prepare('SELECT * FROM crm_deals WHERE stage_id=? ORDER BY id ASC').all(stageId) : await db.prepare('SELECT * FROM crm_deals ORDER BY id ASC').all(); return (rows as Record<string, unknown>[]).map(mapCrmDeal) }
export async function createCrmDeal(contactId: number, stageId: number, budgetAmount = 0): Promise<CrmDeal> {
  await databaseReady
 const result = await db.prepare('INSERT INTO crm_deals (contact_id, stage_id, budget_amount) VALUES (?, ?, ?)').run(contactId, stageId, budgetAmount); return mapCrmDeal(await db.prepare('SELECT * FROM crm_deals WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function updateCrmDeal(id: number, input: { stageId?: number; budgetAmount?: number; notes?: string }): Promise<CrmDeal | null> {
  await databaseReady
 const current = await db.prepare('SELECT * FROM crm_deals WHERE id=?').get(id) as Record<string, unknown> | undefined; if (!current) return null; await db.prepare('UPDATE crm_deals SET stage_id=?, budget_amount=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?').run(input.stageId ?? current.stage_id, input.budgetAmount ?? current.budget_amount, input.notes ?? current.notes ?? '', id); return mapCrmDeal(await db.prepare('SELECT * FROM crm_deals WHERE id=?').get(id) as Record<string, unknown>) }
export async function deleteCrmDeal(id: number): Promise<boolean> {
  await databaseReady
 await db.prepare('DELETE FROM crm_interactions WHERE deal_id=?').run(id); await db.prepare('DELETE FROM crm_deal_comments WHERE deal_id=?').run(id); await db.prepare('DELETE FROM crm_deal_attachments WHERE deal_id=?').run(id); return (await db.prepare('DELETE FROM crm_deals WHERE id=?').run(id)).changes > 0 }

function mapCrmInteraction(row: Record<string, unknown>): CrmInteraction { return { id: row.id as number, dealId: row.deal_id as number, type: row.type as CrmInteraction['type'], description: row.description as string, date: row.date as string, createdAt: row.created_at as string } }
export async function listCrmInteractions(dealId: number): Promise<CrmInteraction[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM crm_interactions WHERE deal_id=? ORDER BY id DESC').all(dealId) as Record<string, unknown>[]).map(mapCrmInteraction) }
export async function createCrmInteraction(dealId: number, type: CrmInteraction['type'], description: string, date: string): Promise<CrmInteraction> {
  await databaseReady
 const result = await db.prepare('INSERT INTO crm_interactions (deal_id, type, description, date) VALUES (?, ?, ?, ?)').run(dealId, type, description.trim(), date); await db.prepare('UPDATE crm_deals SET updated_at=CURRENT_TIMESTAMP WHERE id=?').run(dealId); return mapCrmInteraction(await db.prepare('SELECT * FROM crm_interactions WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function deleteCrmInteraction(id: number): Promise<boolean> {
  await databaseReady
 return (await db.prepare('DELETE FROM crm_interactions WHERE id=?').run(id)).changes > 0 }

function mapCrmDealComment(row: Record<string, unknown>): CrmDealComment { return { id: row.id as number, dealId: row.deal_id as number, author: row.author as string, content: row.content as string, createdAt: row.created_at as string } }
export async function listCrmDealComments(dealId: number): Promise<CrmDealComment[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM crm_deal_comments WHERE deal_id=? ORDER BY id ASC').all(dealId) as Record<string, unknown>[]).map(mapCrmDealComment) }
export async function addCrmDealComment(dealId: number, author: string, content: string): Promise<CrmDealComment> {
  await databaseReady
 const result = await db.prepare('INSERT INTO crm_deal_comments (deal_id, author, content) VALUES (?, ?, ?)').run(dealId, author.trim() || 'Usuario', content.trim()); await db.prepare('UPDATE crm_deals SET updated_at=CURRENT_TIMESTAMP WHERE id=?').run(dealId); return mapCrmDealComment(await db.prepare('SELECT * FROM crm_deal_comments WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function deleteCrmDealComment(id: number): Promise<boolean> {
  await databaseReady
 return (await db.prepare('DELETE FROM crm_deal_comments WHERE id=?').run(id)).changes > 0 }

function mapCrmDealAttachment(row: Record<string, unknown>): CrmDealAttachment { return { id: row.id as number, dealId: row.deal_id as number, name: row.name as string, pathname: row.pathname as string, size: row.size as number, contentType: row.content_type as string, createdAt: row.created_at as string } }
export async function listCrmDealAttachments(dealId: number): Promise<CrmDealAttachment[]> {
  await databaseReady
 return (await db.prepare('SELECT * FROM crm_deal_attachments WHERE deal_id=? ORDER BY id DESC').all(dealId) as Record<string, unknown>[]).map(mapCrmDealAttachment) }
export async function createCrmDealAttachment(input: { dealId: number; name: string; pathname: string; size: number; contentType: string }): Promise<CrmDealAttachment> {
  await databaseReady
 const result = await db.prepare('INSERT INTO crm_deal_attachments (deal_id, name, pathname, size, content_type) VALUES (?, ?, ?, ?, ?)').run(input.dealId, input.name, input.pathname, input.size, input.contentType); await db.prepare('UPDATE crm_deals SET updated_at=CURRENT_TIMESTAMP WHERE id=?').run(input.dealId); return mapCrmDealAttachment(await db.prepare('SELECT * FROM crm_deal_attachments WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function deleteCrmDealAttachment(id: number): Promise<boolean> {
  await databaseReady
 return (await db.prepare('DELETE FROM crm_deal_attachments WHERE id=?').run(id)).changes > 0 }


function mapUser(row: Record<string, unknown>): User { return { id: row.id as number, name: row.name as string, email: row.email as string, createdAt: row.created_at as string } }
export async function createUser(name: string, email: string, passwordHash: string): Promise<User> {
  await databaseReady
 const result = await db.prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)').run(name.trim(), email.trim().toLowerCase(), passwordHash); return mapUser(await db.prepare('SELECT * FROM users WHERE id=?').get(result.lastInsertRowid) as Record<string, unknown>) }
export async function getUserByEmail(email: string): Promise<(User & { passwordHash: string }) | null> {
  await databaseReady
 const row = await db.prepare('SELECT * FROM users WHERE email=?').get(email.trim().toLowerCase()) as Record<string, unknown> | undefined; return row ? { ...mapUser(row), passwordHash: row.password_hash as string } : null }
export async function getUserById(id: number): Promise<User | null> {
  await databaseReady
 const row = await db.prepare('SELECT * FROM users WHERE id=?').get(id) as Record<string, unknown> | undefined; return row ? mapUser(row) : null }
export async function updateUserPassword(id: number, passwordHash: string): Promise<boolean> {
  await databaseReady
 return (await db.prepare('UPDATE users SET password_hash=? WHERE id=?').run(passwordHash, id)).changes > 0 }
export async function createPasswordResetToken(userId: number, token: string, expiresAt: string): Promise<PasswordResetToken> {
  await databaseReady
 await db.prepare('DELETE FROM password_reset_tokens WHERE user_id=?').run(userId); const result = await db.prepare('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)').run(userId, token, expiresAt); return { id: result.lastInsertRowid as number, userId, token, expiresAt, createdAt: new Date().toISOString() } }
export async function getPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
  await databaseReady
 const row = await db.prepare('SELECT * FROM password_reset_tokens WHERE token=?').get(token) as Record<string, unknown> | undefined; if (!row) return null; if (new Date(row.expires_at as string) < new Date()) { await db.prepare('DELETE FROM password_reset_tokens WHERE id=?').run(row.id); return null } return { id: row.id as number, userId: row.user_id as number, token: row.token as string, expiresAt: row.expires_at as string, createdAt: row.created_at as string } }
export async function deletePasswordResetToken(token: string): Promise<boolean> {
  await databaseReady
 return (await db.prepare('DELETE FROM password_reset_tokens WHERE token=?').run(token)).changes > 0 }

export { db }
