import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { Rnd } from 'react-rnd'
import SideTabButton from './SideTabButton'
import WindowToolbar from './WindowToolbar'
import DashboardCard from './DashboardCard'
import ExpandedCard from './ExpandedCard'
import { useEvent } from '../hooks/useEvents'
import { useAppStore } from '../store'
import { createRealPortfolioStackData } from './Portfolio'

// Protocol Icons Component
const ProtocolIcon = ({ name, className = 'w-4 h-4' }: { name: string; className?: string }): React.ReactElement => {
  const iconMap: { [key: string]: React.ReactElement } = {
    aave: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <path
          d="M16 32C7.163 32 0 24.837 0 16S7.163 0 16 0s16 7.163 16 16-7.163 16-16 16zm-3.884-17.596L16 4l3.884 10.404-3.884 1.544-3.884-1.544z"
          fill="#B6509E"
        />
      </svg>
    ),
    compound: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#00D395" />
        <path
          d="M16 4a12 12 0 1 0 12 12A12 12 0 0 0 16 4zm5.6 8.8a1.6 1.6 0 0 1-1.6 1.6H12a1.6 1.6 0 0 1 0-3.2h8a1.6 1.6 0 0 1 1.6 1.6zm0 4a1.6 1.6 0 0 1-1.6 1.6H12a1.6 1.6 0 0 1 0-3.2h8a1.6 1.6 0 0 1 1.6 1.6z"
          fill="#fff"
        />
      </svg>
    ),
    curve: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#40DBD0" />
        <path d="M8 16c0-4.4 3.6-8 8-8s8 3.6 8 8-3.6 8-8 8-8-3.6-8-8z" fill="#fff" />
      </svg>
    ),
    uniswap: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#FF007A" />
        <path d="M16 4L8 20h16L16 4z" fill="#fff" />
      </svg>
    ),
    yearn: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#0074D9" />
        <path d="M16 8l8 8-8 8-8-8 8-8z" fill="#fff" />
      </svg>
    ),
    balancer: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#1e1e1e" />
        <path d="M12 8h8v16h-8V8z" fill="#fff" />
      </svg>
    ),
    convex: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#FF6B35" />
        <path d="M8 12h16v8H8v-8z" fill="#fff" />
      </svg>
    ),
    sushiswap: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#FA52A0" />
        <path d="M16 6l6 10-6 10L10 16 16 6z" fill="#fff" />
      </svg>
    ),
    makerdao: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#1AAB9B" />
        <path d="M8 24V8l8 8 8-8v16l-8-8-8 8z" fill="#fff" />
      </svg>
    ),
    rocketpool: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#FF6B4A" />
        <path d="M16 6l8 12H8l8-12z" fill="#fff" />
      </svg>
    ),
    frax: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#000" />
        <path d="M10 10h12v12H10V10z" fill="#fff" />
      </svg>
    ),
    lido: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#00A3FF" />
        <path d="M16 4l8 16H8l8-16z" fill="#fff" />
      </svg>
    ),
    gmx: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#4F46E5" />
        <rect x="8" y="12" width="16" height="8" fill="#fff" />
      </svg>
    ),
    pendle: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#FF6B6B" />
        <circle cx="16" cy="16" r="8" fill="#fff" />
      </svg>
    ),
    tokemak: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#00E5FF" />
        <path d="M12 12h8v8h-8v-8z" fill="#fff" />
      </svg>
    ),
    ethereum: (
      <svg className={className} viewBox="0 0 32 32" fill="currentColor">
        <circle cx="16" cy="16" r="16" fill="#627EEA" />
        <path d="M16 4v10l8-4-8-6zm0 11v9l8-12-8 3z" fill="#fff" />
      </svg>
    ),
    // Default icon for unknown protocols
    default: (
      <div className={`${className} flex items-center justify-center rounded-full bg-gray-600`}>
        <span className="text-xs text-white">?</span>
      </div>
    ),
  }

  return iconMap[name] || iconMap.default
}

interface WindowData {
  id: string
  title: string
  icon?: string
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
  style?: React.CSSProperties
}

interface StackData {
  id: string
  title: string
  icon?: string
  color: string
  aiPriority: 'high' | 'medium' | 'low'
  category: 'yield' | 'risk' | 'opportunity' | 'alert' | 'overview'
  content: React.ReactNode
}

const WireframeOverlay = () => {
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1400)
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800)

  // Update viewport dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth)
      setViewportHeight(window.innerHeight)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Left stack data - Opportunities & Portfolio (20 cards)
  const leftStackData: StackData[] = [
    {
      id: 'high-yield',
      title: 'High Yield Opportunities',
      icon: 'aave',
      color: 'border-green-500',
      aiPriority: 'high',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">23.4% APY</div>
          <div className="text-sm text-slate-400">Aave USDC Pool</div>
        </div>
      ),
    },
    {
      id: 'compound-eth',
      title: 'Compound ETH Pool',
      icon: 'compound',
      color: 'border-green-400',
      aiPriority: 'high',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">18.7% APY</div>
          <div className="text-sm text-slate-400">Compound ETH</div>
        </div>
      ),
    },
    {
      id: 'curve-3pool',
      title: 'Curve 3Pool Stable',
      icon: 'curve',
      color: 'border-blue-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">15.2% APY</div>
          <div className="text-sm text-slate-400">Curve Stablecoin Pool</div>
        </div>
      ),
    },
    {
      id: 'uniswap-v4',
      title: 'Uniswap V4 Pools',
      icon: 'uniswap',
      color: 'border-purple-500',
      aiPriority: 'high',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">21.8% APY</div>
          <div className="text-sm text-slate-400">UNI V4 Liquidity</div>
        </div>
      ),
    },
    createRealPortfolioStackData(),
    {
      id: 'staking-rewards',
      title: 'ETH Staking Rewards',
      icon: 'ethereum',
      color: 'border-orange-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">5.2% APY</div>
          <div className="text-sm text-slate-400">ETH 2.0 Staking</div>
        </div>
      ),
    },
    {
      id: 'yearn-vault',
      title: 'Yearn Finance Vault',
      icon: 'yearn',
      color: 'border-indigo-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">16.9% APY</div>
          <div className="text-sm text-slate-400">YFI Auto-Compound</div>
        </div>
      ),
    },
    {
      id: 'balancer-pool',
      title: 'Balancer Weighted Pool',
      icon: 'balancer',
      color: 'border-teal-500',
      aiPriority: 'low',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">13.4% APY</div>
          <div className="text-sm text-slate-400">BAL Weighted Pool</div>
        </div>
      ),
    },
    {
      id: 'convex-crv',
      title: 'Convex CRV Boost',
      icon: 'convex',
      color: 'border-yellow-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">19.3% APY</div>
          <div className="text-sm text-slate-400">CVX Curve Boost</div>
        </div>
      ),
    },
    {
      id: 'market-data',
      title: 'Market Intelligence',
      color: 'border-blue-500',
      aiPriority: 'low',
      category: 'overview',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">$2,847</div>
          <div className="text-sm text-slate-400">ETH Price • 23 gwei</div>
        </div>
      ),
    },
    {
      id: 'sushiswap-farm',
      title: 'SushiSwap Farm',
      icon: 'sushiswap',
      color: 'border-pink-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">14.7% APY</div>
          <div className="text-sm text-slate-400">SUSHI Liquidity Farm</div>
        </div>
      ),
    },
    {
      id: 'maker-dai',
      title: 'MakerDAO DSR',
      icon: 'makerdao',
      color: 'border-green-600',
      aiPriority: 'low',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">8.5% APY</div>
          <div className="text-sm text-slate-400">DAI Savings Rate</div>
        </div>
      ),
    },
    {
      id: 'rocket-pool',
      title: 'Rocket Pool rETH',
      icon: 'rocketpool',
      color: 'border-orange-400',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">5.8% APY</div>
          <div className="text-sm text-slate-400">rETH Liquid Staking</div>
        </div>
      ),
    },
    {
      id: 'frax-share',
      title: 'Frax Share Pool',
      icon: 'frax',
      color: 'border-cyan-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">17.2% APY</div>
          <div className="text-sm text-slate-400">FXS Share Pool</div>
        </div>
      ),
    },
    {
      id: 'lido-steth',
      title: 'Lido stETH',
      icon: 'lido',
      color: 'border-blue-400',
      aiPriority: 'high',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">5.4% APY</div>
          <div className="text-sm text-slate-400">stETH Liquid Staking</div>
        </div>
      ),
    },
    {
      id: 'gmx-glp',
      title: 'GMX GLP Pool',
      icon: 'gmx',
      color: 'border-red-400',
      aiPriority: 'high',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">22.1% APY</div>
          <div className="text-sm text-slate-400">GLP Trading Fees</div>
        </div>
      ),
    },
    {
      id: 'pendle-yield',
      title: 'Pendle Yield Trading',
      icon: 'pendle',
      color: 'border-violet-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">20.3% APY</div>
          <div className="text-sm text-slate-400">PENDLE Yield Token</div>
        </div>
      ),
    },
    {
      id: 'tokemak-reactor',
      title: 'Tokemak Reactor',
      icon: 'tokemak',
      color: 'border-emerald-500',
      aiPriority: 'low',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">11.8% APY</div>
          <div className="text-sm text-slate-400">TOKE Reactor</div>
        </div>
      ),
    },
    {
      id: 'olympus-ohm',
      title: 'Olympus OHM Staking',
      color: 'border-amber-500',
      aiPriority: 'low',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">9.2% APY</div>
          <div className="text-sm text-slate-400">OHM Staking</div>
        </div>
      ),
    },
    {
      id: 'ribbon-vault',
      title: 'Ribbon Options Vault',
      color: 'border-rose-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-slate-200">12.6% APY</div>
          <div className="text-sm text-slate-400">RBN Options Vault</div>
        </div>
      ),
    },
  ]

  // Right stack data - Risk & Alerts (20 cards)
  const rightStackData: StackData[] = [
    {
      id: 'risk-analysis',
      title: 'Risk Analysis',
      color: 'border-red-500',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-red-400">High Risk</div>
          <div className="text-sm text-slate-400">Terra Luna Classic</div>
        </div>
      ),
    },
    {
      id: 'alerts',
      title: 'Market Alerts',
      color: 'border-orange-500',
      aiPriority: 'high',
      category: 'alert',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-amber-400">Gas Dropping</div>
          <div className="text-sm text-slate-400">Save $234 in 2 hours</div>
        </div>
      ),
    },
    {
      id: 'ai-strategy',
      title: 'AI Strategy Engine',
      color: 'border-cyan-500',
      aiPriority: 'high',
      category: 'opportunity',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-blue-400">+$10,234/year</div>
          <div className="text-sm text-slate-400">3-Step Rebalance Plan</div>
        </div>
      ),
    },
    {
      id: 'smart-contract-risk',
      title: 'Smart Contract Risk',
      color: 'border-red-400',
      aiPriority: 'high',
      category: 'risk',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-red-400">Unaudited</div>
          <div className="text-sm text-slate-400">NewDeFi Protocol</div>
        </div>
      ),
    },
    {
      id: 'liquidation-alert',
      title: 'Liquidation Warning',
      color: 'border-yellow-500',
      aiPriority: 'high',
      category: 'alert',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-amber-400">125% Ratio</div>
          <div className="text-sm text-slate-400">Add $2,500 collateral</div>
        </div>
      ),
    },
    {
      id: 'impermanent-loss',
      title: 'Impermanent Loss Monitor',
      color: 'border-orange-400',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-amber-400">-2.3% IL</div>
          <div className="text-sm text-slate-400">ETH/USDC Pool</div>
        </div>
      ),
    },
    {
      id: 'protocol-governance',
      title: 'Governance Risk',
      color: 'border-purple-400',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-purple-400">Proposal #47</div>
          <div className="text-sm text-slate-400">Fee Changes Vote</div>
        </div>
      ),
    },
    {
      id: 'bridge-security',
      title: 'Bridge Security Alert',
      color: 'border-red-600',
      aiPriority: 'high',
      category: 'alert',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-red-400">$320M Loss</div>
          <div className="text-sm text-slate-400">Wormhole Exploit</div>
        </div>
      ),
    },
    {
      id: 'oracle-manipulation',
      title: 'Oracle Risk Monitor',
      color: 'border-yellow-600',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-amber-400">+15% Deviation</div>
          <div className="text-sm text-slate-400">LINK Price Feed</div>
        </div>
      ),
    },
    {
      id: 'regulatory-risk',
      title: 'Regulatory Alert',
      color: 'border-indigo-500',
      aiPriority: 'medium',
      category: 'alert',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-blue-400">SEC Investigation</div>
          <div className="text-sm text-slate-400">Uniswap Labs</div>
        </div>
      ),
    },
    {
      id: 'flash-loan-attack',
      title: 'Flash Loan Risk',
      color: 'border-red-500',
      aiPriority: 'high',
      category: 'risk',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-red-400">$182M Exploit</div>
          <div className="text-sm text-slate-400">BeanStalk Protocol</div>
        </div>
      ),
    },
    {
      id: 'slippage-alert',
      title: 'Slippage Monitor',
      color: 'border-orange-300',
      aiPriority: 'low',
      category: 'alert',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-amber-400">2.8% Slippage</div>
          <div className="text-sm text-slate-400">ETH/USDT Pair</div>
        </div>
      ),
    },
    {
      id: 'rug-pull-detector',
      title: 'Rug Pull Scanner',
      color: 'border-red-700',
      aiPriority: 'high',
      category: 'risk',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-red-400">-89% Liquidity</div>
          <div className="text-sm text-slate-400">SQUID Token</div>
        </div>
      ),
    },
    {
      id: 'mev-protection',
      title: 'MEV Protection',
      color: 'border-green-400',
      aiPriority: 'medium',
      category: 'alert',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-emerald-400">$45 Saved</div>
          <div className="text-sm text-slate-400">MEV Bot Detected</div>
        </div>
      ),
    },
    {
      id: 'whale-movement',
      title: 'Whale Alert',
      color: 'border-blue-600',
      aiPriority: 'medium',
      category: 'alert',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-blue-400">50,000 ETH</div>
          <div className="text-sm text-slate-400">Large Transfer to Binance</div>
        </div>
      ),
    },
    {
      id: 'correlation-risk',
      title: 'Correlation Risk',
      color: 'border-purple-600',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-purple-400">0.89 Correlation</div>
          <div className="text-sm text-slate-400">ETH/BTC Assets</div>
        </div>
      ),
    },
    {
      id: 'gas-optimization',
      title: 'Gas Optimization',
      color: 'border-yellow-400',
      aiPriority: 'low',
      category: 'alert',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-amber-400">28% Savings</div>
          <div className="text-sm text-slate-400">Wait 2 hours</div>
        </div>
      ),
    },
    {
      id: 'depegging-risk',
      title: 'Depeg Risk Monitor',
      color: 'border-orange-600',
      aiPriority: 'high',
      category: 'risk',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-amber-400">$0.987</div>
          <div className="text-sm text-slate-400">USDC Depeg Alert</div>
        </div>
      ),
    },
    {
      id: 'validator-risk',
      title: 'Validator Risk',
      color: 'border-red-300',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-red-400">12 Slashed</div>
          <div className="text-sm text-slate-400">Ethereum Validators</div>
        </div>
      ),
    },
    {
      id: 'insurance-coverage',
      title: 'Insurance Monitor',
      color: 'border-green-600',
      aiPriority: 'low',
      category: 'alert',
      content: (
        <div>
          <div className="mb-1 text-base font-medium text-emerald-400">7 Days Left</div>
          <div className="text-sm text-slate-400">Nexus Mutual Coverage</div>
        </div>
      ),
    },
  ]

  // Convert stack data to window data
  const createWindowsFromStacks = () => {
    // Return empty array - no windows open by default
    return []
  }

  const [windows, setWindows] = useState<WindowData[]>(createWindowsFromStacks())
  const [activeWindow, setActiveWindow] = useState<string | null>(null)
  const [aiMode, setAiMode] = useState<'analyzing' | 'optimizing' | 'monitoring'>('analyzing')

  // Side panel states - disabled
  const [leftPanelOpen, setLeftPanelOpen] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  // Animation trails state for Minority Report effects
  const [animationTrails, setAnimationTrails] = useState<
    Array<{
      id: string
      x: number
      y: number
      opacity: number
      timestamp: number
    }>
  >([])

  // Track which cards have been processed to prevent infinite loops
  const processedRequests = useRef<Record<string, number>>({})

  // Track currently expanded windows to prevent duplicates
  const expandedWindowsRef = useRef<Set<string>>(new Set())

  // Track surface requests for all available cards
  const allCardIds = useMemo(() => [...leftStackData, ...rightStackData].map((item) => item.id), [leftStackData, rightStackData])

  // Update the expanded windows ref whenever windows state changes
  useEffect(() => {
    const expandedIds = new Set(windows.filter((w) => w.position === 'center').map((w) => w.id))
    expandedWindowsRef.current = expandedIds
  }, [windows])

  // Subscribe to "openWindow" events from the event system
  const openWindowEvents = useEvent('app.openwindow')

  // Create a stable expandWindow function with useCallback
  const expandWindowCallback = useCallback(
    (windowId: string) => {
      // Find the item in either stack
      const stackItem = [...leftStackData, ...rightStackData].find((item) => item.id === windowId)
      if (!stackItem) return

      // Determine which side the card is coming from
      const isFromLeftStack = leftStackData.some((item) => item.id === windowId)
      const isFromRightStack = rightStackData.some((item) => item.id === windowId)

      setWindows((prev) => {
        const centerWindows = prev.filter((w) => w.position === 'center')
        const maxZIndex = Math.max(...prev.map((w) => w.zIndex), 0)

        // Calculate final position for new center window
        const baseX = 350
        const baseY = 150
        const offsetX = centerWindows.length * 50 // Cascade effect
        const offsetY = centerWindows.length * 30
        const finalX = baseX + offsetX
        const finalY = baseY + offsetY

        // Calculate starting position based on which side panel it's coming from
        let startX = finalX
        let startY = finalY
        let rotationAngle = 0

        if (isFromLeftStack) {
          // Start from left side panel area with dramatic angle
          startX = -500 // Start further off-screen left
          startY = finalY + (Math.random() - 0.5) * 300 // More randomness
          rotationAngle = -10 + Math.random() * 5 // Slight rotation variety
        } else if (isFromRightStack) {
          // Start from right side panel area with dramatic angle
          startX = viewportWidth + 500 // Start further off-screen right
          startY = finalY + (Math.random() - 0.5) * 300 // More randomness
          rotationAngle = 10 - Math.random() * 5 // Slight rotation variety
        }

        // Create new center window from stack data with animation
        const newWindow: WindowData = {
          ...stackItem,
          x: startX, // Start at side panel position
          y: startY,
          width: 500,
          height: 350,
          zIndex: maxZIndex + 1,
          collapsed: false,
          position: 'center',
          // Initial animation state with more dramatic effects
          style: {
            transition: 'none', // No transition for initial placement
            transform: `scale(0.2) rotate(${rotationAngle}deg)`,
            opacity: 0.3,
            filter: 'blur(4px) brightness(1.2)',
            boxShadow: isFromLeftStack
              ? '0 0 60px rgba(34, 197, 94, 0.4)' // Green glow for left (opportunities)
              : '0 0 60px rgba(239, 68, 68, 0.4)', // Red glow for right (risks)
          },
        }

        const updatedWindows = [...prev, newWindow]

        // Create initial trail points for visual effect
        const createTrail = () => {
          // First, clear any existing trails for this window to prevent duplicates
          setAnimationTrails((prev) => prev.filter((trail) => !trail.id.startsWith(`${windowId}-trail`)))
          
          const trailPoints: Array<{
            id: string
            x: number
            y: number
            opacity: number
            timestamp: number
          }> = []
          const steps = 8
          const trailTimestamp = Date.now()
          for (let i = 0; i < steps; i++) {
            const progress = i / steps
            const x = startX + (finalX - startX) * progress
            const y = startY + (finalY - startY) * progress
            trailPoints.push({
              id: `${windowId}-trail-${trailTimestamp}-${i}`,
              x,
              y,
              opacity: 0.3 - i * 0.03,
              timestamp: trailTimestamp + i * 100,
            })
          }
          setAnimationTrails((prev) => [...prev, ...trailPoints])
        }

        // Start trail effect
        setTimeout(createTrail, 50)

        // Animate to final position after a short delay
        setTimeout(() => {
          setWindows((currentWindows) =>
            currentWindows.map((w) =>
              w.id === windowId
                ? {
                    ...w,
                    x: windowId === 'portfolio' ? 350 : finalX, // Maximize portfolio window
                    y: windowId === 'portfolio' ? 10 : finalY,  // Maximize portfolio window
                    width: windowId === 'portfolio' ? viewportWidth - 700 : 500, // Maximize portfolio window
                    height: windowId === 'portfolio' ? viewportHeight - 200 : 350, // Maximize portfolio window
                    // Final animation state with enhanced Minority Report style
                    style: {
                      transition: 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.6s ease-out 0.3s',
                      transform: 'scale(1) rotate(0deg)',
                      opacity: 1,
                      filter: 'blur(0px) brightness(1)',
                      boxShadow: `
                      0 0 40px rgba(59, 130, 246, 0.4), 
                      0 0 80px rgba(59, 130, 246, 0.2),
                      0 20px 60px rgba(0, 0, 0, 0.3),
                      inset 0 1px 0 rgba(255, 255, 255, 0.1)
                    `,
                    },
                  }
                : w
            )
          )

          // Add a subtle pulse effect after the card settles
          setTimeout(() => {
            setWindows((currentWindows) =>
              currentWindows.map((w) =>
                w.id === windowId
                  ? {
                      ...w,
                      style: {
                        ...w.style,
                        transition: 'box-shadow 0.4s ease-in-out',
                        boxShadow: `
                        0 0 30px rgba(59, 130, 246, 0.3), 
                        0 0 60px rgba(59, 130, 246, 0.1),
                        0 20px 60px rgba(0, 0, 0, 0.3),
                        inset 0 1px 0 rgba(255, 255, 255, 0.1)
                      `,
                      },
                    }
                  : w
              )
            )
          }, 1200)
        }, 150)

        // Clean up trails after animation completes
        setTimeout(() => {
          setAnimationTrails((prev) => prev.filter((trail) => !trail.id.startsWith(`${windowId}-trail`)))
        }, 2000)

        return updatedWindows
      })
      setActiveWindow(windowId)
    },
    [leftStackData, rightStackData, viewportWidth]
  )



  useEffect(() => {
    // Only process if we have events and the count increased
    if (openWindowEvents > 0) {
      // Check all events that start with 'app.openwindow.' to find the specific window
      const store = useAppStore.getState()
      const allEvents = store.events

      // Find ALL unprocessed app.openwindow.{windowId} events and sort by timestamp
      const pendingEvents: Array<{ windowId: string; timestamp: number }> = []

      Object.entries(allEvents).forEach(([eventKey, timestamp]) => {
        if (eventKey.startsWith('app.openwindow.') && eventKey !== 'app.openwindow') {
          const windowId = eventKey.replace('app.openwindow.', '')
          const timestampNum = typeof timestamp === 'number' ? timestamp : 0
          const lastProcessed = processedRequests.current[windowId] || 0
          
          // Only include events that haven't been processed yet
          if (timestampNum > lastProcessed) {
            pendingEvents.push({ windowId, timestamp: timestampNum })
          }
        }
      })

      // Sort events by timestamp to process them in order
      pendingEvents.sort((a, b) => a.timestamp - b.timestamp)

      // Process all pending events in order
      pendingEvents.forEach(({ windowId, timestamp }) => {
        
        // Handle special 'close-all' command
        if (windowId === 'close-all') {
          collapseAllWindows()
        } else if (!expandedWindowsRef.current.has(windowId)) {
          expandWindowCallback(windowId)
        }
        
        // Mark this event as processed
        processedRequests.current[windowId] = timestamp
      })
    }
  }, [openWindowEvents, expandWindowCallback])

  // AI-driven window management - simplified without animations
  useEffect(() => {
    const interval = setInterval(() => {
      setAiMode((prev) => {
        const modes: (typeof aiMode)[] = ['analyzing', 'optimizing', 'monitoring']
        const currentIndex = modes.indexOf(prev)
        return modes[(currentIndex + 1) % modes.length]
      })
      // Removed automatic z-index adjustments that cause re-renders
    }, 5000) // Increased interval to reduce re-renders

    return () => clearInterval(interval)
  }, [])

  const collapseWindow = (windowId: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== windowId))
  }

  const tileWindows = (layout: 'grid' | 'cascade' | 'horizontal' | 'vertical') => {
    setWindows((prev) => {
      const centerWindows = prev.filter((w) => w.position === 'center')
      if (centerWindows.length === 0) return prev

      // Use full viewport with margins for side stacks and bottom quick actions
      const workspaceX = 350 // Leave space for left stack
      const workspaceY = 80 // Leave space for toolbar
      const workspaceWidth = viewportWidth - 700 // Space between left and right stacks
      const workspaceHeight = viewportHeight - 200 // Leave space for toolbar (80) + quick actions (120)

      return prev.map((w) => {
        if (w.position === 'center') {
          const index = centerWindows.findIndex((cw) => cw.id === w.id)
          let newX = w.x
          let newY = w.y
          let newWidth = w.width
          let newHeight = w.height

          switch (layout) {
            case 'grid':
              const cols = Math.ceil(Math.sqrt(centerWindows.length))
              const rows = Math.ceil(centerWindows.length / cols)
              const gridWidth = Math.floor(workspaceWidth / cols) - 20
              const gridHeight = Math.floor(workspaceHeight / rows) - 20

              newX = workspaceX + (index % cols) * (gridWidth + 20)
              newY = workspaceY + Math.floor(index / cols) * (gridHeight + 20)
              newWidth = Math.max(gridWidth, 300)
              newHeight = Math.max(gridHeight, 200)
              break

            case 'cascade':
              newX = workspaceX + index * 40
              newY = workspaceY + index * 30
              newWidth = Math.min(600, workspaceWidth - index * 40)
              newHeight = Math.min(450, workspaceHeight - index * 30)
              break

            case 'horizontal':
              const hWidth = Math.floor(workspaceWidth / centerWindows.length) - 20
              newX = workspaceX + index * (hWidth + 20)
              newY = workspaceY
              newWidth = Math.max(hWidth, 300)
              newHeight = workspaceHeight - 40 // Use almost full height but respect bottom margin
              break

            case 'vertical':
              const vHeight = Math.floor(workspaceHeight / centerWindows.length) - 20
              newX = workspaceX + 50
              newY = workspaceY + index * (vHeight + 20)
              newWidth = workspaceWidth - 100 // Use most of the width
              newHeight = Math.max(vHeight, 200)
              break
          }

          return {
            ...w,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
            zIndex: 30 + index,
          }
        }
        return w
      })
    })
  }

  const collapseAllWindows = () => {
    setWindows([])
  }

  const bringToFront = (windowId: string) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, zIndex: Math.max(...prev.map((win) => win.zIndex)) + 1 } : w)))
    setActiveWindow(windowId)
  }

  const updateWindowPosition = (windowId: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, x, y } : w)))
  }

  const updateWindowSize = (windowId: string, width: number, height: number) => {
    setWindows((prev) => prev.map((w) => (w.id === windowId ? { ...w, width, height } : w)))
  }

  return (
    <div className="relative h-full w-full">
      {/* Simplified Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full border border-cyan-400/10"></div>
      </div>

      {/* Window Management Toolbar - Top of Screen */}
      <WindowToolbar
        onGridLayout={() => tileWindows('grid')}
        onCascadeLayout={() => tileWindows('cascade')}
        onCollapseAll={collapseAllWindows}
      />

      {/* Side Tab Buttons - Disabled */}
      {false && (
        <>
          <SideTabButton
            isOpen={leftPanelOpen}
            onClick={() => setLeftPanelOpen(!leftPanelOpen)}
            side="left"
            position="top-1/2"
            openLabel="OPPORTUNITIES"
            closedLabel="OPPORTUNITIES"
            openColor="bg-green-600/80"
            hoverColor="hover:bg-gray-700/80"
            style={{
              left: leftPanelOpen ? '320px' : '0px',
              transition: 'left 0.3s ease-in-out',
            }}
          />

          <SideTabButton
            isOpen={rightPanelOpen}
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            side="right"
            position="top-2/3"
            openLabel="RISK ANALYSIS"
            closedLabel="RISK"
            openColor="bg-red-600/80"
            hoverColor="hover:bg-gray-700/80"
            style={{
              right: rightPanelOpen ? '320px' : '0px',
              transition: 'right 0.3s ease-in-out',
            }}
          />
        </>
      )}

      {/* Side Panels - Disabled */}
      {false && (
        <>
          {/* Left Side Panel - Opportunities */}
          <div
            className={`absolute top-0 bottom-0 left-0 z-40 transition-transform duration-300 ease-in-out ${leftPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}
          >
            {/* Panel Content */}
            <div
              className="h-full w-80 overflow-x-hidden overflow-y-auto border-r border-gray-700/50 bg-black/70"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="space-y-3 p-4 pt-8">
                {leftStackData.map((item, index) => (
                  <DashboardCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    icon={item.icon}
                    color={item.color}
                    aiPriority={item.aiPriority}
                    category={item.category}
                    content={item.content}
                    isExpanded={windows.some((w) => w.id === item.id && w.position === 'center')}
                    onExpand={expandWindowCallback}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Side Panel - Risk & Alerts */}
          <div
            className={`absolute top-0 right-0 bottom-0 z-40 transition-transform duration-300 ease-in-out ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
          >
            {/* Panel Content */}
            <div
              className="h-full w-80 overflow-x-hidden overflow-y-auto border-l border-gray-700/50 bg-black/70"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <div className="space-y-3 p-4 pt-8">
                {rightStackData.map((item, index) => (
                  <DashboardCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    icon={item.icon}
                    color={item.color}
                    aiPriority={item.aiPriority}
                    category={item.category}
                    content={item.content}
                    isExpanded={windows.some((w) => w.id === item.id && w.position === 'center')}
                    onExpand={expandWindowCallback}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* AI-Managed Windows - Only Center Windows */}
      {windows
        .filter((w) => w.position === 'center')
        .map((windowData, index) => (
          <ExpandedCard
            key={windowData.id}
            id={windowData.id}
            title={windowData.title}
            x={windowData.x}
            y={windowData.y}
            width={windowData.width}
            height={windowData.height}
            zIndex={windowData.zIndex}
            color={windowData.color}
            aiPriority={windowData.aiPriority}
            category={windowData.category}
            position={windowData.position}
            collapsed={windowData.collapsed}
            content={windowData.content}
            style={windowData.style}
            onDragStop={(id: string, x: number, y: number) => updateWindowPosition(id, x, y)}
            onResizeStop={(id: string, width: number, height: number, x: number, y: number) => {
              updateWindowSize(id, width, height)
              updateWindowPosition(id, x, y)
            }}
            onBringToFront={bringToFront}
            onCollapse={collapseWindow}
          />
        ))}

      {/* Animation Trails for Minority Report Effects */}
      {animationTrails.map((trail) => (
        <div
          key={trail.id}
          className="pointer-events-none absolute"
          style={{
            left: trail.x,
            top: trail.y,
            width: '8px',
            height: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.6)',
            borderRadius: '50%',
            opacity: trail.opacity,
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.8)',
            transition: 'opacity 0.3s ease-out',
            zIndex: 1000,
          }}
        />
      ))}
    </div>
  )
}

export default WireframeOverlay
