'use client'

import KanbanBoard from '@/components/kanban-board'

export default function MilestoneReportPage({ params }: { params: Promise<{ id: string }> }) {
  return <KanbanBoard milestoneId={params} />
}
