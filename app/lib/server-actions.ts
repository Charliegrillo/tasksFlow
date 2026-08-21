'use server'

import { container } from '@/lib/infrastructure/di/container'
import { revalidatePath } from 'next/cache'

export async function createTaskAction(data: {
  title: string
  description?: string
  priority?: string
  boardId?: number
  milestoneId?: number
  status?: string
}) {
  const task = await container.taskService.create({
    title: data.title,
    description: data.description ?? '',
    priority: (data.priority as 'low' | 'medium' | 'high') ?? 'medium',
    boardId: data.boardId,
    milestoneId: data.milestoneId,
    status: (data.status as 'backlog' | 'progress' | 'review' | 'done') ?? 'backlog',
  })
  revalidatePath('/')
  return task
}

export async function updateTaskAction(id: number, data: {
  title?: string
  description?: string
  status?: string
  priority?: string
  milestoneId?: number | null
  startDate?: string | null
  dueDate?: string | null
}) {
  const task = await container.taskService.update(id, {
    ...data,
    status: data.status as 'backlog' | 'progress' | 'review' | 'done' | undefined,
    priority: data.priority as 'low' | 'medium' | 'high' | undefined,
  })
  revalidatePath('/')
  return task
}

export async function deleteTaskAction(id: number) {
  await container.taskService.delete(id)
  revalidatePath('/')
}

export async function moveTaskAction(id: number, newStatus: string, newPosition: number) {
  const task = await container.taskService.move(id, newStatus as 'backlog' | 'progress' | 'review' | 'done', newPosition)
  revalidatePath('/')
  return task
}

export async function createClientAction(data: { name: string; email: string; company: string }) {
  const client = await container.clientService.create(data)
  revalidatePath('/')
  return client
}

export async function updateClientAction(id: number, data: { name?: string; email?: string; company?: string }) {
  const client = await container.clientService.update(id, data)
  revalidatePath('/')
  return client
}

export async function deleteClientAction(id: number) {
  await container.clientService.delete(id)
  revalidatePath('/')
}

export async function createContactAction(data: { name: string; email?: string; phone?: string; company?: string; position?: string }) {
  const contact = await container.contactRepo.create(data)
  revalidatePath('/')
  return contact
}

export async function updateContactAction(id: number, data: { name?: string; email?: string; phone?: string; company?: string; position?: string }) {
  const contact = await container.contactRepo.update(id, data)
  revalidatePath('/')
  return contact
}

export async function deleteContactAction(id: number) {
  await container.contactRepo.delete(id)
  revalidatePath('/')
}

export async function createCrmStageAction(data: { name: string; color: string }) {
  const stage = await container.crmService.createStage(data)
  revalidatePath('/')
  return stage
}

export async function updateCrmStageAction(id: number, data: { name?: string; color?: string }) {
  const stage = await container.crmService.updateStage(id, data)
  revalidatePath('/')
  return stage
}

export async function deleteCrmStageAction(id: number) {
  await container.crmService.deleteStage(id)
  revalidatePath('/')
}

export async function createCrmDealAction(data: { contactId: number; stageId: number; budgetAmount?: number; notes?: string }) {
  const deal = await container.crmService.createDeal(data)
  revalidatePath('/')
  return deal
}

export async function updateCrmDealAction(id: number, data: { stageId?: number; budgetAmount?: number; notes?: string }) {
  const deal = await container.crmService.updateDeal(id, data)
  revalidatePath('/')
  return deal
}

export async function deleteCrmDealAction(id: number) {
  await container.crmService.deleteDeal(id)
  revalidatePath('/')
}
