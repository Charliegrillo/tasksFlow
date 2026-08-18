import { NextResponse } from 'next/server'
import { createBoard, listBoards } from '@/lib/db'

export async function GET(request: Request) {
  const spaceId = Number(new URL(request.url).searchParams.get('spaceId'))
  if (!spaceId) return NextResponse.json({ error: 'spaceId requerido' }, { status: 400 })
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
