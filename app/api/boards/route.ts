import { NextResponse } from 'next/server'
import { createBoard, listBoards, listArchivedBoards } from '@/lib/db'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const spaceId = Number(url.searchParams.get('spaceId'))
  const archived = url.searchParams.get('archived') === 'true'
  if (!spaceId) return NextResponse.json({ error: 'spaceId requerido' }, { status: 400 })
  if (archived) return NextResponse.json({ data: listArchivedBoards(spaceId) })
  return NextResponse.json({ data: listBoards(spaceId) })
}

export async function POST(request: Request) {
  const body = await request.json()
  const spaceId = Number(body.spaceId)
  const name = String(body.name ?? '').trim()
  const type = String(body.type ?? 'roadmap')
  if (!spaceId || !name) return NextResponse.json({ error: 'spaceId y name son requeridos' }, { status: 400 })
  return NextResponse.json({ data: createBoard(name, type, spaceId) }, { status: 201 })
}
