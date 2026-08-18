import { NextResponse } from 'next/server'
import { listMilestones, createMilestone } from '@/lib/db'

export async function GET(req: Request) { const clientId = Number(new URL(req.url).searchParams.get('clientId')); if (!clientId) return NextResponse.json({ error: 'clientId required' }, { status: 400 }); return NextResponse.json({ data: listMilestones(clientId) }) }

export async function POST(req: Request) { const { name, color, clientId } = await req.json(); if (!name || !clientId) return NextResponse.json({ error: 'name and clientId required' }, { status: 400 }); return NextResponse.json({ data: createMilestone(name, color ?? 'bg-violet-500', clientId) }, { status: 201 }) }
