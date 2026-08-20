import { NextResponse } from 'next/server'
import { listCrmInteractions, createCrmInteraction } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const dealId = url.searchParams.get('dealId')
  if (!dealId) return NextResponse.json({ data: [] })
  return NextResponse.json({ data: await listCrmInteractions(Number(dealId)) })
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.dealId) return NextResponse.json({ error: 'dealId es requerido' }, { status: 400 })
  if (!body.type) return NextResponse.json({ error: 'type es requerido' }, { status: 400 })
  return NextResponse.json({ data: await createCrmInteraction(body.dealId, body.type, body.description ?? '', body.date ?? '') }, { status: 201 })
}
