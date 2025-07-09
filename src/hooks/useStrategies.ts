import { useState, useEffect } from 'react'
import { SUPPORTED_CHAINS, Chain } from '@/config/tokens'

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
      
      const response = await fetch('http://localhost:5050/strategies/')
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Transform API response to match frontend interface
      const transformedStrategies: Strategy[] = data.strategies.map((strategy: any) => {
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
      console.error('Error fetching strategies:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch strategies')
      
      // Fallback to hardcoded strategies if API fails
      const fallbackStrategies: Strategy[] = [
        {
          id: 'aave-usdc-arbitrum',
          name: 'Aave USDC Lending',
          description: 'Automated USDC lending on Aave with optimal yield farming',
          detailedDescription: 'This strategy automatically lends your USDC on Aave V3 to earn lending rewards. The strategy monitors rates and automatically compounds rewards for maximum yield.',
          chain: SUPPORTED_CHAINS.find(c => c.id === 42161)!,
          primaryToken: 'USDC',
          secondaryTokens: ['AAVE'],
          apy: 18.5,
          riskLevel: 'low' as const,
          updateFrequency: 'Daily',
          protocol: 'Aave V3',
          thresholdInfo: 'Minimum 10 USDC required'
        },
        {
          id: 'uniswap-eth-usdc-arbitrum',
          name: 'Uniswap V3 ETH/USDC LP',
          description: 'Concentrated liquidity provision with automated rebalancing',
          detailedDescription: 'Provides liquidity to the ETH/USDC pool on Uniswap V3 with concentrated positions. Automatically rebalances when price moves outside the range.',
          chain: SUPPORTED_CHAINS.find(c => c.id === 42161)!,
          primaryToken: 'ETH',
          secondaryTokens: ['USDC'],
          apy: 24.2,
          riskLevel: 'medium' as const,
          updateFrequency: 'Every 6 hours',
          protocol: 'Uniswap V3',
          thresholdInfo: 'Minimum 0.1 ETH required'
        }
      ]
      
      setStrategies(fallbackStrategies)
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