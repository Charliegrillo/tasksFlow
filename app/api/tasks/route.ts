import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'

export async function GET(request: Request) {
  const boardId = Number(new URL(request.url).searchParams.get('boardId'))
  if (boardId) return NextResponse.json({ data: await container.taskService.findByBoardId(boardId) })
  return NextResponse.json({ data: await container.taskService.findAll() })
}

export async function POST(request: Request) {
  const body = await request.json()
  if (!body.title?.trim()) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })
  return NextResponse.json({ data: await container.taskService.create(body) }, { status: 201 })
}
