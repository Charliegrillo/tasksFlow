import type { TaskStatus, TaskPriority, BoardPaymentStatus, BudgetItemType, SpaceSecretType, CrmInteractionType } from '@/lib/types'
import { Task } from '@/lib/domain/entities/task'
import { Board } from '@/lib/domain/entities/board'
import { Client } from '@/lib/domain/entities/client'
import { Space } from '@/lib/domain/entities/space'
import { SpaceSecret } from '@/lib/domain/entities/space-secret'
import { BoardBudget, BudgetItem, BudgetPayment } from '@/lib/domain/entities/budget'
import { Contact } from '@/lib/domain/entities/contact'
import { Milestone } from '@/lib/domain/entities/milestone'
import { Comment } from '@/lib/domain/entities/comment'
import { Checklist, ChecklistItem } from '@/lib/domain/entities/checklist'
import { BoardList, Attachment } from '@/lib/domain/entities/board-extras'
import { CrmStage, CrmDeal, CrmInteraction, CrmDealComment, CrmDealAttachment } from '@/lib/domain/entities/crm'
import { User, PasswordResetToken } from '@/lib/domain/entities/user'
import type { DbRow } from './connection'

export function mapTask(row: DbRow): Task {
  return new Task(
    row.id as number,
    row.title as string,
    row.description as string,
    row.status as TaskStatus,
    row.priority as TaskPriority,
    row.assignee as string,
    new Date(row.created_at as string),
    row.board_id as number,
    (row.position as number) ?? 0,
    row.milestone_id as number | null,
    row.start_date as string | null ?? null,
    row.due_date as string | null ?? null,
    JSON.parse((row.labels as string) ?? '[]')
  )
}

export function mapBoard(row: DbRow): Board {
  return new Board(
    row.id as number,
    row.name as string,
    row.type as string,
    row.space_id as number,
    (row.payment_status as BoardPaymentStatus) ?? 'pendiente',
    Boolean(row.archived),
    new Date(row.created_at as string)
  )
}

export function mapClient(row: DbRow): Client {
  return new Client(
    row.id as number,
    row.name as string,
    row.email as string,
    row.company as string,
    Boolean(row.archived),
    new Date(row.created_at as string)
  )
}

export function mapSpace(row: DbRow): Space {
  return new Space(
    row.id as number,
    row.name as string,
    row.color as string,
    new Date(row.created_at as string),
    row.client_id as number,
    (row.secret_password as string | null) ?? null
  )
}

export function mapSpaceSecret(row: DbRow): SpaceSecret {
  return new SpaceSecret(
    row.id as number,
    row.space_id as number,
    row.name as string,
    row.value as string,
    (row.type as SpaceSecretType) ?? 'other',
    row.notes as string,
    new Date(row.created_at as string)
  )
}

export function mapBoardList(row: DbRow): BoardList {
  return new BoardList(
    row.id as number,
    row.board_id as number,
    row.name as string,
    row.color as string,
    row.position as number,
    new Date(row.created_at as string)
  )
}

export function mapAttachment(row: DbRow): Attachment {
  return new Attachment(
    row.id as number,
    row.task_id as number,
    row.name as string,
    row.pathname as string,
    row.size as number,
    row.content_type as string,
    new Date(row.created_at as string)
  )
}

export function mapMilestone(row: DbRow): Milestone {
  return new Milestone(
    row.id as number,
    row.name as string,
    row.color as string,
    row.client_id as number,
    Boolean(row.archived),
    new Date(row.created_at as string)
  )
}

export function mapBudget(row: DbRow): BoardBudget {
  return new BoardBudget(
    row.id as number,
    row.board_id as number,
    row.estimated_total as number,
    row.actual_total as number,
    row.notes as string,
    row.tax_rate as number,
    row.bank_name as string,
    row.account_holder as string,
    row.account_number as string,
    row.clabe as string,
    row.client_name as string,
    row.project_name as string,
    row.project_date as string,
    new Date(row.created_at as string)
  )
}

export function mapBudgetItem(row: DbRow): BudgetItem {
  return new BudgetItem(
    row.id as number,
    row.budget_id as number,
    row.type as BudgetItemType,
    row.description as string,
    row.amount as number,
    row.file_name as string | null,
    row.file_path as string | null,
    new Date(row.created_at as string)
  )
}

export function mapBudgetPayment(row: DbRow): BudgetPayment {
  return new BudgetPayment(
    row.id as number,
    row.budget_id as number,
    row.amount as number,
    row.description as string,
    row.date as string,
    new Date(row.created_at as string)
  )
}

export function mapComment(row: DbRow): Comment {
  return new Comment(
    row.id as number,
    row.task_id as number,
    row.author as string,
    row.content as string,
    new Date(row.created_at as string)
  )
}

export function mapChecklist(row: DbRow): Checklist {
  return new Checklist(
    row.id as number,
    row.task_id as number,
    row.title as string,
    row.position as number,
    new Date(row.created_at as string)
  )
}

export function mapChecklistItem(row: DbRow): ChecklistItem {
  return new ChecklistItem(
    row.id as number,
    row.checklist_id as number,
    row.title as string,
    row.description as string,
    row.due_date as string | null,
    Boolean(row.checked),
    row.position as number,
    new Date(row.created_at as string)
  )
}

export function mapContact(row: DbRow): Contact {
  return new Contact(
    row.id as number,
    row.name as string,
    row.email as string,
    row.phone as string,
    row.company as string,
    row.position as string,
    row.address as string,
    row.website as string,
    row.notes as string,
    new Date(row.created_at as string)
  )
}

export function mapCrmStage(row: DbRow): CrmStage {
  return new CrmStage(
    row.id as number,
    row.name as string,
    row.color as string,
    row.position as number,
    new Date(row.created_at as string)
  )
}

export function mapCrmDeal(row: DbRow): CrmDeal {
  return new CrmDeal(
    row.id as number,
    row.contact_id as number,
    row.stage_id as number,
    row.budget_amount as number,
    (row.notes as string) ?? '',
    new Date(row.created_at as string),
    new Date(row.updated_at as string)
  )
}

export function mapCrmInteraction(row: DbRow): CrmInteraction {
  return new CrmInteraction(
    row.id as number,
    row.deal_id as number,
    row.type as CrmInteractionType,
    row.description as string,
    row.date as string,
    new Date(row.created_at as string)
  )
}

export function mapCrmDealComment(row: DbRow): CrmDealComment {
  return new CrmDealComment(
    row.id as number,
    row.deal_id as number,
    row.author as string,
    row.content as string,
    new Date(row.created_at as string)
  )
}

export function mapCrmDealAttachment(row: DbRow): CrmDealAttachment {
  return new CrmDealAttachment(
    row.id as number,
    row.deal_id as number,
    row.name as string,
    row.pathname as string,
    row.size as number,
    row.content_type as string,
    new Date(row.created_at as string)
  )
}

export function mapUser(row: DbRow): User {
  return new User(
    row.id as number,
    row.name as string,
    row.email as string,
    new Date(row.created_at as string)
  )
}
