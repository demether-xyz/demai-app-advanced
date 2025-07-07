import React from 'react'
import { usePortfolio } from '../hooks/usePortfolio'
import { useAccount } from 'wagmi'
import { useAuth } from '../hooks/useAuth'
import TokenIcon from './TokenIcon'
import { ArrowPathIcon } from '@heroicons/react/24/outline'
import { useAppStore, PortfolioData } from '@/store'

export interface PortfolioCardData {
  id: string
  title: string
  color: string
  aiPriority: 'high' | 'medium' | 'low'
  category: 'overview'
  content: React.ReactNode
}

export interface PortfolioMetrics {
  totalValue: number
  dailyChange: number
  weeklyChange: number
  avgAPY: number
  dailyYield: number
  monthlyYield: number
  riskScore: number
  diversificationScore: number
  maxDrawdown: number
}


// Portfolio card content for collapsed state
export const getPortfolioCardContent = (metrics: PortfolioMetrics, portfolioData?: any): React.ReactNode => {
  const safePortfolioData = portfolioData || { summary: { active_strategies: [], active_chains: [] }, strategies: {} }
  
  return (
    <div>
      <div className="mb-1 text-base font-medium text-slate-200">
        ${metrics.totalValue.toLocaleString()}
      </div>
      <div className="text-sm text-slate-400">Total Portfolio Value</div>
      <div className="mt-1 text-xs text-emerald-400">
        +${Math.abs(metrics.weeklyChange).toLocaleString()} (7d)
      </div>
      
      {/* Strategy Summary */}
      {safePortfolioData.strategies && Object.keys(safePortfolioData.strategies).length > 0 && (
        <div className="mt-3 space-y-1">
          <div className="text-xs font-medium text-slate-300">Active Strategies:</div>
          {Object.entries(safePortfolioData.strategies).slice(0, 2).map(([key, strategy]: [string, any]) => (
            <div key={key} className="flex items-center justify-between text-xs">
              <span className="text-blue-400 capitalize">
                {strategy.protocol} {strategy.strategy?.replace('_', ' ')}
              </span>
              <span className="text-emerald-400">
                ${strategy.total_value_usd?.toLocaleString() || '0'}
              </span>
            </div>
          ))}
          {Object.keys(safePortfolioData.strategies).length > 2 && (
            <div className="text-xs text-slate-400">
              +{Object.keys(safePortfolioData.strategies).length - 2} more
            </div>
          )}
        </div>
      )}
      
      {/* Multi-Chain Summary */}
      {safePortfolioData.summary?.active_chains && safePortfolioData.summary.active_chains.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {safePortfolioData.summary.active_chains.map((chain: string) => (
            <span key={chain} className="inline-flex items-center rounded-full bg-slate-800/50 px-2 py-0.5 text-xs text-slate-300">
              {chain}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// Portfolio expanded content for window state
export const getPortfolioExpandedContent = (metrics: PortfolioMetrics, portfolioData: any): React.ReactNode => {
  // Ensure portfolioData exists and has default values
  const safePortfolioData = portfolioData || {
    chains: {},
    strategies: {},
    summary: { active_chains: [], active_strategies: [], total_tokens: 0 },
    total_value_usd: 0
  }

  const chains = Object.entries(safePortfolioData.chains || {});
  const strategies = Object.entries(safePortfolioData.strategies || {});
  const chains_count = Object.keys(safePortfolioData.chains || {}).length;
  const tokens_count = safePortfolioData.summary?.total_tokens || 0;
  const strategy_count = Object.keys(safePortfolioData.strategies || {}).length;

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-800/50 p-4">
          <div className="mb-1 text-xl font-medium text-slate-200">
            ${metrics.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400">Total Value</div>
          <div className="mt-1 text-xs text-emerald-400">
            +${Math.abs(metrics.weeklyChange).toLocaleString()} (7d)
          </div>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-4">
          <div className="mb-1 text-xl font-medium text-emerald-400">
            {metrics.avgAPY.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-400">Avg APY</div>
          <div className="mt-1 text-xs text-emerald-300">Estimated</div>
        </div>
        <div className="rounded-lg bg-slate-800/50 p-4">
          <div className="mb-1 text-xl font-medium text-blue-400">
            ${metrics.dailyYield.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400">Daily Yield</div>
          <div className="mt-1 text-xs text-blue-300">
            ${metrics.monthlyYield.toLocaleString()} (30d)
          </div>
        </div>
      </div>

      {/* Chain Holdings Section */}
      {chains.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-2">
            <h4 className="font-medium text-slate-200">
              Holdings by Chain ({chains.length} chains)
            </h4>
            <div className="text-sm text-blue-400">
              {safePortfolioData.summary?.total_tokens || 0} tokens total
            </div>
          </div>
          
          {chains.map(([chainName, chainData]: [string, any]) => (
            <div key={chainName} className="rounded-lg bg-slate-800/30 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div>
                    <h5 className="font-medium text-slate-200">{chainName}</h5>
                    <div className="text-xs text-slate-400">
                      {Object.keys(chainData.tokens || {}).length} tokens, {Object.keys(chainData.strategies || {}).length} strategies
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-blue-400">
                    ${chainData.total_value_usd?.toLocaleString() || '0'}
                  </div>
                  <div className="text-xs text-slate-400">Chain Total</div>
                </div>
              </div>

              {/* Vault Token Holdings */}
              {Object.keys(chainData.tokens || {}).length > 0 && (
                <div className="space-y-2 mb-4">
                  <h6 className="text-sm font-medium text-slate-300 mb-2">
                    Vault Holdings ({Object.keys(chainData.tokens).length} tokens)
                  </h6>
                  <div className="grid gap-2">
                    {Object.entries(chainData.tokens).map(([symbol, token]: [string, any]) => (
                      <div key={symbol} className="flex items-center justify-between text-sm rounded-lg bg-slate-900/50 p-3 hover:bg-slate-900/70 transition-colors">
                        <div className="flex items-center">
                          <TokenIcon symbol={symbol} className="w-8 h-8 mr-2" />
                          <div>
                            <div className="font-mono text-slate-200">{symbol}</div>
                            <div className="text-xs text-slate-400">In Vault</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-slate-200">{token.balance?.toFixed(4) || '0'}</div>
                          <div className="text-xs text-emerald-400">${token.value_usd?.toLocaleString() || '0'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chain Strategy Positions */}
              {Object.keys(chainData.strategies || {}).length > 0 && (
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-slate-300 mb-2">Strategy Positions</h6>
                  {Object.entries(chainData.strategies).map(([strategyKey, strategy]: [string, any]) => (
                                    <div key={strategyKey} className="rounded-lg bg-slate-900/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-slate-200 capitalize text-sm">
                      {strategy.protocol} - {strategy.strategy?.replace('_', ' ') || 'Strategy'}
                    </div>
                    <div className="text-sm text-emerald-400">
                      ${strategy.total_value_usd?.toLocaleString() || '0'}
                    </div>
                  </div>
                      <div className="space-y-1">
                        {Object.entries(strategy.tokens || {}).map(([tokenSymbol, token]: [string, any]) => (
                          <div key={tokenSymbol} className="flex items-center justify-between text-xs">
                            <div className="flex items-center">
                              <TokenIcon symbol={tokenSymbol} className="w-5 h-5 mr-2" />
                              <div className="font-mono text-slate-300">{tokenSymbol}</div>
                            </div>
                            <div className='text-right'>
                              <div className="font-medium text-slate-200">{token.balance?.toFixed(4) || '0'}</div>
                              <div className="text-slate-400">${token.value_usd?.toLocaleString() || '0'}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {Object.keys(chainData.tokens || {}).length === 0 && Object.keys(chainData.strategies || {}).length === 0 && (
                <div className="text-sm text-slate-400">No assets on this chain.</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Portfolio Stats */}
      <div className="space-y-3">
        <h4 className="font-medium text-slate-200">Portfolio Stats</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Total Assets</span>
            <div className="font-medium text-blue-400">{tokens_count || 0}</div>
            <div className="text-xs text-slate-400">Tokens</div>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Chains</span>
            <div className="font-medium text-emerald-400">{chains_count || 0}</div>
            <div className="text-xs text-slate-400">Networks</div>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Strategies</span>
            <div className="font-medium text-purple-400">{strategy_count || 0}</div>
            <div className="text-xs text-slate-400">Active</div>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Risk Score</span>
            <div className="font-medium text-amber-400">{metrics.riskScore.toFixed(1)}/10</div>
            <div className="text-xs text-slate-400">Estimated</div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {chains.length === 0 && strategies.length === 0 && (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">No assets found</div>
          <div className="text-sm text-slate-400">Your portfolio will appear here once you have assets or active strategies.</div>
        </div>
      )}
    </div>
  )
}

// Convert real portfolio data to Portfolio component metrics
export const useRealPortfolioMetrics = (portfolioData?: any): PortfolioMetrics => {
  // Use passed portfolioData if available, otherwise fetch it
  const { isConnected } = useAccount()
  const { hasValidSignature } = useAuth()
  const { portfolioData: hookPortfolioData } = usePortfolio(isConnected && hasValidSignature)
  
  const actualPortfolioData = portfolioData || hookPortfolioData

  if (actualPortfolioData.isLoading || actualPortfolioData.error) {
    return {
      totalValue: 0,
      dailyChange: 0,
      weeklyChange: 0,
      avgAPY: 0,
      dailyYield: 0,
      monthlyYield: 0,
      riskScore: 0,
      diversificationScore: 0,
      maxDrawdown: 0,
    }
  }

  // Handle case where total_value_usd is 0 or very small but we still have data
  if (!actualPortfolioData.total_value_usd && Object.keys(actualPortfolioData.chains || {}).length === 0) {
    return {
      totalValue: 0,
      dailyChange: 0,
      weeklyChange: 0,
      avgAPY: 0,
      dailyYield: 0,
      monthlyYield: 0,
      riskScore: 0,
      diversificationScore: 0,
      maxDrawdown: 0,
    }
  }

  const { chains, total_value_usd, summary, strategies } = actualPortfolioData;
  const chainsData = Object.values(chains || {});

  const tokens_count = summary?.total_tokens || 0;
  
  const strategy_count = Object.keys(strategies || {}).length;

  const strategy_value_usd = Object.values(strategies || {}).reduce((sum: number, s: any) => sum + s.total_value_usd, 0);
  
  const chains_count = chainsData.length;


  // Calculate estimated APY based on strategy value (simplified calculation)
  const estimatedAPY = strategy_value_usd > 0 && total_value_usd > 0 ? 
    ((strategy_value_usd / total_value_usd) * 18.5) + 3.2 : 5.2

  // Calculate daily yield based on APY
  const dailyYield = (total_value_usd * estimatedAPY / 100) / 365

  return {
    totalValue: total_value_usd,
    dailyChange: dailyYield, // Use daily yield as daily change for now
    weeklyChange: dailyYield * 7, // Weekly change based on daily yield
    avgAPY: estimatedAPY,
    dailyYield: dailyYield,
    monthlyYield: dailyYield * 30,
    riskScore: strategy_count > 0 ? 6.8 : 8.2, // Lower risk with strategies
    diversificationScore: Math.min(9.5, tokens_count * 1.2 + chains_count * 0.8),
    maxDrawdown: strategy_count > 0 ? -8.4 : -15.2, // Better drawdown with strategies
  }
}

// Portfolio card content component that uses real data
export const RealPortfolioCardContent: React.FC = () => {
  const { isConnected } = useAccount()
  const { hasValidSignature } = useAuth()
  const { portfolioData } = usePortfolio(isConnected && hasValidSignature)
  const realMetrics = useRealPortfolioMetrics(portfolioData)

  if (portfolioData.isLoading) {
    return (
      <div>
        <div className="mb-1 text-base font-medium text-slate-200">Loading...</div>
        <div className="text-sm text-slate-400">Fetching portfolio data</div>
      </div>
    )
  }

  if (portfolioData.error) {
    return (
      <div>
        <div className="mb-1 text-base font-medium text-red-400">Error</div>
        <div className="text-sm text-slate-400">Failed to load portfolio</div>
      </div>
    )
  }

  return <>{getPortfolioCardContent(realMetrics, portfolioData)}</>
}

// Portfolio stack data factory using real data
export const createRealPortfolioStackData = (): PortfolioCardData => {
  return {
    id: 'portfolio',
    title: 'Portfolio Overview',
    color: 'border-purple-500',
    aiPriority: 'medium',
    category: 'overview',
    content: <RealPortfolioCardContent />,
  }
}

// Portfolio component for standalone usage
interface PortfolioProps {
  expanded?: boolean
  className?: string
}

const Portfolio: React.FC<PortfolioProps> = ({
  expanded = false,
  className = '',
}) => {
  const { address } = useAccount()
  // Read directly from store instead of props
  const portfolioData = useAppStore((state) => 
    address ? state.portfolio.cache[address.toLowerCase()] : undefined
  )
  const { refreshPortfolio } = usePortfolio(true)

  // Format currency values with smart decimal places based on value size
  const formatCurrency = (value: number) => {
    if (value === 0 || !value) return '$0.00'
    
    // Determine decimal places based on value size
    let decimals = 2
    if (value < 1) {
      decimals = 6  // Show 6 decimals for values less than $1
    } else if (value < 10) {
      decimals = 4  // Show 4 decimals for values less than $10
    } else if (value < 1000) {
      decimals = 3  // Show 3 decimals for values less than $1000
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  // If loading, show loading state
  if (!portfolioData || portfolioData.isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-lg border border-gray-700/40 bg-gray-800/40 p-6 ${className}`}>
        <div className="flex items-center space-x-2">
          <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-400" />
          <span className="text-lg font-medium text-gray-300">Loading portfolio data...</span>
        </div>
        <button
          onClick={refreshPortfolio}
          className="mt-4 rounded-lg bg-gray-700/30 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700/50"
        >
          Refresh
        </button>
      </div>
    )
  }

  // If error, show error state
  if (portfolioData.error) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-lg border border-red-700/40 bg-red-900/20 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-lg font-medium text-red-400 mb-2">Failed to load portfolio</div>
          <div className="text-sm text-red-300">{portfolioData.error}</div>
        </div>
        <button
          onClick={refreshPortfolio}
          className="mt-4 rounded-lg bg-red-700/30 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-700/50"
        >
          Try Again
        </button>
      </div>
    )
  }

  // If no data, show empty state
  if (!portfolioData.chains || Object.keys(portfolioData.chains).length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center rounded-lg border border-gray-700/40 bg-gray-800/40 p-6 ${className}`}>
        <div className="text-center">
          <div className="text-lg font-medium text-gray-300 mb-2">No portfolio data</div>
          <div className="text-sm text-gray-400">Deploy a vault to get started</div>
        </div>
        <button
          onClick={refreshPortfolio}
          className="mt-4 rounded-lg bg-gray-700/30 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700/50"
        >
          Refresh
        </button>
      </div>
    )
  }

  // Main portfolio view
  return (
    <div className={`rounded-lg border border-gray-700/40 bg-gray-800/40 ${className}`}>
      {/* Portfolio Header */}
      <div className="flex items-center justify-between border-b border-gray-700/30 p-6 pb-4">
        <h2 className="text-xl font-semibold text-white">Portfolio Overview</h2>
        <button
          onClick={refreshPortfolio}
          className="rounded-lg bg-gray-700/30 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-gray-700/50"
        >
          Refresh
        </button>
      </div>

      {/* Scrollable Portfolio Content */}
      <div className="max-h-[calc(100vh-200px)] overflow-y-auto p-6">
        {/* Chain Breakdown */}
        <div className="space-y-6">
        {portfolioData &&
          portfolioData.chains &&
          Object.entries(portfolioData.chains).map(([chainName, chainData]) => (
            <div key={chainName} className="rounded-lg border border-gray-700/30 bg-gray-800/30 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-medium text-white">{chainName}</h3>
                  <span className="text-sm text-gray-400">
                    ({formatCurrency(chainData.total_value_usd)})
                  </span>
                </div>
              </div>

              {/* Token List */}
              <div className="space-y-3">
                {Object.entries(chainData.tokens).map(([symbol, tokenData]) => (
                  <div key={symbol} className="flex items-center justify-between rounded-lg bg-gray-700/20 p-3">
                    <div className="flex items-center space-x-3">
                      <TokenIcon symbol={symbol} className="h-6 w-6" />
                      <div>
                        <div className="font-medium text-white">{symbol}</div>
                        <div className="text-sm text-gray-400">{tokenData.balance}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-white">{formatCurrency(tokenData.value_usd)}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Strategy List */}
              {chainData.strategies && Object.entries(chainData.strategies).length > 0 && (
                <div className="mt-4">
                  <h4 className="mb-3 text-sm font-medium text-gray-400">Active Strategies</h4>
                  <div className="space-y-3">
                    {Object.entries(chainData.strategies).map(([strategyId, strategyData]) => (
                      <div key={strategyId} className="rounded-lg border border-blue-500/20 bg-blue-500/10 p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-blue-400">{strategyData.protocol}</div>
                            <div className="text-sm text-gray-400">
                              {Object.entries(strategyData.tokens || {}).map(([symbol, tokenData]) => {
                                const balance = typeof tokenData === 'object' && tokenData?.balance 
                                  ? Number(tokenData.balance).toFixed(4) 
                                  : '0.0000'
                                return `${balance} ${symbol}`
                              }).join(', ')}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-white">{formatCurrency(strategyData.total_value_usd)}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Portfolio 