import { NextResponse } from 'next/server'
import { addChecklistItem } from '@/lib/db'

export async function POST(req: Request) { const { checklistId, title } = await req.json(); if (!checklistId || !title) return NextResponse.json({ error: 'checklistId and title required' }, { status: 400 }); return NextResponse.json({ data: addChecklistItem(checklistId, title) }, { status: 201 }) }
