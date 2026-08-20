import { z } from 'zod'

export const TaskPrioritySchema = z.enum(['low', 'medium', 'high'])
export const TaskStatusSchema = z.string()
export const BoardPaymentStatusSchema = z.enum(['pendiente', 'pagado', 'cancelado'])
export const BudgetItemTypeSchema = z.enum(['task', 'document', 'image', 'other'])
export const SpaceSecretTypeSchema = z.enum(['password', 'config', 'key', 'token', 'other'])
export const CrmInteractionTypeSchema = z.enum(['presupuesto', 'respuesta', 'videollamada'])

export const CreateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().default(''),
  status: TaskStatusSchema.default('backlog'),
  priority: TaskPrioritySchema.default('medium'),
  assignee: z.string().default('AM'),
  boardId: z.number().optional(),
  position: z.number().default(0),
  milestoneId: z.number().nullable().optional(),
  startDate: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  labels: z.array(z.string()).default([]),
})

export const UpdateTaskSchema = CreateTaskSchema.partial()

export const CreateBoardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.string().default('roadmap'),
  spaceId: z.number({ required_error: 'SpaceId is required' }),
  paymentStatus: BoardPaymentStatusSchema.default('pendiente'),
})

export const UpdateBoardSchema = CreateBoardSchema.partial()

export const CreateClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email().default(''),
  company: z.string().default(''),
})

export const UpdateClientSchema = CreateClientSchema.partial()

export const CreateSpaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().default('bg-violet-500'),
  clientId: z.number({ required_error: 'ClientId is required' }),
})

export const UpdateSpaceSchema = CreateSpaceSchema.partial()

export const CreateContactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().default(''),
  phone: z.string().default(''),
  company: z.string().default(''),
  position: z.string().default(''),
  address: z.string().default(''),
  website: z.string().default(''),
  notes: z.string().default(''),
})

export const UpdateContactSchema = CreateContactSchema.partial()

export const CreateMilestoneSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().default('bg-violet-500'),
  clientId: z.number({ required_error: 'ClientId is required' }),
})

export const UpdateMilestoneSchema = CreateMilestoneSchema.partial()

export const CreateBudgetItemSchema = z.object({
  budgetId: z.number({ required_error: 'BudgetId is required' }),
  type: BudgetItemTypeSchema.default('task'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0).default(0),
})

export const UpdateBudgetItemSchema = z.object({
  type: BudgetItemTypeSchema.optional(),
  description: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
})

export const CreateBudgetPaymentSchema = z.object({
  budgetId: z.number({ required_error: 'BudgetId is required' }),
  amount: z.number().positive('Amount must be positive'),
  description: z.string().default(''),
  date: z.string().optional(),
})

export const UpdateBudgetSchema = z.object({
  estimatedTotal: z.number().optional(),
  actualTotal: z.number().optional(),
  notes: z.string().optional(),
  taxRate: z.number().min(0).max(100).optional(),
  bankName: z.string().optional(),
  accountHolder: z.string().optional(),
  accountNumber: z.string().optional(),
  clabe: z.string().optional(),
  clientName: z.string().optional(),
  projectName: z.string().optional(),
  projectDate: z.string().optional(),
})

export const CreateCrmStageSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  color: z.string().default('bg-violet-500'),
  position: z.number().default(0),
})

export const CreateCrmDealSchema = z.object({
  contactId: z.number({ required_error: 'ContactId is required' }),
  stageId: z.number({ required_error: 'StageId is required' }),
  budgetAmount: z.number().min(0).default(0),
  notes: z.string().default(''),
})

export const CreateCrmInteractionSchema = z.object({
  dealId: z.number({ required_error: 'DealId is required' }),
  type: CrmInteractionTypeSchema,
  description: z.string().default(''),
  date: z.string(),
})

export const CreateCommentSchema = z.object({
  taskId: z.number({ required_error: 'TaskId is required' }),
  author: z.string().default('Usuario'),
  content: z.string().min(1, 'Content is required'),
})

export const CreateChecklistSchema = z.object({
  taskId: z.number({ required_error: 'TaskId is required' }),
  title: z.string().min(1, 'Title is required').max(200),
})

export const UpdateChecklistSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
})

export const CreateChecklistItemSchema = z.object({
  checklistId: z.number({ required_error: 'ChecklistId is required' }),
  title: z.string().min(1, 'Title is required').max(200),
})

export const UpdateChecklistItemSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  dueDate: z.string().nullable().optional(),
  checked: z.boolean().optional(),
})

export const LoginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export const RegisterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email'),
})

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})
