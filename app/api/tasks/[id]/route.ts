import { NextResponse } from 'next/server'
import { deleteTask, reorderTask, updateTask } from '@/lib/db'

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await request.json()
  if (typeof body.position === 'number' && typeof body.status === 'string') {
    await reorderTask(Number(id), body.status, body.position)
    return NextResponse.json({ data: true })
  }
  const task = await updateTask(Number(id), body)
  return task ? NextResponse.json({ data: task }) : NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
}
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return await deleteTask(Number(id)) ? new NextResponse(null, { status: 204 }) : NextResponse.json({ error: 'Tarea no encontrada' }, { status: 404 })
}
