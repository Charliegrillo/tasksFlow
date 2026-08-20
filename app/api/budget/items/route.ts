import { NextResponse } from 'next/server'
import { listBudgetItems, addBudgetItem } from '@/lib/db'

export async function GET(req: Request) { const budgetId = Number(new URL(req.url).searchParams.get('budgetId')); if (!budgetId) return NextResponse.json({ error: 'budgetId required' }, { status: 400 }); return NextResponse.json({ data: await listBudgetItems(budgetId) }) }

export async function POST(req: Request) { const { budgetId, ...input } = await req.json(); if (!budgetId || !input.description) return NextResponse.json({ error: 'budgetId and description required' }, { status: 400 }); return NextResponse.json({ data: await addBudgetItem(budgetId, input) }, { status: 201 }) }
