export type TaskStatus = string
export type TaskPriority = 'low' | 'medium' | 'high'
export type BoardPaymentStatus = 'pendiente' | 'pagado' | 'cancelado'
export type BudgetItemType = 'task' | 'document' | 'image' | 'other'
export type SpaceSecretType = 'password' | 'config' | 'key' | 'token' | 'other'
export type CrmInteractionType = 'presupuesto' | 'respuesta' | 'videollamada'

export type Client = { id: number; name: string; email: string; company: string; archived: boolean; createdAt: string }
export type Space = { id: number; name: string; color: string; createdAt: string; clientId: number; secretPassword: string | null }
export type SpaceSecret = { id: number; spaceId: number; name: string; value: string; type: SpaceSecretType; notes: string; createdAt: string }
export type Board = { id: number; name: string; type: string; spaceId: number; paymentStatus: BoardPaymentStatus; archived: boolean; createdAt: string }
export type BoardList = { id: number; boardId: number; name: string; color: string; position: number; createdAt: string }
export type Attachment = { id: number; taskId: number; name: string; pathname: string; size: number; contentType: string; createdAt: string }
export type Task = { id: number; title: string; description: string; status: TaskStatus; priority: TaskPriority; assignee: string; startDate: string | null; dueDate: string | null; labels: string[]; createdAt: string; boardId?: number; position: number; milestoneId: number | null }
export type Milestone = { id: number; name: string; color: string; clientId: number; archived: boolean; createdAt: string }
export type BoardBudget = { id: number; boardId: number; estimatedTotal: number; actualTotal: number; notes: string; taxRate: number; bankName: string; accountHolder: string; accountNumber: string; clabe: string; clientName: string; projectName: string; projectDate: string; createdAt: string }
export type BudgetPayment = { id: number; budgetId: number; amount: number; description: string; date: string; createdAt: string }
export type BudgetItem = { id: number; budgetId: number; type: BudgetItemType; description: string; amount: number; fileName: string | null; filePath: string | null; createdAt: string }
export type Comment = { id: number; taskId: number; author: string; content: string; createdAt: string }
export type Checklist = { id: number; taskId: number; title: string; position: number; createdAt: string }
export type ChecklistItem = { id: number; checklistId: number; title: string; description: string; dueDate: string | null; checked: boolean; position: number; createdAt: string }
export type Contact = { id: number; name: string; email: string; phone: string; company: string; position: string; address: string; website: string; notes: string; createdAt: string }
export type CrmStage = { id: number; name: string; color: string; position: number; createdAt: string }
export type CrmDeal = { id: number; contactId: number; stageId: number; budgetAmount: number; notes: string; createdAt: string; updatedAt: string }
export type CrmInteraction = { id: number; dealId: number; type: CrmInteractionType; description: string; date: string; createdAt: string }
export type CrmDealComment = { id: number; dealId: number; author: string; content: string; createdAt: string }
export type CrmDealAttachment = { id: number; dealId: number; name: string; pathname: string; size: number; contentType: string; createdAt: string }
export type User = { id: number; name: string; email: string; createdAt: string }
export type PasswordResetToken = { id: number; userId: number; token: string; expiresAt: string; createdAt: string }

export type CreateTaskInput = { title: string; description?: string; status?: TaskStatus; priority?: TaskPriority; assignee?: string; boardId?: number; position?: number; milestoneId?: number | null; startDate?: string | null; dueDate?: string | null; labels?: string[] }
export type UpdateTaskInput = Partial<CreateTaskInput>

export type CreateBoardInput = { name: string; type?: string; spaceId: number; paymentStatus?: BoardPaymentStatus }
export type UpdateBoardInput = Partial<CreateBoardInput>

export type CreateClientInput = { name: string; email?: string; company?: string }
export type UpdateClientInput = Partial<CreateClientInput>

export type CreateSpaceInput = { name: string; color?: string; clientId?: number }
export type UpdateSpaceInput = Partial<CreateSpaceInput>

export type CreateContactInput = { name: string; email?: string; phone?: string; company?: string; position?: string; address?: string; website?: string; notes?: string }
export type UpdateContactInput = Partial<CreateContactInput>

export type CreateMilestoneInput = { name: string; color?: string; clientId: number }
export type UpdateMilestoneInput = Partial<CreateMilestoneInput>

export type CreateBudgetItemInput = { budgetId: number; type?: BudgetItemType; description: string; amount?: number }
export type UpdateBudgetItemInput = Partial<Omit<CreateBudgetItemInput, 'budgetId'>>

export type CreateBudgetPaymentInput = { budgetId: number; amount: number; description?: string; date?: string }

export type UpdateBudgetInput = { estimatedTotal?: number; actualTotal?: number; notes?: string; taxRate?: number; bankName?: string; accountHolder?: string; accountNumber?: string; clabe?: string; clientName?: string; projectName?: string; projectDate?: string }

export type CreateCrmStageInput = { name: string; color?: string; position?: number }
export type CreateCrmDealInput = { contactId: number; stageId: number; budgetAmount?: number; notes?: string }
export type CreateCrmInteractionInput = { dealId: number; type: CrmInteractionType; description?: string; date: string }

export type CreateCommentInput = { taskId: number; author?: string; content: string }
export type CreateChecklistInput = { taskId: number; title: string }
export type UpdateChecklistInput = { title: string }
export type CreateChecklistItemInput = { checklistId: number; title: string }
export type UpdateChecklistItemInput = { title?: string; description?: string; dueDate?: string | null; checked?: boolean }
