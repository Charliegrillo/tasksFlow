import { NextResponse } from 'next/server'
import { listCrmStages, createCrmStage, reorderCrmStages } from '@/lib/db'

export async function GET() {
  return NextResponse.json({ data: await listCrmStages() })
}

export async function POST(req: Request) {
  const body = await req.json()
  if (!body.name?.trim()) return NextResponse.json({ error: 'Nombre es requerido' }, { status: 400 })
  return NextResponse.json({ data: await createCrmStage(body.name, body.color ?? 'bg-violet-500') }, { status: 201 })
}

export async function PATCH(req: Request) {
  const body = await req.json()
  if (typeof body.id === 'number' && typeof body.position === 'number') {
    const data = await reorderCrmStages(body.id, body.position)
    return NextResponse.json({ data })
  }
  return NextResponse.json({ error: 'id y position requeridos' }, { status: 400 })
}
