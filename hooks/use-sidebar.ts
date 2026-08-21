import { useCallback } from 'react'
import { useBoardStore } from '@/stores/board-store'
import { useUiStore } from '@/stores/ui-store'

export function useSidebar() {
  const clients = useBoardStore((s) => s.clients)
  const milestones = useBoardStore((s) => s.milestones)
  const spaces = useBoardStore((s) => s.spaces)
  const boards = useBoardStore((s) => s.boards)
  const activeClient = useBoardStore((s) => s.activeClient)
  const activeSpace = useBoardStore((s) => s.activeSpace)
  const activeBoard = useBoardStore((s) => s.activeBoard)
  const selectedMilestoneId = useBoardStore((s) => s.selectedMilestoneId)

  const sidebarCollapsed = useUiStore((s) => s.sidebarCollapsed)
  const activeView = useUiStore((s) => s.activeView)
  const crmDeals = useUiStore((s) => s.crmDeals)

  const selectClient = useCallback((id: number) => {
    const store = useBoardStore.getState()
    store.setActiveClient(id)
    store.setSelectedMilestoneId(null)
    store.fetchSpaces(id)
  }, [])

  const selectSpace = useCallback((id: number) => {
    const store = useBoardStore.getState()
    store.setActiveSpace(id)
    store.setSelectedMilestoneId(null)
    store.fetchBoards(id)
  }, [])

  const selectBoard = useCallback((id: number) => {
    const store = useBoardStore.getState()
    store.setActiveBoard(id)
    store.setSelectedMilestoneId(null)
    useUiStore.getState().setActiveView(null)
  }, [])

  const selectMilestone = useCallback((milestoneId: number) => {
    const store = useBoardStore.getState()
    const current = store.selectedMilestoneId
    store.setSelectedMilestoneId(current === milestoneId ? null : milestoneId)
  }, [])

  const setActiveView = useCallback((view: 'board' | 'crm' | 'contacts' | 'pipelines' | 'invoices' | null) => {
    useUiStore.getState().setActiveView(view)
  }, [])

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    useUiStore.getState().setSidebarCollapsed(collapsed)
  }, [])

  return {
    clients,
    milestones,
    spaces,
    boards,
    activeClient,
    activeSpace,
    activeBoard,
    selectedMilestoneId,
    sidebarCollapsed,
    activeView,
    crmDealCount: crmDeals.length,
    selectClient,
    selectSpace,
    selectBoard,
    selectMilestone,
    setActiveView,
    setSidebarCollapsed,
  }
}
