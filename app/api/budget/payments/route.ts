import { NextResponse } from 'next/server'
import { listBudgetPayments, addBudgetPayment } from '@/lib/db'

export async function GET(req: Request) { const budgetId = Number(new URL(req.url).searchParams.get('budgetId')); if (!budgetId) return NextResponse.json({ error: 'budgetId required' }, { status: 400 }); return NextResponse.json({ data: await listBudgetPayments(budgetId) }) }

export async function POST(req: Request) { const { budgetId, ...input } = await req.json(); if (!budgetId || !input.amount) return NextResponse.json({ error: 'budgetId and amount required' }, { status: 400 }); return NextResponse.json({ data: await addBudgetPayment(budgetId, input) }, { status: 201 }) }
