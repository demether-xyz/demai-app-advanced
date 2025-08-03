import { useState, useEffect } from 'react'
import { SUPPORTED_CHAINS, Chain } from '@/config/tokens'
import { getStrategies } from '@/services/demaiApi'

export interface Strategy {
  id: string
  name: string
  description: string
  detailedDescription: string
  chain_id?: number
  chain_name?: string
  chain_icon?: string
  chain?: Chain
  primaryToken: string
  secondaryTokens?: string[]
  apy: number
  riskLevel: 'low' | 'medium' | 'high'
  updateFrequency: string
  protocol: string
  thresholdInfo?: string
  default_interval_hours?: number
  required_params?: string[]
}

interface UseStrategiesResult {
  strategies: Strategy[]
  isLoading: boolean
  error: string | null
  refetch: () => void
}

export const useStrategies = (): UseStrategiesResult => {
  const [strategies, setStrategies] = useState<Strategy[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStrategies = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await getStrategies()
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch strategies')
      }
      
      const data = response.data
      
      // Transform API response to match frontend interface
      const transformedStrategies: Strategy[] = data!.strategies.map((strategy: any) => {
        // Find the chain object from SUPPORTED_CHAINS
        const chain = strategy.chain_id 
          ? SUPPORTED_CHAINS.find(c => c.id === strategy.chain_id)
          : null

        return {
          id: strategy.id || strategy.strategy_id,
          name: strategy.name,
          description: strategy.description,
          detailedDescription: strategy.detailedDescription || strategy.description,
          chain_id: strategy.chain_id,
          chain_name: strategy.chain_name,
          chain_icon: strategy.chain_icon,
          chain: chain || undefined,
          primaryToken: strategy.primaryToken || 'ETH',
          secondaryTokens: strategy.secondaryTokens || [],
          apy: strategy.apy || 0,
          riskLevel: strategy.riskLevel || 'medium',
          updateFrequency: strategy.updateFrequency || 'Daily',
          protocol: strategy.protocol || 'Unknown',
          thresholdInfo: strategy.thresholdInfo,
          default_interval_hours: strategy.default_interval_hours,
          required_params: strategy.required_params
        }
      })
      
      setStrategies(transformedStrategies)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch strategies')
      
      // Don't fall back to hardcoded strategies - just show empty state
      setStrategies([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStrategies()
  }, [])

  const refetch = () => {
    fetchStrategies()
  }

  return {
    strategies,
    isLoading,
    error,
    refetch
  }
} 