import { create } from 'zustand'

// Event system types
interface EventState {
  events: Record<string, number>
  emit: (key: string) => void
  // Card surfacing system with unique timestamps
  surfaceCardRequests: Record<string, { cardId: string; timestamp: number; count: number }>
  surfaceCard: (cardId: string) => void
  // Get latest surface request for a card
  getLatestSurfaceRequest: (cardId: string) => { cardId: string; timestamp: number; count: number } | null
}

// Create the app store with event system
export const useAppStore = create<EventState>((set, get) => ({
  events: {},

  // Hierarchical event system - emitting "app.openwindow.curve123" creates events for:
  // "app", "app.openwindow", and "app.openwindow.curve123"
  emit: (key: string) => {
    set((state) => {
      const parts = key.split('.')
      const updates: Record<string, number> = {}
      let current = ''

      parts.forEach((part) => {
        current = current ? `${current}.${part}` : part
        updates[current] = Date.now()
      })

      return {
        events: { ...state.events, ...updates },
      }
    })
  },

  // Card surfacing system with unique timestamps
  surfaceCardRequests: {},

  surfaceCard: (cardId: string) => {
    const timestamp = Date.now()
    const uniqueKey = `${cardId}-${timestamp}`

    set((state) => {
      const currentRequest = state.surfaceCardRequests[cardId]
      const newCount = currentRequest ? currentRequest.count + 1 : 1

      return {
        surfaceCardRequests: {
          ...state.surfaceCardRequests,
          [cardId]: {
            cardId,
            timestamp,
            count: newCount,
          },
        },
      }
    })
  },

  getLatestSurfaceRequest: (cardId: string) => {
    const state = get()
    return state.surfaceCardRequests[cardId] || null
  },
}))
