import React from 'react'
import { Rnd } from 'react-rnd'
import { getPortfolioExpandedContent, useRealPortfolioMetrics, defaultPortfolioMetrics } from './Portfolio'

// Portfolio content component that can use hooks
const PortfolioExpandedContent: React.FC = () => {
  const realMetrics = useRealPortfolioMetrics()
  return <>{getPortfolioExpandedContent(realMetrics)}</>
}

interface ExpandedCardProps {
  id: string
  title: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  color: string
  aiPriority: 'high' | 'medium' | 'low'
  category: 'yield' | 'risk' | 'opportunity' | 'alert' | 'overview'
  position: 'center' | 'left-stack' | 'right-stack'
  collapsed: boolean
  content: React.ReactNode
  onDragStop: (id: string, x: number, y: number) => void
  onResizeStop: (id: string, width: number, height: number, x: number, y: number) => void
  onBringToFront: (id: string) => void
  onCollapse: (id: string) => void
  style?: React.CSSProperties
}

// Detailed content for expanded cards
const getDetailedContent = (id: string): React.ReactNode => {
  const detailedContents: { [key: string]: React.ReactNode } = {
    'high-yield': (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-800/50 p-4">
            <div className="mb-1 text-2xl font-medium text-emerald-400">23.4% APY</div>
            <div className="text-sm text-slate-400">Current Yield</div>
            <div className="mt-1 text-xs text-emerald-300">↗ +2.1% from last week</div>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4">
            <div className="mb-1 text-xl font-medium text-slate-200">$78,432</div>
            <div className="text-sm text-slate-400">TVL Available</div>
            <div className="mt-1 text-xs text-blue-300">87% Pool Utilization</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-200">Yield Breakdown</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Base APY</span>
              <span className="text-slate-200">18.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">AAVE Rewards</span>
              <span className="text-emerald-400">3.8%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-300">Bonus Multiplier</span>
              <span className="text-amber-400">1.4%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-200">30-Day Performance</h4>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <div className="mb-2 flex justify-between text-xs text-slate-400">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
            <div className="flex h-16 items-end space-x-1">
              <div className="h-12 w-full rounded-sm bg-emerald-500"></div>
              <div className="h-14 w-full rounded-sm bg-emerald-400"></div>
              <div className="h-16 w-full rounded-sm bg-emerald-400"></div>
              <div className="h-14 w-full rounded-sm bg-emerald-300"></div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-200">Risk Metrics</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400">Smart Contract Risk</span>
              <div className="font-medium text-emerald-400">Low</div>
            </div>
            <div>
              <span className="text-slate-400">Liquidity Risk</span>
              <div className="font-medium text-amber-400">Medium</div>
            </div>
            <div>
              <span className="text-slate-400">Impermanent Loss</span>
              <div className="font-medium text-emerald-400">None</div>
            </div>
            <div>
              <span className="text-slate-400">Audit Score</span>
              <div className="font-medium text-emerald-400">9.2/10</div>
            </div>
          </div>
        </div>
      </div>
    ),
    portfolio: <PortfolioExpandedContent />,
    'risk-analysis': (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-800/50 p-4">
            <div className="mb-1 text-2xl font-medium text-red-400">High Risk</div>
            <div className="text-sm text-slate-400">Current Assessment</div>
            <div className="mt-1 text-xs text-red-300">↗ +15% from last week</div>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4">
            <div className="mb-1 text-xl font-medium text-slate-200">8.7/10</div>
            <div className="text-sm text-slate-400">Risk Score</div>
            <div className="mt-1 text-xs text-amber-300">Above Threshold</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-200">Risk Factors</h4>
          <div className="space-y-3">
            <div className="rounded-lg bg-slate-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-300">Smart Contract Risk</span>
                <span className="font-medium text-red-400">9.2/10</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-red-400" style={{ width: '92%' }}></div>
              </div>
              <div className="mt-1 text-xs text-slate-400">Unaudited code deployed 3 days ago</div>
            </div>

            <div className="rounded-lg bg-slate-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-300">Liquidity Risk</span>
                <span className="font-medium text-amber-400">6.8/10</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-amber-400" style={{ width: '68%' }}></div>
              </div>
              <div className="mt-1 text-xs text-slate-400">Low trading volume, high slippage</div>
            </div>

            <div className="rounded-lg bg-slate-800/30 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm text-slate-300">Market Risk</span>
                <span className="font-medium text-red-400">8.5/10</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-red-400" style={{ width: '85%' }}></div>
              </div>
              <div className="mt-1 text-xs text-slate-400">High correlation with volatile assets</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-200">Risk Timeline (7d)</h4>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <div className="flex h-16 items-end space-x-1">
              {[5.2, 5.8, 6.1, 7.3, 8.2, 8.7, 8.9].map((height, i) => (
                <div key={i} className="flex-1 rounded-sm bg-red-400" style={{ height: `${height * 7}px` }}></div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-200">Exposure Breakdown</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-800/30 p-3">
              <span className="block text-slate-400">Terra Luna Classic</span>
              <div className="font-medium text-red-400">$23,450</div>
              <div className="text-xs text-red-300">-89% (24h)</div>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-3">
              <span className="block text-slate-400">Exposure %</span>
              <div className="font-medium text-red-400">18.8%</div>
              <div className="text-xs text-slate-400">of portfolio</div>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-3">
              <span className="block text-slate-400">Max Loss</span>
              <div className="font-medium text-red-400">$21,003</div>
              <div className="text-xs text-slate-400">Worst case</div>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-3">
              <span className="block text-slate-400">Time to Exit</span>
              <div className="font-medium text-amber-400">2.3 days</div>
              <div className="text-xs text-slate-400">Est. liquidity</div>
            </div>
          </div>
        </div>
      </div>
    ),
    'ai-strategy': (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-slate-800/50 p-4">
            <div className="mb-1 text-2xl font-medium text-cyan-400">+$10,234</div>
            <div className="text-sm text-slate-400">Annual Projection</div>
            <div className="mt-1 text-xs text-cyan-300">3-Step Rebalance Plan</div>
          </div>
          <div className="rounded-lg bg-slate-800/50 p-4">
            <div className="mb-1 text-xl font-medium text-slate-200">94.7%</div>
            <div className="text-sm text-slate-400">AI Confidence</div>
            <div className="mt-1 text-xs text-emerald-300">High Probability</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-200">Recommended Actions</h4>
          <div className="space-y-3">
            <div className="rounded-lg border-l-4 border-cyan-400 bg-slate-800/30 p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-200">Step 1: Rebalance AAVE</div>
                  <div className="text-xs text-slate-400">Move 40% to Compound ETH</div>
                </div>
                <div className="text-sm font-medium text-cyan-400">+$3,124/yr</div>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-cyan-400" style={{ width: '85%' }}></div>
              </div>
              <div className="text-xs text-slate-400">Risk: Low | Time: 2 hours | Gas: ~$45</div>
            </div>

            <div className="rounded-lg border-l-4 border-blue-400 bg-slate-800/30 p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-200">Step 2: Add Curve LP</div>
                  <div className="text-xs text-slate-400">$25K to 3Pool position</div>
                </div>
                <div className="text-sm font-medium text-blue-400">+$4,890/yr</div>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-blue-400" style={{ width: '78%' }}></div>
              </div>
              <div className="text-xs text-slate-400">Risk: Medium | Time: 30 min | Gas: ~$67</div>
            </div>

            <div className="rounded-lg border-l-4 border-purple-400 bg-slate-800/30 p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-200">Step 3: Optimize UNI V4</div>
                  <div className="text-xs text-slate-400">Narrow price range</div>
                </div>
                <div className="text-sm font-medium text-purple-400">+$2,220/yr</div>
              </div>
              <div className="mb-2 h-2 w-full rounded-full bg-slate-700">
                <div className="h-2 rounded-full bg-purple-400" style={{ width: '92%' }}></div>
              </div>
              <div className="text-xs text-slate-400">Risk: High | Time: 45 min | Gas: ~$89</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-200">Strategy Performance</h4>
          <div className="rounded-lg bg-slate-800/30 p-3">
            <div className="mb-3 flex justify-between">
              <span className="font-medium text-slate-200">Backtested Results</span>
              <span className="text-sm text-emerald-400">+47.3% vs Hodl</span>
            </div>
            <div className="flex h-16 items-end space-x-1">
              {[100, 105, 108, 112, 118, 115, 122, 128, 135, 132, 138, 142, 147, 144, 150, 156, 162, 159, 165, 171].map((height, i) => (
                <div key={i} className="flex-1 rounded-sm bg-cyan-400" style={{ height: `${(height - 95) * 2}px` }}></div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-slate-400">
              <span>20 weeks ago</span>
              <span>10 weeks ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-slate-200">Market Analysis</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-slate-800/30 p-3">
              <span className="block text-slate-400">Market Sentiment</span>
              <div className="font-medium text-emerald-400">Bullish</div>
              <div className="text-xs text-slate-400">Fear & Greed: 76</div>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-3">
              <span className="block text-slate-400">Volatility Index</span>
              <div className="font-medium text-amber-400">Medium</div>
              <div className="text-xs text-slate-400">VIX: 24.3</div>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-3">
              <span className="block text-slate-400">Trend Strength</span>
              <div className="font-medium text-cyan-400">Strong</div>
              <div className="text-xs text-slate-400">RSI: 68.4</div>
            </div>
            <div className="rounded-lg bg-slate-800/30 p-3">
              <span className="block text-slate-400">Execution Window</span>
              <div className="font-medium text-emerald-400">Open</div>
              <div className="text-xs text-slate-400">Next 72 hours</div>
            </div>
          </div>
        </div>
      </div>
    ),
  }

  return detailedContents[id] || null
}

const ExpandedCard: React.FC<ExpandedCardProps> = ({
  id,
  title,
  x,
  y,
  width,
  height,
  zIndex,
  color,
  aiPriority,
  category,
  position,
  collapsed,
  content,
  onDragStop,
  onResizeStop,
  onBringToFront,
  onCollapse,
  style,
}) => {
  // Use detailed content if available, otherwise fall back to original content
  const displayContent = position === 'center' ? getDetailedContent(id) || content : content

  return (
    <Rnd
      key={id}
      size={{ width, height }}
      position={{ x, y }}
      onDragStop={(e: any, d: any) => {
        onDragStop(id, d.x, d.y)
      }}
      onResizeStop={(e: any, direction: any, ref: any, delta: any, position: any) => {
        onResizeStop(id, ref.offsetWidth, ref.offsetHeight, position.x, position.y)
      }}
      onDragStart={() => {
        onBringToFront(id)
      }}
      dragHandleClassName="drag-handle"
      bounds="parent"
      minWidth={collapsed ? 300 : 400}
      minHeight={collapsed ? 100 : 300}
      disableDragging={collapsed}
      enableResizing={!collapsed}
      dragGrid={[5, 5]}
      resizeGrid={[5, 5]}
      style={{
        zIndex,
        ...style,
      }}
    >
      <div
        className={`h-full w-full rounded-xl border border-slate-700/40 bg-slate-900/90 backdrop-blur-md ${collapsed ? 'cursor-pointer hover:bg-slate-800/90' : ''}`}
        onClick={() => onBringToFront(id)}
        style={{
          boxShadow: position === 'center' ? `0 8px 32px rgba(0, 0, 0, 0.4)` : `0 4px 16px rgba(0, 0, 0, 0.3)`,
        }}
      >
        {/* Clean Title Bar */}
        <div
          className={`drag-handle flex cursor-move items-center justify-between rounded-t-xl border-b border-slate-700/30 bg-slate-800/50 p-4 select-none`}
        >
          <div className="flex items-center space-x-3">
            {/* AI Priority Indicator */}
            <div
              className={`h-2 w-2 rounded-full ${
                aiPriority === 'high' ? 'bg-emerald-400' : aiPriority === 'medium' ? 'bg-amber-400' : 'bg-slate-400'
              }`}
            ></div>

            {/* Title */}
            <h3 className={`font-normal text-slate-200 ${collapsed ? 'text-sm' : 'text-base'}`}>{title}</h3>

            {/* Category Badge */}
            {category !== 'overview' && (
              <div
                className={`rounded-md px-2 py-1 text-xs font-normal ${
                  category === 'yield'
                    ? 'bg-emerald-900/40 text-emerald-300'
                    : category === 'risk'
                      ? 'bg-red-900/40 text-red-300'
                      : category === 'opportunity'
                        ? 'bg-blue-900/40 text-blue-300'
                        : category === 'alert'
                          ? 'bg-amber-900/40 text-amber-300'
                          : 'bg-slate-700/40 text-slate-300'
                }`}
              >
                {category.toUpperCase()}
              </div>
            )}
          </div>

          {/* Window Controls */}
          <div className="flex items-center space-x-3">
            {/* AI Confidence */}
            <div className="text-xs text-slate-400">AI: {aiPriority === 'high' ? '95%' : aiPriority === 'medium' ? '85%' : '75%'}</div>

            {!collapsed && (
              <button
                className="rounded bg-slate-700/60 px-2 py-1 text-xs text-slate-300 transition-colors hover:bg-slate-600/60 hover:text-slate-200"
                onClick={(e) => {
                  e.stopPropagation()
                  onCollapse(id)
                }}
                title="Collapse"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Window Content */}
        <div className={`overflow-hidden p-4 ${collapsed ? 'h-[calc(100%-4rem)]' : 'h-[calc(100%-5rem)]'}`}>
          <div
            className="h-full overflow-y-auto rounded-lg bg-slate-800/30 p-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            {displayContent}
          </div>
        </div>

        {/* Expand Indicator for Collapsed Cards */}
        {collapsed && (
          <div className="absolute right-3 bottom-3 flex items-center space-x-1 text-xs text-slate-400">
            <span>EXPAND</span>
            <span>▶</span>
          </div>
        )}
      </div>
    </Rnd>
  )
}

export default ExpandedCard
