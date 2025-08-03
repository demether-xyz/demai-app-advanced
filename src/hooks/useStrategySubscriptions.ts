import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { 
  getStrategies, 
  getStrategySubscriptions, 
  subscribeToStrategy, 
  updateStrategySubscription, 
  deleteStrategySubscription 
} from '../services/demaiApi'

interface Strategy {
  id: string
  name: string
  description: string
  task: string
  frequency: string
  chain: string
  tokens: string[]
  protocols: string[]
  current_yields?: { [token: string]: number }
}

interface StrategySubscription {
  _id: string
  user_address: string
  strategy_id: string
  chain: string
  percentage: number
  enabled: boolean
  created_at: string
  updated_at: string
  last_executed: string | null
  next_run_time: string | null
  execution_count: number
  last_execution_memo: string | null
  last_execution_status: string | null
  strategy: Strategy | null
}

interface UseStrategySubscriptionsReturn {
  strategies: Strategy[]
  subscriptions: StrategySubscription[]
  isLoadingStrategies: boolean
  isLoadingSubscriptions: boolean
  error: string | null
  subscribe: (strategyId: string, percentage: number, chain: string, vaultAddress: string) => Promise<void>
  updateSubscription: (taskId: string, updates: { percentage?: number; enabled?: boolean }) => Promise<void>
  deleteSubscription: (taskId: string) => Promise<void>
  refreshSubscriptions: () => Promise<void>
}

export function useStrategySubscriptions(): UseStrategySubscriptionsReturn {
  const { address } = useAccount()
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [subscriptions, setSubscriptions] = useState<StrategySubscription[]>([])
  const [isLoadingStrategies, setIsLoadingStrategies] = useState(false)
  const [isLoadingSubscriptions, setIsLoadingSubscriptions] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch available strategies
  const fetchStrategies = async () => {
    try {
      setIsLoadingStrategies(true)
      setError(null)
      
      const result = await getStrategies()
      if (result.success && result.data) {
        setStrategies(result.data.strategies || [])
      } else {
        throw new Error(result.error || 'Failed to fetch strategies')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch strategies')
      console.error('Error fetching strategies:', err)
    } finally {
      setIsLoadingStrategies(false)
    }
  }

  // Fetch user's subscriptions
  const fetchSubscriptions = async () => {
    if (!address) return
    
    try {
      setIsLoadingSubscriptions(true)
      setError(null)
      
      const result = await getStrategySubscriptions(address)
      if (result.success && result.data) {
        setSubscriptions(result.data.subscriptions || [])
      } else {
        throw new Error(result.error || 'Failed to fetch subscriptions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch subscriptions')
      console.error('Error fetching subscriptions:', err)
    } finally {
      setIsLoadingSubscriptions(false)
    }
  }

  // Subscribe to a strategy
  const subscribe = async (strategyId: string, percentage: number, chain: string, vaultAddress: string) => {
    if (!address) {
      throw new Error('Not connected')
    }
    
    const result = await subscribeToStrategy(address, vaultAddress, strategyId, percentage, chain, true)
    if (!result.success) {
      throw new Error(result.error || 'Failed to subscribe to strategy')
    }
    
    // Refresh subscriptions
    await fetchSubscriptions()
  }

  // Update a subscription
  const updateSubscription = async (taskId: string, updates: { percentage?: number; enabled?: boolean }) => {
    if (!address) {
      throw new Error('Not connected')
    }
    
    const result = await updateStrategySubscription(address, taskId, updates)
    if (!result.success) {
      throw new Error(result.error || 'Failed to update subscription')
    }
    
    // Refresh subscriptions
    await fetchSubscriptions()
  }

  // Delete a subscription
  const deleteSubscription = async (taskId: string) => {
    if (!address) {
      throw new Error('Not connected')
    }
    
    const result = await deleteStrategySubscription(address, taskId)
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete subscription')
    }
    
    // Refresh subscriptions
    await fetchSubscriptions()
  }

  // Refresh subscriptions
  const refreshSubscriptions = async () => {
    await fetchSubscriptions()
  }

  // Fetch strategies on mount
  useEffect(() => {
    fetchStrategies()
  }, [])

  // Fetch subscriptions when address changes
  useEffect(() => {
    if (address) {
      fetchSubscriptions()
    }
  }, [address])

  return {
    strategies,
    subscriptions,
    isLoadingStrategies,
    isLoadingSubscriptions,
    error,
    subscribe,
    updateSubscription,
    deleteSubscription,
    refreshSubscriptions,
  }
}