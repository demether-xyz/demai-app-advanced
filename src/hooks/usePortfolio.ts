import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAppStore, PortfolioData } from '@/store'
import { useEvent } from '@/hooks/useEvents'
import { getPortfolioData as fetchPortfolioData } from '@/services/demaiApi'
import { useAuth } from '@/hooks/useAuth'

export const usePortfolio = (shouldFetch: boolean = true) => {
  const { address } = useAccount()
  const { hasValidSignature } = useAuth()
  
  // Store actions and selectors
  const setPortfolioData = useAppStore((state) => state.setPortfolioData)
  const getPortfolioData = useAppStore((state) => state.getPortfolioData)
  const shouldQueryPortfolio = useAppStore((state) => state.shouldQueryPortfolio)
  const clearPortfolioCache = useAppStore((state) => state.clearPortfolioCache)
  const setPortfolioLoading = useAppStore((state) => state.setPortfolioLoading)

  // Default empty portfolio state
  const defaultPortfolio: PortfolioData = {
    total_value_usd: 0,
    chains: {},
    strategies: {},
    summary: {
      active_chains: [],
      active_strategies: [],
      total_tokens: 0,
    },
    isLoading: false,
    error: null,
  }

  // Get current portfolio data from store using wallet address
  const portfolioData = address ? getPortfolioData(address) : defaultPortfolio

  // Listen for portfolio refresh events
  const refreshEvent = useEvent('app.portfolio.refresh')

  // Fetch portfolio data using wallet address
  const fetchPortfolio = async (walletAddress: string, force: boolean = false, retryCount: number = 0) => {

    // Don't fetch if not authenticated
    if (!hasValidSignature) {
      setPortfolioData(walletAddress, {
        ...defaultPortfolio,
        error: 'Please authenticate to view your portfolio.',
        isLoading: false,
      })
      return
    }

    // Set loading state immediately (only on first attempt)
    if (retryCount === 0) {
      setPortfolioLoading(walletAddress, true)
    }

    try {
      const result = await fetchPortfolioData(walletAddress, force)
      
      
      if (result.success && result.data) {
        // Debug: Log the portfolio data to see what we're receiving
        console.log('Portfolio API Response:', JSON.stringify(result.data, null, 2))
        
        // Map the API response to our expected structure
        const portfolioData: PortfolioData = {
          total_value_usd: result.data.total_value_usd || 0,
          chains: result.data.chains || {},
          strategies: result.data.strategies || {},
          summary: result.data.summary || { 
            active_chains: [], 
            active_strategies: [], 
            total_tokens: 0 
          },
          isLoading: false,  // Explicitly set loading to false
          error: null,
          lastUpdated: Date.now(),
        }

        // Check if we should retry (only when force refreshing and value is still 0)
        if (force && portfolioData.total_value_usd === 0 && retryCount < 3) {
          
          // Wait a bit longer before retrying
          setTimeout(() => {
            fetchPortfolio(walletAddress, true, retryCount + 1)
          }, 2000) // 2 second delay between retries
          
          return // Don't update the store yet
        }

        
        setPortfolioData(walletAddress, portfolioData)
      } else {
        setPortfolioData(walletAddress, {
          ...defaultPortfolio,
          error: result.error || 'Failed to fetch portfolio data',
          isLoading: false,
        })
      }
    } catch (error) {
      setPortfolioData(walletAddress, {
        ...defaultPortfolio,
        error: 'Failed to fetch portfolio data',
        isLoading: false,
      })
    } finally {
      // Ensure loading state is cleared in all cases
      setPortfolioLoading(walletAddress, false)
    }
  }

  // Refresh portfolio data
  const refreshPortfolio = () => {
    if (address) {
      fetchPortfolio(address, true)
    }
  }

  // Initial fetch and refresh event handling
  useEffect(() => {
    if (shouldFetch && address && hasValidSignature) {
      // Check if we should query based on cache and last query time
      if (shouldQueryPortfolio(address)) {
        fetchPortfolio(address)
      }
    }
  }, [shouldFetch, address, hasValidSignature])

  // Handle refresh events
  useEffect(() => {
    if (refreshEvent > 0 && address) {
      fetchPortfolio(address, true)
    }
  }, [refreshEvent, address])

  // Clear cache when wallet changes
  useEffect(() => {
    if (!address) {
      clearPortfolioCache()
    }
  }, [address])

  return {
    portfolioData: portfolioData || defaultPortfolio,
    refreshPortfolio,
  }
}

export default usePortfolio 