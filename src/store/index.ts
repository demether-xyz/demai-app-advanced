import { create } from 'zustand'

// Token balance and approval types
export interface TokenBalanceAndApproval {
  symbol: string
  name: string
  icon: string
  decimals: number
  address: `0x${string}`
  balance: string
  balanceRaw: bigint
  allowance: string
  allowanceRaw: bigint
  hasAllowance: boolean
  isLoading: boolean
  error?: string
}

// Event system types
interface EventState {
  events: Record<string, number>
  emit: (key: string) => void
  // Card surfacing system with unique timestamps
  surfaceCardRequests: Record<string, { cardId: string; timestamp: number; count: number }>
  surfaceCard: (cardId: string) => void
  // Get latest surface request for a card
  getLatestSurfaceRequest: (cardId: string) => { cardId: string; timestamp: number; count: number } | null
  
  // Vault verification system
  vaultVerification: {
    // Map of chainId -> userAddress -> vaultAddress (null if queried but no vault, undefined if not queried)
    userVaults: Record<number, Record<string, string | null | undefined>>
    // Map of chainId -> userAddress -> query status
    queryStatus: Record<number, Record<string, 'idle' | 'loading' | 'success' | 'error'>>
    // Last query timestamps for caching
    lastQueryTimestamp: Record<string, number>
  }
  
  // Token balances and approvals system
  tokenBalancesAndApprovals: {
    // Map of cacheKey (chainId-userAddress-spenderAddress) -> token data
    cache: Record<string, TokenBalanceAndApproval[]>
    // Last query timestamps for caching
    lastQueryTimestamp: Record<string, number>
  }
  
  // Vault verification actions
  setVaultQueryStatus: (chainId: number, userAddress: string, status: 'idle' | 'loading' | 'success' | 'error') => void
  setUserVault: (chainId: number, userAddress: string, vaultAddress: string | null) => void
  getUserVault: (chainId: number, userAddress: string) => string | null | undefined
  getVaultQueryStatus: (chainId: number, userAddress: string) => 'idle' | 'loading' | 'success' | 'error'
  shouldQueryVault: (chainId: number, userAddress: string) => boolean
  clearVaultCache: (chainId?: number, userAddress?: string) => void
  
  // Token balances and approvals actions
  setTokenBalancesAndApprovals: (cacheKey: string, tokens: TokenBalanceAndApproval[]) => void
  getTokenBalancesAndApprovals: (cacheKey: string) => TokenBalanceAndApproval[] | undefined
  clearTokenBalancesAndApprovals: (cacheKey?: string) => void
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

  // Vault verification system
  vaultVerification: {
    userVaults: {},
    queryStatus: {},
    lastQueryTimestamp: {},
  },

  // Token balances and approvals system
  tokenBalancesAndApprovals: {
    cache: {},
    lastQueryTimestamp: {},
  },

  setVaultQueryStatus: (chainId: number, userAddress: string, status: 'idle' | 'loading' | 'success' | 'error') => {
    set((state) => ({
      vaultVerification: {
        ...state.vaultVerification,
        queryStatus: {
          ...state.vaultVerification.queryStatus,
          [chainId]: {
            ...state.vaultVerification.queryStatus[chainId],
            [userAddress.toLowerCase()]: status,
          },
        },
      },
    }))
  },

  setUserVault: (chainId: number, userAddress: string, vaultAddress: string | null) => {
    const now = Date.now()
    const cacheKey = `${chainId}-${userAddress.toLowerCase()}`
    
    set((state) => ({
      vaultVerification: {
        ...state.vaultVerification,
        userVaults: {
          ...state.vaultVerification.userVaults,
          [chainId]: {
            ...state.vaultVerification.userVaults[chainId],
            [userAddress.toLowerCase()]: vaultAddress,
          },
        },
        lastQueryTimestamp: {
          ...state.vaultVerification.lastQueryTimestamp,
          [cacheKey]: now,
        },
      },
    }))
  },

  getUserVault: (chainId: number, userAddress: string) => {
    const state = get()
    return state.vaultVerification.userVaults[chainId]?.[userAddress.toLowerCase()]
  },

  getVaultQueryStatus: (chainId: number, userAddress: string) => {
    const state = get()
    return state.vaultVerification.queryStatus[chainId]?.[userAddress.toLowerCase()] || 'idle'
  },

  shouldQueryVault: (chainId: number, userAddress: string) => {
    const state = get()
    const cacheKey = `${chainId}-${userAddress.toLowerCase()}`
    const lastQuery = state.vaultVerification.lastQueryTimestamp[cacheKey]
    const currentStatus = state.vaultVerification.queryStatus[chainId]?.[userAddress.toLowerCase()]
    
    // Don't query if currently loading
    if (currentStatus === 'loading') return false
    
    // Query if never queried before
    if (!lastQuery) return true
    
    // Query if cache is older than 5 minutes
    const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
    return Date.now() - lastQuery > CACHE_DURATION
  },

  clearVaultCache: (chainId?: number, userAddress?: string) => {
    set((state) => {
      if (chainId && userAddress) {
        // Clear specific user on specific chain
        const key = userAddress.toLowerCase()
        const newUserVaults = { ...state.vaultVerification.userVaults }
        const newQueryStatus = { ...state.vaultVerification.queryStatus }
        const newTimestamps = { ...state.vaultVerification.lastQueryTimestamp }
        const cacheKey = `${chainId}-${key}`
        
        if (newUserVaults[chainId]) {
          delete newUserVaults[chainId][key]
        }
        if (newQueryStatus[chainId]) {
          delete newQueryStatus[chainId][key]
        }
        delete newTimestamps[cacheKey]
        
        return {
          vaultVerification: {
            ...state.vaultVerification,
            userVaults: newUserVaults,
            queryStatus: newQueryStatus,
            lastQueryTimestamp: newTimestamps,
          },
        }
      } else if (chainId) {
        // Clear all users on specific chain
        const newUserVaults = { ...state.vaultVerification.userVaults }
        const newQueryStatus = { ...state.vaultVerification.queryStatus }
        const newTimestamps = { ...state.vaultVerification.lastQueryTimestamp }
        
        delete newUserVaults[chainId]
        delete newQueryStatus[chainId]
        
        // Remove timestamps for this chain
        Object.keys(newTimestamps).forEach(key => {
          if (key.startsWith(`${chainId}-`)) {
            delete newTimestamps[key]
          }
        })
        
        return {
          vaultVerification: {
            ...state.vaultVerification,
            userVaults: newUserVaults,
            queryStatus: newQueryStatus,
            lastQueryTimestamp: newTimestamps,
          },
        }
      } else {
        // Clear everything
        return {
          vaultVerification: {
            userVaults: {},
            queryStatus: {},
            lastQueryTimestamp: {},
          },
        }
      }
    })
  },

  // Token balances and approvals actions
  setTokenBalancesAndApprovals: (cacheKey: string, tokens: TokenBalanceAndApproval[]) => {
    const now = Date.now()
    
    set((state) => ({
      tokenBalancesAndApprovals: {
        ...state.tokenBalancesAndApprovals,
        cache: {
          ...state.tokenBalancesAndApprovals.cache,
          [cacheKey]: tokens,
        },
        lastQueryTimestamp: {
          ...state.tokenBalancesAndApprovals.lastQueryTimestamp,
          [cacheKey]: now,
        },
      },
    }))
  },

  getTokenBalancesAndApprovals: (cacheKey: string) => {
    const state = get()
    return state.tokenBalancesAndApprovals.cache[cacheKey]
  },

  clearTokenBalancesAndApprovals: (cacheKey?: string) => {
    set((state) => {
      if (cacheKey) {
        // Clear specific cache entry
        const newCache = { ...state.tokenBalancesAndApprovals.cache }
        const newTimestamps = { ...state.tokenBalancesAndApprovals.lastQueryTimestamp }
        
        delete newCache[cacheKey]
        delete newTimestamps[cacheKey]
        
        return {
          tokenBalancesAndApprovals: {
            ...state.tokenBalancesAndApprovals,
            cache: newCache,
            lastQueryTimestamp: newTimestamps,
          },
        }
      } else {
        // Clear all cache
        return {
          tokenBalancesAndApprovals: {
            cache: {},
            lastQueryTimestamp: {},
          },
        }
      }
    })
  },
}))
