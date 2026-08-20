import { NextResponse } from 'next/server'
import { updateMilestone, deleteMilestone, archiveMilestone, unarchiveMilestone } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const input = await req.json()
  if (input.archived === true) {
    const result = await archiveMilestone(Number(id))
    if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data: result })
  }
  if (input.archived === false) {
    const result = await unarchiveMilestone(Number(id))
    if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 })
    return NextResponse.json({ data: result })
  }
  const result = await updateMilestone(Number(id), input)
  if (!result) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ data: result })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ok = await deleteMilestone(Number(id))
  if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 })
  return NextResponse.json({ ok: true })
}
