import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAppStore, PortfolioData } from '@/store'
import { useVaultVerification } from '@/hooks/useVaultVerification'
import { useEvent } from '@/hooks/useEvents'
import { getPortfolioData as fetchPortfolioData } from '@/services/demaiApi'

export const usePortfolio = (shouldFetch: boolean = true) => {
  const { isConnected, address } = useAccount()
  const { vaultAddress, hasVault, isLoading: isVaultLoading } = useVaultVerification(isConnected)
  
  // Store actions and selectors
  const setPortfolioData = useAppStore((state) => state.setPortfolioData)
  const getPortfolioData = useAppStore((state) => state.getPortfolioData)
  const setPortfolioLoading = useAppStore((state) => state.setPortfolioLoading)
  const setPortfolioError = useAppStore((state) => state.setPortfolioError)
  const shouldQueryPortfolio = useAppStore((state) => state.shouldQueryPortfolio)

  // Listen for portfolio update events
  const portfolioUpdateEvent = useEvent('app.portfolio')

  // Get current portfolio data from store
  const portfolioData = vaultAddress ? getPortfolioData(vaultAddress) : undefined

  // Default empty portfolio state
  const defaultPortfolio: PortfolioData = {
    total_value_usd: 0,
    strategy_value_usd: 0,
    tokens_count: 0,
    chains_count: 0,
    strategy_count: 0,
    active_strategies: [],
    holdings: [],
    isLoading: false,
    error: null,
  }

  // Fetch portfolio data
  const fetchPortfolio = async (vaultAddr: string, force: boolean = false) => {
    if (!force && !shouldQueryPortfolio(vaultAddr)) {
      return
    }

    setPortfolioLoading(vaultAddr, true)
    setPortfolioError(vaultAddr, null)

    try {
      const result = await fetchPortfolioData(vaultAddr)
      if (result.success && result.data) {
        // Calculate strategy value from holdings
        const strategyValue = result.data.holdings
          .filter(holding => holding.type === 'strategy')
          .reduce((sum, holding) => sum + holding.value_usd, 0)
        
        const portfolioData: PortfolioData = {
          total_value_usd: result.data.total_value_usd,
          strategy_value_usd: strategyValue,
          tokens_count: result.data.tokens_count,
          chains_count: result.data.chains_count,
          strategy_count: result.data.strategy_count || 0,
          active_strategies: result.data.active_strategies || [],
          holdings: result.data.holdings || [],
          isLoading: false,
          error: null,
          lastUpdated: Date.now(),
        }

        setPortfolioData(vaultAddr, portfolioData)
      } else {
        const errorPortfolio: PortfolioData = {
          ...defaultPortfolio,
          error: result.error || 'Failed to fetch portfolio data',
        }
        setPortfolioData(vaultAddr, errorPortfolio)
      }
    } catch (error) {
      const errorPortfolio: PortfolioData = {
        ...defaultPortfolio,
        error: 'Failed to fetch portfolio data',
      }
      setPortfolioData(vaultAddr, errorPortfolio)
    }
  }

  // Trigger refresh function
  const refreshPortfolio = () => {
    if (vaultAddress) {
      fetchPortfolio(vaultAddress, true)
    }
  }

  // Auto-fetch portfolio data when conditions are met
  useEffect(() => {
    if (!shouldFetch || !hasVault || !vaultAddress || isVaultLoading) {
      return
    }

    fetchPortfolio(vaultAddress)
  }, [shouldFetch, hasVault, vaultAddress, isVaultLoading])

  // Listen for portfolio update events
  useEffect(() => {
    if (portfolioUpdateEvent > 0 && vaultAddress) {
      fetchPortfolio(vaultAddress, true)
    }
  }, [portfolioUpdateEvent, vaultAddress])

  // Return the portfolio data or default if not available
  return {
    portfolioData: portfolioData || defaultPortfolio,
    refreshPortfolio,
    isVaultLoading,
    hasVault,
    vaultAddress,
  }
} 