import { useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAppStore, PortfolioData } from '@/store'
import { useEvent, useEventEmitter } from '@/hooks/useEvents'
import { getPortfolioData as fetchPortfolioData } from '@/services/demaiApi'
import { useAuth } from '@/hooks/useAuth'

export const usePortfolio = (shouldFetch: boolean = true) => {
  const { isConnected, address } = useAccount()
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
  const emit = useEventEmitter()

  // Fetch portfolio data using wallet address
  const fetchPortfolio = async (walletAddress: string, force: boolean = false) => {
    console.log('🔄 [Portfolio] Fetching portfolio data...', {
      walletAddress,
      force,
      timestamp: new Date().toISOString()
    })

    // Don't fetch if not authenticated
    if (!hasValidSignature) {
      console.log('❌ [Portfolio] Not authenticated, skipping fetch')
      setPortfolioData(walletAddress, {
        ...defaultPortfolio,
        error: 'Please authenticate to view your portfolio.',
        isLoading: false,
      })
      return
    }

    // Set loading state immediately
    console.log('⏳ [Portfolio] Setting loading state to true')
    setPortfolioLoading(walletAddress, true)

    try {
      const result = await fetchPortfolioData(walletAddress, force)
      
      console.log('✅ [Portfolio] Received API response:', {
        success: result.success,
        hasData: !!result.data,
        totalValue: result.data?.total_value_usd,
        timestamp: new Date().toISOString()
      })
      
      if (result.success && result.data) {
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

        console.log('💾 [Portfolio] Updating store with new data', {
          totalValue: portfolioData.total_value_usd,
          isLoading: false,
          timestamp: new Date().toISOString()
        })
        
        setPortfolioData(walletAddress, portfolioData)
      } else {
        console.log('⚠️ [Portfolio] API request failed:', {
          error: result.error,
          timestamp: new Date().toISOString()
        })
        setPortfolioData(walletAddress, {
          ...defaultPortfolio,
          error: result.error || 'Failed to fetch portfolio data',
          isLoading: false,
        })
      }
    } catch (error) {
      console.error('❌ [Portfolio] Error fetching data:', {
        error,
        timestamp: new Date().toISOString()
      })
      setPortfolioData(walletAddress, {
        ...defaultPortfolio,
        error: 'Failed to fetch portfolio data',
        isLoading: false,
      })
    } finally {
      // Ensure loading state is cleared in all cases
      console.log('⏳ [Portfolio] Setting loading state to false')
      setPortfolioLoading(walletAddress, false)
    }
  }

  // Refresh portfolio data
  const refreshPortfolio = () => {
    if (address) {
      console.log('🔄 [Portfolio] Manual refresh triggered', {
        address,
        timestamp: new Date().toISOString()
      })
      fetchPortfolio(address, true)
    }
  }

  // Initial fetch and refresh event handling
  useEffect(() => {
    if (shouldFetch && address && hasValidSignature) {
      // Check if we should query based on cache and last query time
      if (shouldQueryPortfolio(address)) {
        console.log('🔄 [Portfolio] Initial/cache-expired fetch triggered', {
          address,
          timestamp: new Date().toISOString()
        })
        fetchPortfolio(address)
      }
    }
  }, [shouldFetch, address, hasValidSignature])

  // Handle refresh events
  useEffect(() => {
    if (refreshEvent > 0 && address) {
      console.log('🔄 [Portfolio] Event-triggered refresh', {
        refreshEvent,
        address,
        timestamp: new Date().toISOString()
      })
      fetchPortfolio(address, true)
    }
  }, [refreshEvent, address])

  // Clear cache when wallet changes
  useEffect(() => {
    if (!address) {
      console.log('🧹 [Portfolio] Clearing cache - no wallet connected')
      clearPortfolioCache()
    }
  }, [address])

  return {
    portfolioData: portfolioData || defaultPortfolio,
    refreshPortfolio,
  }
}

export default usePortfolio 