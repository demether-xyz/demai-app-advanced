import { useAppStore } from '../store'

// Event system hooks
export const useEvent = (key: string) => {
  return useAppStore((state) => state.events[key] ?? 0)
}

export const useEventEmitter = () => {
  return useAppStore((state) => state.emit)
}

// Event types
export const EVENTS = {
  PORTFOLIO_REFRESH: 'app.portfolio.refresh',
  STRATEGY_UPDATE: 'app.strategy.update',
  OPEN_WINDOW: 'app.openwindow'
} as const

// Helper hook for opening windows via events
export const useOpenWindow = () => {
  const emit = useEventEmitter()

  return (windowId: string) => {
    // Emit hierarchical event: app.openwindow.{windowId}
    emit(`${EVENTS.OPEN_WINDOW}.${windowId}`)
  }
}

// Card surfacing hooks with timestamp support
export const useSurfaceCardRequest = (cardId: string) => {
  return useAppStore((state) => {
    const request = state.surfaceCardRequests[cardId]
    return request ? { ...request } : null
  })
}

export const useSurfaceCard = () => {
  return useAppStore((state) => state.surfaceCard)
}

// Generic hook for tracking multiple card surface requests with timestamps
export const useSurfaceCardRequests = (cardIds: string[]) => {
  return useAppStore((state) => {
    const requests: Record<string, { cardId: string; timestamp: number; count: number } | null> = {}
    cardIds.forEach((cardId) => {
      const request = state.surfaceCardRequests[cardId]
      requests[cardId] = request ? { ...request } : null
    })
    return requests
  })
}
