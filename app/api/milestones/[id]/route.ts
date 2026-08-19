import { NextResponse } from 'next/server'
import { updateMilestone, deleteMilestone, archiveMilestone } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const input = await req.json()
  if (input.archived === true) {
    const result = archiveMilestone(Number(id))
    if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data: result })
  }
  const result = updateMilestone(Number(id), input)
  if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ data: result })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = deleteMilestone(Number(id))
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
