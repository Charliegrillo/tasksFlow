import { NextResponse } from 'next/server'
import { container } from '@/lib/infrastructure/di/container'

export async function GET(request: Request) {
  const boardId = Number(new URL(request.url).searchParams.get('boardId'))
  if (!boardId) return NextResponse.json({ error: 'boardId requerido' }, { status: 400 })
  return NextResponse.json({ data: await container.boardService.getLists(boardId) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const boardId = Number(body.boardId)
  const name = String(body.name ?? '').trim()
  if (!boardId || !name) return NextResponse.json({ error: 'boardId y name son requeridos' }, { status: 400 })
  return NextResponse.json({ data: await container.boardService.createList(boardId, name, body.color) }, { status: 201 })
}
