# Plan de Refactorización: TasksFlow → Clean Architecture

## Estado Actual

| Aspecto | Situación |
|---------|-----------|
| `lib/db.ts` | 610 líneas, 28 tipos, ~50 funciones CRUD, todo en un archivo |
| `kanban-board.tsx` | ~500+ líneas, 90+ useState, toda la lógica de negocio en un componente |
| Componentes | Planos en `components/`, sin subdirectorios |
| API Routes | Thin wrappers que llaman directamente a `db.ts` |
| Server Components | Ninguno — todo es `'use client'` |
| Tests | Cero archivos de test |
| State Management | Todo en useState local, sin gestión centralizada |

---

## Arquitectura Objetivo

```
src/
├── app/                          # Next.js App Router (solo layout + pages)
│   ├── layout.tsx
│   ├── page.tsx
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── api/                      # API routes (thin controllers)
│   │   ├── auth/
│   │   ├── tasks/
│   │   ├── boards/
│   │   └── ...
│   └── (dashboard)/
│       ├── layout.tsx            # Dashboard layout con sidebar
│       ├── page.tsx              # Vista principal (boards)
│       ├── contacts/page.tsx
│       ├── crm/page.tsx
│       └── invoices/page.tsx
│
├── lib/                          # Core business logic
│   ├── domain/                   # Entidades y Value Objects
│   │   ├── entities/
│   │   │   ├── task.ts
│   │   │   ├── board.ts
│   │   │   ├── client.ts
│   │   │   ├── space.ts
│   │   │   ├── budget.ts
│   │   │   ├── contact.ts
│   │   │   ├── crm.ts
│   │   │   └── index.ts
│   │   └── value-objects/
│   │       ├── money.ts
│   │       ├── email.ts
│   │       └── dates.ts
│   │
│   ├── repositories/             # Interfaces (contracts)
│   │   ├── task-repository.ts
│   │   ├── board-repository.ts
│   │   ├── client-repository.ts
│   │   ├── space-repository.ts
│   │   ├── budget-repository.ts
│   │   ├── contact-repository.ts
│   │   ├── crm-repository.ts
│   │   └── index.ts
│   │
│   ├── services/                 # Business logic (use cases)
│   │   ├── task-service.ts
│   │   ├── board-service.ts
│   │   ├── client-service.ts
│   │   ├── budget-service.ts
│   │   ├── invoice-service.ts
│   │   ├── crm-service.ts
│   │   └── index.ts
│   │
│   └── infrastructure/           # Implementations concretas
│       ├── database/
│       │   ├── connection.ts     # Configuración de DB
│       │   ├── schema.ts         # CREATE TABLE statements
│       │   ├── seed.ts           # Datos de seeding
│       │   └── mappers.ts        # Row → Entity mappers
│       └── repositories/
│           ├── task-repository.ts
│           ├── board-repository.ts
│           ├── client-repository.ts
│           ├── space-repository.ts
│           ├── budget-repository.ts
│           ├── contact-repository.ts
│           └── crm-repository.ts
│
├── hooks/                        # Custom React hooks
│   ├── use-tasks.ts
│   ├── use-boards.ts
│   ├── use-clients.ts
│   ├── use-budget.ts
│   ├── use-crm.ts
│   └── use-sidebar.ts
│
├── stores/                       # State management (Zustand)
│   ├── task-store.ts
│   ├── board-store.ts
│   ├── ui-store.ts              # Sidebar, modales, etc.
│   └── index.ts
│
├── components/
│   ├── ui/                       # Primitivas base (shadcn)
│   ├── layout/                   # Layout components
│   │   ├── sidebar/
│   │   │   ├── sidebar.tsx
│   │   │   ├── sidebar-tabs.tsx
│   │   │   ├── client-section.tsx
│   │   │   ├── space-section.tsx
│   │   │   └── board-section.tsx
│   │   ├── header.tsx
│   │   └── dashboard-layout.tsx
│   ├── features/                 # Feature-specific components
│   │   ├── task/
│   │   │   ├── task-card.tsx
│   │   │   ├── task-detail-modal.tsx
│   │   │   ├── task-filters.tsx
│   │   │   ├── checklist-section.tsx
│   │   │   └── comments-section.tsx
│   │   ├── board/
│   │   │   ├── kanban-board.tsx
│   │   │   ├── board-column.tsx
│   │   │   └── board-header.tsx
│   │   ├── budget/
│   │   │   ├── budget-panel.tsx
│   │   │   ├── budget-items-table.tsx
│   │   │   └── payments-manager.tsx
│   │   ├── crm/
│   │   │   ├── crm-board.tsx
│   │   │   ├── deal-card.tsx
│   │   │   └── pipeline-view.tsx
│   │   ├── contacts/
│   │   │   ├── contact-panel.tsx
│   │   │   └── contact-card.tsx
│   │   └── invoices/
│   │       └── client-invoice-view.tsx
│   └── shared/                   # Componentes reutilizables
│       ├── confirm-dialog.tsx
│       ├── search-input.tsx
│       └── empty-state.tsx
│
└── types/                        # Shared TypeScript types
    └── index.ts
```

---

## Fases de Refactorización

### Fase 1: Preparación (Sin romper nada)
**Prioridad: ALTA | Dependencia: Ninguna**

| # | Actividad | Archivos | Descripción |
|---|-----------|----------|-------------|
| 1.1 | Renombrar `proxy.ts` → `middleware.ts` | `proxy.ts` → `middleware.ts` | El auth guard no funciona porque Next.js espera `middleware.ts` |
| 1.2 | Agregar Zod para validación | `package.json` | Instalar `zod` y crear schemas de validación |
| 1.3 | Crear tipos compartidos | `lib/types.ts` | Extraer los 28 tipos de `db.ts` a un archivo separado |
| 1.4 | Agregar ESLint + Prettier | `package.json`, `.eslintrc`, `.prettierrc` | Estándar de código |
| 1.5 | Agregar scripts de build | `package.json` | `typecheck`, `lint`, `format` |

---

### Fase 2: Domain Layer (Entidades puras)
**Prioridad: ALTA | Dependencia: Fase 1.3**

| # | Actividad | Archivos | Descripción |
|---|-----------|----------|-------------|
| 2.1 | Crear Value Objects | `lib/domain/value-objects/money.ts`, `email.ts`, `dates.ts` | Objetos de valor reutilizables con validación |
| 2.2 | Crear entidades de dominio | `lib/domain/entities/*.ts` | Entidades puras sin dependencia de DB |
| 2.3 | Crear interfaces de repositorio | `lib/repositories/*.ts` | Contratos para cada dominio |
| 2.4 | Test unitarios de dominio | `__tests__/domain/*.test.ts` | Validar lógica de negocio pura |

**Ejemplo - Entidad Task:**
```typescript
// lib/domain/entities/task.ts
export class Task {
  constructor(
    public readonly id: number,
    public title: string,
    public description: string,
    public status: TaskStatus,
    public priority: TaskPriority,
    public assignee: string,
    public readonly createdAt: Date,
    public boardId?: number,
    public position: number = 0,
    public milestoneId?: number | null,
    public startDate?: Date | null,
    public dueDate?: Date | null,
    public labels: string[] = []
  ) {}

  get isOverdue(): boolean {
    return this.dueDate ? this.dueDate < new Date() && this.status !== 'done' : false
  }

  get isDone(): boolean {
    return this.status === 'done'
  }

  changeStatus(newStatus: TaskStatus): void {
    this.status = newStatus
  }

  reorder(newPosition: number): void {
    this.position = newPosition
  }
}
```

**Ejemplo - Value Object Money:**
```typescript
// lib/domain/value-objects/money.ts
export class Money {
  constructor(public readonly amount: number, public readonly currency: string = 'MXN') {
    if (amount < 0) throw new Error('Amount cannot be negative')
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch')
    return new Money(this.amount + other.amount, this.currency)
  }

  subtract(other: Money): Money {
    if (this.currency !== other.currency) throw new Error('Currency mismatch')
    return new Money(this.amount - other.amount, this.currency)
  }

  format(): string {
    return `$${this.amount.toLocaleString()}`
  }
}
```

**Ejemplo - Interfaz Repository:**
```typescript
// lib/repositories/task-repository.ts
export interface ITaskRepository {
  findById(id: number): Promise<Task | null>
  findByBoardId(boardId: number): Promise<Task[]>
  create(task: CreateTaskDTO): Promise<Task>
  update(id: number, data: Partial<Task>): Promise<Task | null>
  delete(id: number): Promise<boolean>
  reorder(id: number, newPosition: number): Promise<void>
  bulkUpdate(tasks: { id: number; position: number; status: string }[]): Promise<void>
}
```

---

### Fase 3: Infrastructure Layer (Repositorios)
**Prioridad: ALTA | Dependencia: Fase 2**

| # | Actividad | Archivos | Descripción |
|---|-----------|----------|-------------|
| 3.1 | Crear conexión DB | `lib/infrastructure/database/connection.ts` | Mover lógica de conexión de `db.ts` |
| 3.2 | Crear schema | `lib/infrastructure/database/schema.ts` | Mover CREATE TABLE statements |
| 3.3 | Crear seed | `lib/infrastructure/database/seed.ts` | Mover datos de seeding (120 contactos) |
| 3.4 | Crear mappers | `lib/infrastructure/database/mappers.ts` | Mappers snake_case → camelCase |
| 3.5 | Implementar TaskRepository | `lib/infrastructure/repositories/task-repository.ts` | Implementación concreta |
| 3.6 | Implementar BoardRepository | `lib/infrastructure/repositories/board-repository.ts` | |
| 3.7 | Implementar ClientRepository | `lib/infrastructure/repositories/client-repository.ts` | |
| 3.8 | Implementar SpaceRepository | `lib/infrastructure/repositories/space-repository.ts` | |
| 3.9 | Implementar BudgetRepository | `lib/infrastructure/repositories/budget-repository.ts` | |
| 3.10 | Implementar ContactRepository | `lib/infrastructure/repositories/contact-repository.ts` | |
| 3.11 | Implementar CrmRepository | `lib/infrastructure/repositories/crm-repository.ts` | |

**Ejemplo - TaskRepository:**
```typescript
// lib/infrastructure/repositories/task-repository.ts
import { db } from '../database/connection'
import { Task } from '@/lib/domain/entities/task'
import { ITaskRepository } from '@/lib/repositories/task-repository'
import { mapTask } from '../database/mappers'

export class TaskRepository implements ITaskRepository {
  async findById(id: number): Promise<Task | null> {
    const row = await db.prepare('SELECT * FROM tasks WHERE id=?').get(id)
    return row ? mapTask(row) : null
  }

  async findByBoardId(boardId: number): Promise<Task[]> {
    const rows = await db.prepare('SELECT * FROM tasks WHERE board_id=? ORDER BY position ASC').all(boardId)
    return rows.map(mapTask)
  }

  async create(data: CreateTaskDTO): Promise<Task> {
    const result = await db.prepare(
      'INSERT INTO tasks (title, description, status, priority, assignee, board_id, position, milestone_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(data.title, data.description, data.status, data.priority, data.assignee, data.boardId, data.position, data.milestoneId)
    
    return this.findById(result.lastInsertRowid as number) as Promise<Task>
  }

  // ... resto de implementaciones
}
```

---

### Fase 4: Service Layer (Lógica de negocio)
**Prioridad: MEDIA | Dependencia: Fase 3**

| # | Actividad | Archivos | Descripción |
|---|-----------|----------|-------------|
| 4.1 | TaskService | `lib/services/task-service.ts` | Crear, actualizar, eliminar, reordenar tareas |
| 4.2 | BoardService | `lib/services/board-service.ts` | CRUD tableros, archivar |
| 4.3 | ClientService | `lib/services/client-service.ts` | CRUD clientes, archivar |
| 4.4 | BudgetService | `lib/services/budget-service.ts` | Gestión de presupuesto, items, pagos |
| 4.5 | InvoiceService | `lib/services/invoice-service.ts` | Generación de facturas por cliente |
| 4.6 | CrmService | `lib/services/crm-service.ts` | Pipeline CRM, deals, interacciones |
| 4.7 | AuthService | `lib/services/auth-service.ts` | Login, registro, sesiones |

**Ejemplo - BudgetService:**
```typescript
// lib/services/budget-service.ts
export class BudgetService {
  constructor(
    private budgetRepo: IBudgetRepository,
    private itemRepo: IBudgetItemRepository,
    private paymentRepo: IBudgetPaymentRepository
  ) {}

  async getBudgetWithDetails(boardId: number): Promise<BudgetWithDetails> {
    const budget = await this.budgetRepo.findByBoardId(boardId)
    if (!budget) throw new Error('Budget not found')

    const [items, payments] = await Promise.all([
      this.itemRepo.findByBudgetId(budget.id),
      this.paymentRepo.findByBudgetId(budget.id)
    ])

    const subtotal = items.reduce((sum, item) => sum + item.amount, 0)
    const taxes = subtotal * (budget.taxRate / 100)
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
    const balance = Math.max(subtotal + taxes - totalPaid, 0)

    return { budget, items, payments, subtotal, taxes, totalPaid, balance }
  }

  async addPayment(budgetId: number, amount: number, description: string): Promise<BudgetPayment> {
    if (amount <= 0) throw new Error('Payment amount must be positive')
    
    const payment = await this.paymentRepo.create({ budgetId, amount, description })
    
    // Actualizar total pagado en budget
    const budget = await this.budgetRepo.findById(budgetId)
    if (budget) {
      const payments = await this.paymentRepo.findByBudgetId(budgetId)
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0)
      await this.budgetRepo.update(budgetId, { actualTotal: totalPaid })
    }

    return payment
  }
}
```

---

### Fase 5: API Routes (Thin Controllers)
**Prioridad: MEDIA | Dependencia: Fase 4**

| # | Actividad | Archivos | Descripción |
|---|-----------|----------|-------------|
| 5.1 | Crear DI container | `lib/infrastructure/di/container.ts` | Dependency Injection setup |
| 5.2 | Refactorizar auth routes | `app/api/auth/*/route.ts` | Usar AuthService |
| 5.3 | Refactorizar task routes | `app/api/tasks/*/route.ts` | Usar TaskService |
| 5.4 | Refactorizar board routes | `app/api/boards/*/route.ts` | Usar BoardService |
| 5.5 | Refactorizar budget routes | `app/api/budget/*/route.ts` | Usar BudgetService |
| 5.6 | Refactorizar CRM routes | `app/api/crm/*/route.ts` | Usar CrmService |
| 5.7 | Agregar middleware de auth | `middleware.ts` | Proteger rutas API |

**Ejemplo - API Route refactorizada:**
```typescript
// app/api/tasks/route.ts
import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'
import { CreateTaskSchema } from '@/lib/domain/schemas/task'

export async function GET(req: Request) {
  const boardId = Number(new URL(req.url).searchParams.get('boardId'))
  if (!boardId) return NextResponse.json({ error: 'boardId required' }, { status: 400 })

  const tasks = await container.taskService.findByBoardId(boardId)
  return NextResponse.json({ data: tasks })
}

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = CreateTaskSchema.safeParse(body)
  
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 })
  }

  const task = await container.taskService.create(parsed.data)
  return NextResponse.json({ data: task }, { status: 201 })
}
```

---

### Fase 6: State Management (Zustand)
**Prioridad: MEDIA | Dependencia: Fase 4**

| # | Actividad | Archivos | Descripción |
|---|-----------|----------|-------------|
| 6.1 | Instalar Zustand | `package.json` | State management library |
| 6.2 | Crear task store | `stores/task-store.ts` | Estado global de tareas |
| 6.3 | Crear board store | `stores/board-store.ts` | Estado de tableros |
| 6.4 | Crear UI store | `stores/ui-store.ts` | Sidebar, modales, loading states |
| 6.5 | Crear custom hooks | `hooks/*.ts` | Hooks que usan los stores |

**Ejemplo - Task Store:**
```typescript
// stores/task-store.ts
import { create } from 'zustand'
import { Task } from '@/lib/domain/entities/task'

interface TaskState {
  tasks: Task[]
  loading: boolean
  error: string | null
  
  fetchTasks: (boardId: number) => Promise<void>
  addTask: (task: CreateTaskDTO) => Promise<void>
  updateTask: (id: number, data: Partial<Task>) => Promise<void>
  deleteTask: (id: number) => Promise<void>
  moveTask: (taskId: number, newStatus: string, newPosition: number) => Promise<void>
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (boardId) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch(`/api/tasks?boardId=${boardId}`)
      const { data } = await res.json()
      set({ tasks: data, loading: false })
    } catch (error) {
      set({ error: 'Failed to fetch tasks', loading: false })
    }
  },

  addTask: async (taskData) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(taskData)
    })
    const { data } = await res.json()
    set(state => ({ tasks: [...state.tasks, data] }))
  },

  moveTask: async (taskId, newStatus, newPosition) => {
    // Optimistic update
    set(state => ({
      tasks: state.tasks.map(t => 
        t.id === taskId ? { ...t, status: newStatus, position: newPosition } : t
      )
    }))

    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, position: newPosition })
      })
    } catch {
      // Rollback on error
      get().fetchTasks(/* boardId */)
    }
  }
}))
```

---

### Fase 7: Componentes Modulares
**Prioridad: BAJA | Dependencia: Fase 6**

| # | Actividad | Archivos | Descripción |
|---|-----------|----------|-------------|
| 7.1 | Crear dashboard layout | `app/(dashboard)/layout.tsx` | Layout con sidebar |
| 7.2 | Refactorizar sidebar | `components/layout/sidebar/*.tsx` | Dividir en secciones |
| 7.3 | Refactorizar kanban board | `components/features/board/*.tsx` | Componentes modulares |
| 7.4 | Refactorizar task detail | `components/features/task/*.tsx` | Separar concerns |
| 7.5 | Refactorizar budget panel | `components/features/budget/*.tsx` | Componentes modulares |
| 7.6 | Refactorizar CRM | `components/features/crm/*.tsx` | Componentes modulares |
| 7.7 | Agregar React Error Boundaries | `components/shared/error-boundary.tsx` | Manejo de errores |
| 7.8 | Agregar Loading Skeletons | `components/shared/skeletons/*.tsx` | UX de carga |

**Ejemplo - Sidebar refactorizada:**
```typescript
// components/layout/sidebar/sidebar.tsx
export function Sidebar() {
  const { activeView, onSelectView } = useSidebar()
  const [sidebarTab, setSidebarTab] = useState<'tasks' | 'crm'>('tasks')

  return (
    <aside className="...">
      <SidebarHeader />
      <SidebarTabs activeTab={sidebarTab} onChange={setSidebarTab} />
      
      {sidebarTab === 'tasks' ? (
        <TasksSidebarContent />
      ) : (
        <CrmSidebarContent />
      )}

      <SidebarFooter />
    </aside>
  )
}

// components/layout/sidebar/client-section.tsx
export function ClientSection() {
  const { clients, activeClient, onSelectClient } = useClients()
  
  return (
    <section>
      <SectionHeader title="Clientes" count={clients.length} />
      {clients.map(client => (
        <ClientItem key={client.id} client={client} />
      ))}
    </section>
  )
}
```

---

### Fase 8: Server Components + Streaming
**Prioridad: BAJA | Dependencia: Fase 7**

| # | Actividad | Archivos | Descripción |
|---|-----------|----------|-------------|
| 8.1 | Convertir page.tsx a Server Component | `app/page.tsx` | Data fetching en servidor |
| 8.2 | Agregar Suspense boundaries | `app/(dashboard)/*.tsx` | Streaming de contenido |
| 8.3 | Server Actions para mutations | `app/api/actions/*.ts` | Mutaciones server-side |
| 8.4 | ISR/SSG para datos estáticos | `next.config.mjs` | Cache de datos |

---

### Fase 9: Testing
**Prioridad: BAJA | Dependencia: Fase 4**

| # | Actividad | Archivos | Descripción |
|---|-----------|----------|-------------|
| 9.1 | Instalar testing deps | `package.json` | Vitest, React Testing Library |
| 9.2 | Tests de dominio | `__tests__/domain/*.test.ts` | Entidades y value objects |
| 9.3 | Tests de servicios | `__tests__/services/*.test.ts` | Lógica de negocio |
| 9.4 | Tests de repositorios | `__tests__/repositories/*.test.ts` | CRUD con DB real |
| 9.5 | Tests de API routes | `__tests__/api/*.test.ts` | Endpoints |
| 9.6 | Tests de componentes | `__tests__/components/*.test.ts` | UI |

---

### Fase 10: Optimización y Seguridad
**Prioridad: BAJA | Dependencia: Fase 7**

| # | Actividad | Archivos | Descripción |
|---|-----------|----------|-------------|
| 10.1 | Eliminar `.env` del repo | `.gitignore` | Solo `.env.local` |
| 10.2 | Encriptar secrets | `lib/infrastructure/crypto.ts` | Encriptar space_secrets |
| 10.3 | Rate limiting | `lib/infrastructure/rate-limit.ts` | Protección DDoS |
| 10.4 | CSRF protection | `middleware.ts` | Tokens CSRF |
| 10.5 | Input validation | Zod schemas | Validación estricta |
| 10.6 | Error logging | `lib/infrastructure/logger.ts` | Sentry/LogRocket |

---

## Orden de Ejecución (Dependencies)

```
Fase 1 (Preparación)
    ↓
Fase 2 (Domain Layer)
    ↓
Fase 3 (Infrastructure Layer)
    ↓
Fase 4 (Service Layer) ←──┐
    ↓                       │
Fase 5 (API Routes)        │
    ↓                       │
Fase 6 (State Management)  │
    ↓                       │
Fase 7 (Componentes)       │
    ↓                       │
Fase 8 (Server Components) │
    ↓                       │
Fase 9 (Testing) ──────────┘
    ↓
Fase 10 (Optimización)
```

---

## Estimación de Tiempo

| Fase | Horas Est. | Prioridad |
|------|-----------|-----------|
| Fase 1: Preparación | 4-6h | ALTA |
| Fase 2: Domain Layer | 8-12h | ALTA |
| Fase 3: Infrastructure | 12-16h | ALTA |
| Fase 4: Services | 10-14h | ALTA |
| Fase 5: API Routes | 6-8h | MEDIA |
| Fase 6: State Management | 8-12h | MEDIA |
| Fase 7: Componentes | 12-16h | BAJA |
| Fase 8: Server Components | 6-8h | BAJA |
| Fase 9: Testing | 12-16h | BAJA |
| Fase 10: Optimización | 6-8h | BAJA |
| **TOTAL** | **84-116h** | |

---

## Reglas Durante la Refactorización

1. **No romper ejecución** — Cada fase debe mantener la app funcionando
2. **Migración incremental** — No refactorizar todo de golpe, una feature a la vez
3. **Tests antes de refactorizar** — Escribir tests de la funcionalidad actual antes de cambiar
4. **Feature flags** — Usar flags para activar/desactivar código nuevo
5. **No cambiar DB schema** — Mantener compatibilidad con datos existentes
6. **Commit frecuente** — Un commit por cada cambio pequeño verificado
7. **Verificar después de cada fase** — `npm run typecheck && npm run lint && npm run dev`

---

## Archivos a Eliminar (Al final de la refactorización)

- `lib/db.ts` → Reemplazado por repositories + services
- `kanban-board.tsx` monolítico → Reemplazado por componentes modulares + stores
- `proxy.ts` → Reemplazado por `middleware.ts` correcto

---

## Archivos a Mantener (Sin cambios)

- `app/layout.tsx` — Layout raíz
- `app/globals.css` — Estilos globales
- `components/ui/*` — Primitivas shadcn
- `public/*` — Assets estáticos
- `next.config.mjs` — Configuración Next.js
- `tailwind.config.ts` — Configuración Tailwind
