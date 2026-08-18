import { NextResponse } from 'next/server'
import { getOrCreateBudget, updateBudget } from '@/lib/db'

export async function GET(req: Request) { const boardId = Number(new URL(req.url).searchParams.get('boardId')); if (!boardId) return NextResponse.json({ error: 'boardId required' }, { status: 400 }); const budget = getOrCreateBudget(boardId); return NextResponse.json({ data: budget }) }

export async function PATCH(req: Request) { const { boardId, ...input } = await req.json(); if (!boardId) return NextResponse.json({ error: 'boardId required' }, { status: 400 }); const budget = updateBudget(boardId, input); return NextResponse.json({ data: budget }) }
