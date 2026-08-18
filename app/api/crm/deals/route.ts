import { NextResponse } from 'next/server'
import { listCrmDeals, createCrmDeal } from '@/lib/db'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const stageId = url.searchParams.get('stageId')
  return NextResponse.json({ data: listCrmDeals(stageId ? Number(stageId) : undefined) })
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.contactId) return NextResponse.json({ error: 'contactId es requerido' }, { status: 400 })
  if (!body.stageId) return NextResponse.json({ error: 'stageId es requerido' }, { status: 400 })
  return NextResponse.json({ data: createCrmDeal(body.contactId, body.stageId, body.budgetAmount ?? 0) }, { status: 201 })
}
