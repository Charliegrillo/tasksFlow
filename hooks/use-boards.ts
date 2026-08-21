import { useCallback } from 'react'
import { useBoardStore } from '@/stores/board-store'
import { useUiStore } from '@/stores/ui-store'

export function useBoards() {
  const activeClient = useBoardStore((s) => s.activeClient)
  const activeSpace = useBoardStore((s) => s.activeSpace)
  const activeBoard = useBoardStore((s) => s.activeBoard)
  const boards = useBoardStore((s) => s.boards)
  const allBoards = useBoardStore((s) => s.allBoards)
  const spaces = useBoardStore((s) => s.spaces)
  const boardLists = useBoardStore((s) => s.boardLists)

  const activeBoardObj = boards.find((b) => b.id === activeBoard) ?? allBoards.find((b) => b.id === activeBoard)

  const selectClient = useCallback(
    (id: number) => {
      const store = useBoardStore.getState()
      store.setActiveClient(id)
      store.setSelectedMilestoneId(null)
      store.fetchSpaces(id)
    },
    []
  )

  const selectSpace = useCallback(
    (id: number) => {
      const store = useBoardStore.getState()
      store.setActiveSpace(id)
      store.setSelectedMilestoneId(null)
      store.fetchBoards(id)
    },
    []
  )

  const selectBoard = useCallback(
    (id: number) => {
      const store = useBoardStore.getState()
      store.setActiveBoard(id)
      store.setSelectedMilestoneId(null)
      useUiStore.getState().setActiveView(null)
    },
    []
  )

  return {
    activeClient,
    activeSpace,
    activeBoard,
    activeBoardObj,
    boards,
    allBoards,
    spaces,
    boardLists,
    selectClient,
    selectSpace,
    selectBoard,
  }
}
