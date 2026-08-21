import { container } from '@/lib/infrastructure/di/container'
import type { Task, Client, Contact, CrmStage, CrmDeal, Milestone } from '@/lib/db'

function serializeTask(t: unknown): Task {
  const e = t as Record<string, unknown>
  return {
    id: e.id as number,
    title: e.title as string,
    description: e.description as string,
    status: e.status as Task['status'],
    priority: e.priority as Task['priority'],
    assignee: e.assignee as string,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : (e.createdAt as string),
    boardId: e.boardId as number | undefined,
    position: e.position as number,
    milestoneId: (e.milestoneId as number | null) ?? null,
    startDate: (e.startDate as string | null) ?? null,
    dueDate: (e.dueDate as string | null) ?? null,
    labels: (e.labels as string[]) ?? [],
  }
}

function serializeClient(c: unknown): Client {
  const e = c as Record<string, unknown>
  return {
    id: e.id as number,
    name: e.name as string,
    email: e.email as string,
    company: e.company as string,
    archived: e.archived as boolean,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : (e.createdAt as string),
  }
}

function serializeContact(c: unknown): Contact {
  const e = c as Record<string, unknown>
  return {
    id: e.id as number,
    name: e.name as string,
    email: e.email as string,
    phone: e.phone as string,
    company: e.company as string,
    position: e.position as string,
    address: e.address as string,
    website: e.website as string,
    notes: e.notes as string,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : (e.createdAt as string),
  }
}

function serializeCrmStage(s: unknown): CrmStage {
  const e = s as Record<string, unknown>
  return {
    id: e.id as number,
    name: e.name as string,
    color: e.color as string,
    position: e.position as number,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : (e.createdAt as string),
  }
}

function serializeCrmDeal(d: unknown): CrmDeal {
  const e = d as Record<string, unknown>
  return {
    id: e.id as number,
    contactId: e.contactId as number,
    stageId: e.stageId as number,
    budgetAmount: e.budgetAmount as number,
    notes: e.notes as string,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : (e.createdAt as string),
    updatedAt: e.updatedAt instanceof Date ? e.updatedAt.toISOString() : (e.updatedAt as string),
  }
}

function serializeMilestone(m: unknown): Milestone {
  const e = m as Record<string, unknown>
  return {
    id: e.id as number,
    name: e.name as string,
    color: e.color as string,
    clientId: e.clientId as number,
    archived: e.archived as boolean,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : (e.createdAt as string),
  }
}

export interface DashboardData {
  tasks: Task[]
  clients: Client[]
  contacts: Contact[]
  crmStages: CrmStage[]
  crmDeals: CrmDeal[]
  milestones: Milestone[]
}

export async function fetchDashboardData(): Promise<DashboardData> {
  const [tasks, clients, contacts, crmStages, crmDeals, milestones] = await Promise.all([
    container.taskService.findAll(),
    container.clientService.findAll(),
    container.crmService.getAllContacts(),
    container.crmService.getStages(),
    container.crmService.getStagesWithDeals().then(stages => stages.flatMap(s => s.deals)),
    container.milestoneRepo.findByClientId(0),
  ])

  return {
    tasks: tasks.map(serializeTask),
    clients: clients.map(serializeClient),
    contacts: contacts.map(serializeContact),
    crmStages: crmStages.map(serializeCrmStage),
    crmDeals: crmDeals.map(serializeCrmDeal),
    milestones: milestones.map(serializeMilestone),
  }
}

export async function fetchClients() {
  return container.clientService.findAll()
}

export async function fetchSpacesByClient(clientId: number) {
  return container.spaceService.findByClientId(clientId)
}

export async function fetchBoardsBySpace(spaceId: number) {
  return container.boardService.findBySpaceId(spaceId)
}

export async function fetchMilestonesByClient(clientId: number) {
  return container.milestoneRepo.findByClientId(clientId)
}
