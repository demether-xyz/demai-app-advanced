import React from 'react'

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
export const getPortfolioExpandedContent = (metrics: PortfolioMetrics): React.ReactNode => {
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
          <div className="mt-1 text-xs text-emerald-300">Weighted Average</div>
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
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-slate-300">
              <div className="mr-2 h-3 w-3 rounded-full bg-purple-400"></div>
              DeFi Protocols
            </span>
            <span className="text-slate-200">
              68.4% (${Math.round(metrics.totalValue * 0.684).toLocaleString()})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-slate-300">
              <div className="mr-2 h-3 w-3 rounded-full bg-blue-400"></div>
              Staking
            </span>
            <span className="text-slate-200">
              21.2% (${Math.round(metrics.totalValue * 0.212).toLocaleString()})
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center text-sm text-slate-300">
              <div className="mr-2 h-3 w-3 rounded-full bg-emerald-400"></div>
              LP Positions
            </span>
            <span className="text-slate-200">
              10.4% (${Math.round(metrics.totalValue * 0.104).toLocaleString()})
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-slate-200">Performance (30d)</h4>
        <div className="rounded-lg bg-slate-800/30 p-3">
          <div className="flex h-20 items-end space-x-1">
            {[
              65, 68, 72, 69, 74, 71, 76, 78, 82, 79, 85, 83, 87, 89, 92, 88, 94, 91, 96, 98, 95, 99, 102, 100, 105, 107, 104, 108, 110,
              112,
            ].map((height, i) => (
              <div key={i} className="flex-1 rounded-sm bg-purple-400" style={{ height: `${(height - 60) * 1.5}px` }}></div>
            ))}
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>30d ago</span>
            <span>15d ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="font-medium text-slate-200">Risk Analysis</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Risk Score</span>
            <div className="font-medium text-emerald-400">{metrics.riskScore.toFixed(1)}/10</div>
            <div className="text-xs text-slate-400">Moderate Risk</div>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Diversification</span>
            <div className="font-medium text-blue-400">{metrics.diversificationScore.toFixed(1)}/10</div>
            <div className="text-xs text-slate-400">Well Diversified</div>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Correlation Risk</span>
            <div className="font-medium text-amber-400">Medium</div>
            <div className="text-xs text-slate-400">0.64 Avg</div>
          </div>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <span className="block text-slate-400">Max Drawdown</span>
            <div className="font-medium text-red-400">{metrics.maxDrawdown.toFixed(1)}%</div>
            <div className="text-xs text-slate-400">Last 90 Days</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Default portfolio metrics
export const defaultPortfolioMetrics: PortfolioMetrics = {
  totalValue: 124567,
  dailyChange: 1234,
  weeklyChange: 8921,
  avgAPY: 16.8,
  dailyYield: 2847,
  monthlyYield: 86210,
  riskScore: 7.2,
  diversificationScore: 8.5,
  maxDrawdown: -12.4,
}

// Portfolio stack data factory
export const createPortfolioStackData = (metrics: PortfolioMetrics = defaultPortfolioMetrics): PortfolioData => {
  return {
    id: 'portfolio',
    title: 'Portfolio Overview',
    color: 'border-purple-500',
    aiPriority: 'medium',
    category: 'overview',
    content: getPortfolioCardContent(metrics),
  }
}

// Portfolio component for standalone usage
interface PortfolioProps {
  metrics?: PortfolioMetrics
  expanded?: boolean
  className?: string
}

const Portfolio: React.FC<PortfolioProps> = ({ 
  metrics = defaultPortfolioMetrics, 
  expanded = false,
  className = ''
}) => {
  if (expanded) {
    return (
      <div className={`rounded-lg border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-6 ${className}`}>
        <h2 className="mb-4 text-lg font-medium text-slate-200">Portfolio Overview</h2>
        {getPortfolioExpandedContent(metrics)}
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-4 ${className}`}>
      <h3 className="mb-3 text-sm font-normal text-slate-200">Portfolio Overview</h3>
      {getPortfolioCardContent(metrics)}
    </div>
  )
}

export default Portfolio 