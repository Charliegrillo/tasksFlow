import { Suspense } from 'react'
import KanbanBoard from '@/components/kanban-board'
import { fetchDashboardData } from './lib/server-data'
import { BoardSkeleton } from '@/components/shared/loading-skeleton'

export default async function Page() {
  const data = await fetchDashboardData()

  return (
    <Suspense fallback={<BoardSkeleton />}>
      <KanbanBoard
        initialTasks={data.tasks}
        initialClients={data.clients}
        initialContacts={data.contacts}
        initialCrmStages={data.crmStages}
        initialCrmDeals={data.crmDeals}
        initialMilestones={data.milestones}
      />
    </Suspense>
  )
}
