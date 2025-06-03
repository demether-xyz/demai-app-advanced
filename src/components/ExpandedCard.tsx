import React from 'react';
import { Rnd } from 'react-rnd';

interface ExpandedCardProps {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  color: string;
  aiPriority: 'high' | 'medium' | 'low';
  category: 'yield' | 'risk' | 'opportunity' | 'alert' | 'overview';
  position: 'center' | 'left-stack' | 'right-stack';
  collapsed: boolean;
  content: React.ReactNode;
  onDragStop: (id: string, x: number, y: number) => void;
  onResizeStop: (id: string, width: number, height: number, x: number, y: number) => void;
  onBringToFront: (id: string) => void;
  onCollapse: (id: string) => void;
}

// Detailed content for expanded cards
const getDetailedContent = (id: string): React.ReactNode => {
  const detailedContents: { [key: string]: React.ReactNode } = {
    'high-yield': (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-emerald-400 font-medium text-2xl mb-1">23.4% APY</div>
            <div className="text-slate-400 text-sm">Current Yield</div>
            <div className="text-emerald-300 text-xs mt-1">↗ +2.1% from last week</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-slate-200 font-medium text-xl mb-1">$78,432</div>
            <div className="text-slate-400 text-sm">TVL Available</div>
            <div className="text-blue-300 text-xs mt-1">87% Pool Utilization</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Yield Breakdown</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Base APY</span>
              <span className="text-slate-200">18.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">AAVE Rewards</span>
              <span className="text-emerald-400">3.8%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm">Bonus Multiplier</span>
              <span className="text-amber-400">1.4%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">30-Day Performance</h4>
          <div className="bg-slate-800/30 p-3 rounded-lg">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
            <div className="flex items-end space-x-1 h-16">
              <div className="bg-emerald-500 w-full h-12 rounded-sm"></div>
              <div className="bg-emerald-400 w-full h-14 rounded-sm"></div>
              <div className="bg-emerald-400 w-full h-16 rounded-sm"></div>
              <div className="bg-emerald-300 w-full h-14 rounded-sm"></div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Risk Metrics</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-400">Smart Contract Risk</span>
              <div className="text-emerald-400 font-medium">Low</div>
            </div>
            <div>
              <span className="text-slate-400">Liquidity Risk</span>
              <div className="text-amber-400 font-medium">Medium</div>
            </div>
            <div>
              <span className="text-slate-400">Impermanent Loss</span>
              <div className="text-emerald-400 font-medium">None</div>
            </div>
            <div>
              <span className="text-slate-400">Audit Score</span>
              <div className="text-emerald-400 font-medium">9.2/10</div>
            </div>
          </div>
        </div>
      </div>
    ),
    'portfolio': (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-slate-200 font-medium text-xl mb-1">$124,567</div>
            <div className="text-slate-400 text-sm">Total Value</div>
            <div className="text-emerald-400 text-xs mt-1">↗ +$8,921 (7d)</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-emerald-400 font-medium text-xl mb-1">16.8%</div>
            <div className="text-slate-400 text-sm">Avg APY</div>
            <div className="text-emerald-300 text-xs mt-1">Weighted Average</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-blue-400 font-medium text-xl mb-1">$2,847</div>
            <div className="text-slate-400 text-sm">Daily Yield</div>
            <div className="text-blue-300 text-xs mt-1">$86,210 (30d)</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Asset Allocation</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm flex items-center">
                <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                DeFi Protocols
              </span>
              <span className="text-slate-200">68.4% ($85,220)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm flex items-center">
                <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
                Staking
              </span>
              <span className="text-slate-200">21.2% ($26,408)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-300 text-sm flex items-center">
                <div className="w-3 h-3 bg-emerald-400 rounded-full mr-2"></div>
                LP Positions
              </span>
              <span className="text-slate-200">10.4% ($12,939)</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Performance (30d)</h4>
          <div className="bg-slate-800/30 p-3 rounded-lg">
            <div className="flex items-end space-x-1 h-20">
              {[65, 68, 72, 69, 74, 71, 76, 78, 82, 79, 85, 83, 87, 89, 92, 88, 94, 91, 96, 98, 95, 99, 102, 100, 105, 107, 104, 108, 110, 112].map((height, i) => (
                <div key={i} className="bg-purple-400 flex-1 rounded-sm" style={{height: `${(height - 60) * 1.5}px`}}></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>30d ago</span>
              <span>15d ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Risk Analysis</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Risk Score</span>
              <div className="text-emerald-400 font-medium">7.2/10</div>
              <div className="text-slate-400 text-xs">Moderate Risk</div>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Diversification</span>
              <div className="text-blue-400 font-medium">8.5/10</div>
              <div className="text-slate-400 text-xs">Well Diversified</div>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Correlation Risk</span>
              <div className="text-amber-400 font-medium">Medium</div>
              <div className="text-slate-400 text-xs">0.64 Avg</div>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Max Drawdown</span>
              <div className="text-red-400 font-medium">-12.4%</div>
              <div className="text-slate-400 text-xs">Last 90 Days</div>
            </div>
          </div>
        </div>
      </div>
    ),
    'risk-analysis': (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-red-400 font-medium text-2xl mb-1">High Risk</div>
            <div className="text-slate-400 text-sm">Current Assessment</div>
            <div className="text-red-300 text-xs mt-1">↗ +15% from last week</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-slate-200 font-medium text-xl mb-1">8.7/10</div>
            <div className="text-slate-400 text-sm">Risk Score</div>
            <div className="text-amber-300 text-xs mt-1">Above Threshold</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Risk Factors</h4>
          <div className="space-y-3">
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Smart Contract Risk</span>
                <span className="text-red-400 font-medium">9.2/10</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-red-400 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
              <div className="text-xs text-slate-400 mt-1">Unaudited code deployed 3 days ago</div>
            </div>
            
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Liquidity Risk</span>
                <span className="text-amber-400 font-medium">6.8/10</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full" style={{width: '68%'}}></div>
              </div>
              <div className="text-xs text-slate-400 mt-1">Low trading volume, high slippage</div>
            </div>

            <div className="bg-slate-800/30 p-3 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-slate-300 text-sm">Market Risk</span>
                <span className="text-red-400 font-medium">8.5/10</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-red-400 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              <div className="text-xs text-slate-400 mt-1">High correlation with volatile assets</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Risk Timeline (7d)</h4>
          <div className="bg-slate-800/30 p-3 rounded-lg">
            <div className="flex items-end space-x-1 h-16">
              {[5.2, 5.8, 6.1, 7.3, 8.2, 8.7, 8.9].map((height, i) => (
                <div key={i} className="bg-red-400 flex-1 rounded-sm" style={{height: `${height * 7}px`}}></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Exposure Breakdown</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Terra Luna Classic</span>
              <div className="text-red-400 font-medium">$23,450</div>
              <div className="text-red-300 text-xs">-89% (24h)</div>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Exposure %</span>
              <div className="text-red-400 font-medium">18.8%</div>
              <div className="text-slate-400 text-xs">of portfolio</div>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Max Loss</span>
              <div className="text-red-400 font-medium">$21,003</div>
              <div className="text-slate-400 text-xs">Worst case</div>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Time to Exit</span>
              <div className="text-amber-400 font-medium">2.3 days</div>
              <div className="text-slate-400 text-xs">Est. liquidity</div>
            </div>
          </div>
        </div>
      </div>
    ),
    'ai-strategy': (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-cyan-400 font-medium text-2xl mb-1">+$10,234</div>
            <div className="text-slate-400 text-sm">Annual Projection</div>
            <div className="text-cyan-300 text-xs mt-1">3-Step Rebalance Plan</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-slate-200 font-medium text-xl mb-1">94.7%</div>
            <div className="text-slate-400 text-sm">AI Confidence</div>
            <div className="text-emerald-300 text-xs mt-1">High Probability</div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Recommended Actions</h4>
          <div className="space-y-3">
            <div className="bg-slate-800/30 p-4 rounded-lg border-l-4 border-cyan-400">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-slate-200 font-medium text-sm">Step 1: Rebalance AAVE</div>
                  <div className="text-slate-400 text-xs">Move 40% to Compound ETH</div>
                </div>
                <div className="text-cyan-400 text-sm font-medium">+$3,124/yr</div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div className="bg-cyan-400 h-2 rounded-full" style={{width: '85%'}}></div>
              </div>
              <div className="text-xs text-slate-400">Risk: Low | Time: 2 hours | Gas: ~$45</div>
            </div>

            <div className="bg-slate-800/30 p-4 rounded-lg border-l-4 border-blue-400">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-slate-200 font-medium text-sm">Step 2: Add Curve LP</div>
                  <div className="text-slate-400 text-xs">$25K to 3Pool position</div>
                </div>
                <div className="text-blue-400 text-sm font-medium">+$4,890/yr</div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{width: '78%'}}></div>
              </div>
              <div className="text-xs text-slate-400">Risk: Medium | Time: 30 min | Gas: ~$67</div>
            </div>

            <div className="bg-slate-800/30 p-4 rounded-lg border-l-4 border-purple-400">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-slate-200 font-medium text-sm">Step 3: Optimize UNI V4</div>
                  <div className="text-slate-400 text-xs">Narrow price range</div>
                </div>
                <div className="text-purple-400 text-sm font-medium">+$2,220/yr</div>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
              <div className="text-xs text-slate-400">Risk: High | Time: 45 min | Gas: ~$89</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Strategy Performance</h4>
          <div className="bg-slate-800/30 p-3 rounded-lg">
            <div className="flex justify-between mb-3">
              <span className="text-slate-200 font-medium">Backtested Results</span>
              <span className="text-emerald-400 text-sm">+47.3% vs Hodl</span>
            </div>
            <div className="flex items-end space-x-1 h-16">
              {[100, 105, 108, 112, 118, 115, 122, 128, 135, 132, 138, 142, 147, 144, 150, 156, 162, 159, 165, 171].map((height, i) => (
                <div key={i} className="bg-cyan-400 flex-1 rounded-sm" style={{height: `${(height - 95) * 2}px`}}></div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>20 weeks ago</span>
              <span>10 weeks ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-slate-200 font-medium">Market Analysis</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Market Sentiment</span>
              <div className="text-emerald-400 font-medium">Bullish</div>
              <div className="text-slate-400 text-xs">Fear & Greed: 76</div>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Volatility Index</span>
              <div className="text-amber-400 font-medium">Medium</div>
              <div className="text-slate-400 text-xs">VIX: 24.3</div>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Trend Strength</span>
              <div className="text-cyan-400 font-medium">Strong</div>
              <div className="text-slate-400 text-xs">RSI: 68.4</div>
            </div>
            <div className="bg-slate-800/30 p-3 rounded-lg">
              <span className="text-slate-400 block">Execution Window</span>
              <div className="text-emerald-400 font-medium">Open</div>
              <div className="text-slate-400 text-xs">Next 72 hours</div>
            </div>
          </div>
        </div>
      </div>
    )
  };

  return detailedContents[id] || null;
};

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
  onCollapse
}) => {
  // Use detailed content if available, otherwise fall back to original content
  const displayContent = position === 'center' ? (getDetailedContent(id) || content) : content;

  return (
    <Rnd
      key={id}
      size={{ width, height }}
      position={{ x, y }}
      onDragStop={(e: any, d: any) => {
        onDragStop(id, d.x, d.y);
      }}
      onResizeStop={(e: any, direction: any, ref: any, delta: any, position: any) => {
        onResizeStop(id, ref.offsetWidth, ref.offsetHeight, position.x, position.y);
      }}
      onDragStart={() => {
        onBringToFront(id);
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
      }}
    >
      <div
        className={`h-full w-full bg-slate-900/90 border border-slate-700/40 rounded-xl backdrop-blur-md ${collapsed ? 'cursor-pointer hover:bg-slate-800/90' : ''}`}
        onClick={() => onBringToFront(id)}
        style={{
          boxShadow: position === 'center'
            ? `0 8px 32px rgba(0, 0, 0, 0.4)`
            : `0 4px 16px rgba(0, 0, 0, 0.3)`,
        }}
      >
        {/* Clean Title Bar */}
        <div
          className={`drag-handle border-b border-slate-700/30 p-4 cursor-move bg-slate-800/50 rounded-t-xl select-none flex items-center justify-between`}
        >
          <div className="flex items-center space-x-3">
            {/* AI Priority Indicator */}
            <div className={`w-2 h-2 rounded-full ${
              aiPriority === 'high' ? 'bg-emerald-400' :
              aiPriority === 'medium' ? 'bg-amber-400' : 'bg-slate-400'
            }`}></div>
            
            {/* Title */}
            <h3 className={`text-slate-200 font-normal ${collapsed ? 'text-sm' : 'text-base'}`}>
              {title}
            </h3>
            
            {/* Category Badge */}
            {category !== 'overview' && (
              <div className={`px-2 py-1 rounded-md text-xs font-normal ${
                category === 'yield' ? 'bg-emerald-900/40 text-emerald-300' :
                category === 'risk' ? 'bg-red-900/40 text-red-300' :
                category === 'opportunity' ? 'bg-blue-900/40 text-blue-300' :
                category === 'alert' ? 'bg-amber-900/40 text-amber-300' :
                'bg-slate-700/40 text-slate-300'
              }`}>
                {category.toUpperCase()}
              </div>
            )}
          </div>
          
          {/* Window Controls */}
          <div className="flex items-center space-x-3">
            {/* AI Confidence */}
            <div className="text-xs text-slate-400">
              AI: {aiPriority === 'high' ? '95%' : aiPriority === 'medium' ? '85%' : '75%'}
            </div>
            
            {!collapsed && (
              <button 
                className="px-2 py-1 bg-slate-700/60 hover:bg-slate-600/60 rounded text-xs text-slate-300 hover:text-slate-200 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onCollapse(id);
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
          <div className="h-full bg-slate-800/30 rounded-lg p-4 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
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
          <div className="absolute bottom-3 right-3 text-slate-400 text-xs flex items-center space-x-1">
            <span>EXPAND</span>
            <span>▶</span>
          </div>
        )}
      </div>
    </Rnd>
  );
};

export default ExpandedCard; 