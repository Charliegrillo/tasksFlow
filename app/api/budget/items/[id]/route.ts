import { NextResponse } from 'next/server'
import { deleteBudgetItem, updateBudgetItem } from '@/lib/db'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const input = await req.json(); const item = updateBudgetItem(Number(id), input); if (!item) return NextResponse.json({ error: 'not found' }, { status: 404 }); return NextResponse.json({ data: item }) }

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) { const { id } = await params; const ok = deleteBudgetItem(Number(id)); if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 }); return NextResponse.json({ ok: true }) }
