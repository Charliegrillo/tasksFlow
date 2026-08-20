import { NextResponse } from 'next/server'
import { updateChecklistItem, deleteChecklistItem } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const body = await req.json(); const item = await updateChecklistItem(Number(id), body); if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 }); return NextResponse.json({ data: item }) }

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const ok = await deleteChecklistItem(Number(id)); if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 }); return NextResponse.json({ ok: true }) }
