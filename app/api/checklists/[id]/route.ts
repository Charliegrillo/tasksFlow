import { NextResponse } from 'next/server'
import { updateChecklist, deleteChecklist } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const { title } = await req.json(); const checklist = updateChecklist(Number(id), title); if (!checklist) return NextResponse.json({ error: 'not found' }, { status: 404 }); return NextResponse.json({ data: checklist }) }

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const ok = deleteChecklist(Number(id)); if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 }); return NextResponse.json({ ok: true }) }
