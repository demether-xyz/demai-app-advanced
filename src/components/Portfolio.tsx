import React from 'react'
import { usePortfolio } from '../hooks/usePortfolio'
import { useAccount } from 'wagmi'
import { useAuth } from '../hooks/useAuth'

export interface PortfolioData {
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
export const getPortfolioCardContent = (metrics: PortfolioMetrics): React.ReactNode => {
  return (
    <div>
      <div className="mb-1 text-base font-medium text-slate-200">
        ${metrics.totalValue.toLocaleString()}
      </div>
      <div className="text-sm text-slate-400">Total Portfolio Value</div>
      <div className="mt-1 text-xs text-emerald-400">
        ↗ +${Math.abs(metrics.weeklyChange).toLocaleString()} (7d)
      </div>
    </div>
  )
}

// Portfolio expanded content for window state
export const getPortfolioExpandedContent = (metrics: PortfolioMetrics, portfolioData: any): React.ReactNode => {
  // Ensure portfolioData exists and has default values
  const safePortfolioData = portfolioData || {
    holdings: [],
    total_value_usd: 0,
    active_strategies: [],
    tokens_count: 0,
    chains_count: 0,
    strategy_count: 0
  }

  // Calculate actual asset allocation from holdings
  const defiValue = safePortfolioData.holdings
    ?.filter((h: any) => h.type === 'strategy')
    .reduce((sum: number, h: any) => sum + h.value_usd, 0) || 0
  
  const tokenValue = safePortfolioData.holdings
    ?.filter((h: any) => h.type === 'token')
    .reduce((sum: number, h: any) => sum + h.value_usd, 0) || 0
  
  const lpValue = safePortfolioData.holdings
    ?.filter((h: any) => h.type === 'lp')
    .reduce((sum: number, h: any) => sum + h.value_usd, 0) || 0

  const totalValue = safePortfolioData.total_value_usd || 0
  const defiPercent = totalValue > 0 ? (defiValue / totalValue) * 100 : 0
  const tokenPercent = totalValue > 0 ? (tokenValue / totalValue) * 100 : 0
  const lpPercent = totalValue > 0 ? (lpValue / totalValue) * 100 : 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-slate-800/50 p-4">
          <div className="mb-1 text-xl font-medium text-slate-200">
            ${metrics.totalValue.toLocaleString()}
          </div>
          <div className="text-sm text-slate-400">Total Value</div>
          <div className="mt-1 text-xs text-emerald-400">
            ↗ +${Math.abs(metrics.weeklyChange).toLocaleString()} (7d)
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

      <div className="space-y-3">
        <h4 className="font-medium text-slate-200">Asset Allocation</h4>
        <div className="space-y-2">
          {defiValue > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center text-sm text-slate-300">
                <div className="mr-2 h-3 w-3 rounded-full bg-purple-400"></div>
                Strategy Positions
              </span>
              <span className="text-slate-200">
                {defiPercent.toFixed(1)}% (${defiValue.toLocaleString()})
              </span>
            </div>
          )}
          {tokenValue > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center text-sm text-slate-300">
                <div className="mr-2 h-3 w-3 rounded-full bg-blue-400"></div>
                Token Holdings
              </span>
              <span className="text-slate-200">
                {tokenPercent.toFixed(1)}% (${tokenValue.toLocaleString()})
              </span>
            </div>
          )}
          {lpValue > 0 && (
            <div className="flex items-center justify-between">
              <span className="flex items-center text-sm text-slate-300">
                <div className="mr-2 h-3 w-3 rounded-full bg-emerald-400"></div>
                LP Positions
              </span>
              <span className="text-slate-200">
                {lpPercent.toFixed(1)}% (${lpValue.toLocaleString()})
              </span>
            </div>
          )}
          {totalValue === 0 && (
            <div className="text-sm text-slate-400">No assets found</div>
          )}
        </div>
      </div>

              <div className="space-y-3">
        <h4 className="font-medium text-slate-200">Active Strategies</h4>
        <div className="space-y-2">
          {safePortfolioData.active_strategies?.length > 0 ? (
            safePortfolioData.active_strategies.map((strategy: any, index: number) => (
              <div key={index} className="flex items-center justify-between rounded-lg bg-slate-800/30 p-3">
                <div>
                  <div className="text-sm font-medium text-slate-200">{strategy.name || 'Strategy'}</div>
                  <div className="text-xs text-slate-400">{strategy.protocol || 'Unknown Protocol'}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-emerald-400">
                    ${(strategy.value_usd || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-400">
                    {strategy.apy ? `${strategy.apy.toFixed(1)}% APY` : 'APY N/A'}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-slate-400">No active strategies</div>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-slate-200">Portfolio Stats</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Total Assets</span>
            <div className="font-medium text-blue-400">{safePortfolioData.tokens_count || 0}</div>
            <div className="text-xs text-slate-400">Tokens</div>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Chains</span>
            <div className="font-medium text-emerald-400">{safePortfolioData.chains_count || 0}</div>
            <div className="text-xs text-slate-400">Networks</div>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Strategies</span>
            <div className="font-medium text-purple-400">{safePortfolioData.strategy_count || 0}</div>
            <div className="text-xs text-slate-400">Active</div>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Risk Score</span>
            <div className="font-medium text-amber-400">{metrics.riskScore.toFixed(1)}/10</div>
            <div className="text-xs text-slate-400">Estimated</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Convert real portfolio data to Portfolio component metrics
export const useRealPortfolioMetrics = (): PortfolioMetrics => {
  const { isConnected } = useAccount()
  const { hasValidSignature } = useAuth()
  const { portfolioData } = usePortfolio(isConnected && hasValidSignature)

  if (portfolioData.isLoading || portfolioData.error || portfolioData.total_value_usd === 0) {
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

  // Calculate estimated APY based on strategy value (simplified calculation)
  const estimatedAPY = portfolioData.strategy_value_usd > 0 ? 
    ((portfolioData.strategy_value_usd / portfolioData.total_value_usd) * 18.5) + 3.2 : 5.2

  // Calculate daily yield based on APY
  const dailyYield = (portfolioData.total_value_usd * estimatedAPY / 100) / 365

  return {
    totalValue: portfolioData.total_value_usd,
    dailyChange: dailyYield, // Use daily yield as daily change for now
    weeklyChange: dailyYield * 7, // Weekly change based on daily yield
    avgAPY: estimatedAPY,
    dailyYield: dailyYield,
    monthlyYield: dailyYield * 30,
    riskScore: portfolioData.strategy_count > 0 ? 6.8 : 8.2, // Lower risk with strategies
    diversificationScore: Math.min(9.5, portfolioData.tokens_count * 1.2 + portfolioData.chains_count * 0.8),
    maxDrawdown: portfolioData.strategy_count > 0 ? -8.4 : -15.2, // Better drawdown with strategies
  }
}

// Portfolio card content component that uses real data
export const RealPortfolioCardContent: React.FC = () => {
  const realMetrics = useRealPortfolioMetrics()
  const { isConnected } = useAccount()
  const { hasValidSignature } = useAuth()
  const { portfolioData } = usePortfolio(isConnected && hasValidSignature)

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

  return <>{getPortfolioCardContent(realMetrics)}</>
}

// Portfolio stack data factory using real data
export const createRealPortfolioStackData = (): PortfolioData => {
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
  className = ''
}) => {
  const { isConnected } = useAccount()
  const { hasValidSignature } = useAuth()
  const { portfolioData } = usePortfolio(isConnected && hasValidSignature)
  const realMetrics = useRealPortfolioMetrics()

  if (portfolioData.isLoading) {
    return (
      <div className={`rounded-lg border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-6 ${className}`}>
        <h2 className="mb-4 text-lg font-medium text-slate-200">Portfolio Overview</h2>
        <div className="text-slate-400">Loading portfolio data...</div>
      </div>
    )
  }

  if (portfolioData.error) {
    return (
      <div className={`rounded-lg border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-6 ${className}`}>
        <h2 className="mb-4 text-lg font-medium text-slate-200">Portfolio Overview</h2>
        <div className="text-red-400">Error: {portfolioData.error}</div>
      </div>
    )
  }

  if (expanded) {
    return (
      <div className={`rounded-lg border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-6 ${className}`}>
        <h2 className="mb-4 text-lg font-medium text-slate-200">Portfolio Overview</h2>
        {getPortfolioExpandedContent(realMetrics, portfolioData)}
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-normal text-slate-200">Portfolio Overview</h3>
      {getPortfolioCardContent(realMetrics)}
    </div>
  )
}

export default Portfolio 