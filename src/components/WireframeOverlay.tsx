import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import SideTabButton from './SideTabButton';
import WindowToolbar from './WindowToolbar';

interface WindowData {
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
}

interface StackData {
  id: string;
  title: string;
  color: string;
  aiPriority: 'high' | 'medium' | 'low';
  category: 'yield' | 'risk' | 'opportunity' | 'alert' | 'overview';
  content: React.ReactNode;
}

const WireframeOverlay = () => {
  const [viewportWidth, setViewportWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1400);
  const [viewportHeight, setViewportHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800);
  
  // Update viewport dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
      setViewportHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Left stack data - Opportunities & Portfolio (20 cards)
  const leftStackData: StackData[] = [
    {
      id: 'high-yield',
      title: '📈 High Yield Opportunities',
      color: 'border-green-500',
      aiPriority: 'high',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-green-300 font-semibold text-sm mb-1">Aave USDC: 23.4% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 94% • TVL: $2.1B</div>
          <div className="text-green-400 text-xs mt-1">Risk Level: Low • Recommended: 60% allocation</div>
        </div>
      )
    },
    {
      id: 'compound-eth',
      title: '⚡ Compound ETH Pool',
      color: 'border-green-400',
      aiPriority: 'high',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-green-300 font-semibold text-sm mb-1">Compound ETH: 18.7% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 87% • TVL: $890M</div>
          <div className="text-yellow-400 text-xs mt-1">Risk Level: Medium • Growth potential: High</div>
        </div>
      )
    },
    {
      id: 'curve-3pool',
      title: '🌊 Curve 3Pool Stable',
      color: 'border-blue-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-blue-300 font-semibold text-sm mb-1">Curve 3Pool: 15.2% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 92% • TVL: $1.5B</div>
          <div className="text-green-400 text-xs mt-1">Risk Level: Very Low • Stable returns</div>
        </div>
      )
    },
    {
      id: 'uniswap-v4',
      title: '🦄 Uniswap V4 Pools',
      color: 'border-purple-500',
      aiPriority: 'high',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-purple-300 font-semibold text-sm mb-1">UNI V4 LP: 21.8% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 89% • TVL: $650M</div>
          <div className="text-purple-400 text-xs mt-1">Risk Level: Medium • New protocol</div>
        </div>
      )
    },
    {
      id: 'portfolio',
      title: '💼 Portfolio Overview',
      color: 'border-purple-500',
      aiPriority: 'medium',
      category: 'overview',
      content: (
        <div className="p-4">
          <div className="text-purple-300 font-semibold text-sm mb-1">Total Value: $124,567</div>
          <div className="text-white/70 text-xs">Current APY: 12.4% • Monthly Yield: $1,247</div>
          <div className="text-purple-400 text-xs mt-1">🤖 Optimization potential: +8.2% APY</div>
        </div>
      )
    },
    {
      id: 'staking-rewards',
      title: '🥩 ETH Staking Rewards',
      color: 'border-orange-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-orange-300 font-semibold text-sm mb-1">ETH 2.0 Staking: 5.2% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 98% • TVL: $45B</div>
          <div className="text-green-400 text-xs mt-1">Risk Level: Very Low • Validator rewards</div>
        </div>
      )
    },
    {
      id: 'yearn-vault',
      title: '🏦 Yearn Finance Vault',
      color: 'border-indigo-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-indigo-300 font-semibold text-sm mb-1">YFI Vault: 16.9% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 85% • TVL: $420M</div>
          <div className="text-yellow-400 text-xs mt-1">Risk Level: Medium • Auto-compound</div>
        </div>
      )
    },
    {
      id: 'balancer-pool',
      title: '⚖️ Balancer Weighted Pool',
      color: 'border-teal-500',
      aiPriority: 'low',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-teal-300 font-semibold text-sm mb-1">BAL Pool: 13.4% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 78% • TVL: $280M</div>
          <div className="text-yellow-400 text-xs mt-1">Risk Level: Medium • Impermanent loss risk</div>
        </div>
      )
    },
    {
      id: 'convex-crv',
      title: '🔄 Convex CRV Boost',
      color: 'border-yellow-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-yellow-300 font-semibold text-sm mb-1">CVX Boost: 19.3% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 82% • TVL: $1.2B</div>
          <div className="text-green-400 text-xs mt-1">Risk Level: Low • Curve rewards boost</div>
        </div>
      )
    },
    {
      id: 'market-data',
      title: '📊 Market Intelligence',
      color: 'border-blue-500',
      aiPriority: 'low',
      category: 'overview',
      content: (
        <div className="p-4">
          <div className="text-blue-300 font-semibold text-sm mb-1">ETH: $2,847 • Gas: 23 gwei</div>
          <div className="text-white/70 text-xs">DeFi TVL: $45.2B • 24h Volume: $2.1B</div>
          <div className="text-blue-400 text-xs mt-1">🤖 Market Sentiment: Bullish</div>
        </div>
      )
    },
    {
      id: 'sushiswap-farm',
      title: '🍣 SushiSwap Farm',
      color: 'border-pink-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-pink-300 font-semibold text-sm mb-1">SUSHI Farm: 14.7% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 76% • TVL: $180M</div>
          <div className="text-yellow-400 text-xs mt-1">Risk Level: Medium • SUSHI rewards</div>
        </div>
      )
    },
    {
      id: 'maker-dai',
      title: '🏛️ MakerDAO DSR',
      color: 'border-green-600',
      aiPriority: 'low',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-green-300 font-semibold text-sm mb-1">DAI Savings: 8.5% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 95% • TVL: $5.2B</div>
          <div className="text-green-400 text-xs mt-1">Risk Level: Very Low • Protocol native</div>
        </div>
      )
    },
    {
      id: 'rocket-pool',
      title: '🚀 Rocket Pool rETH',
      color: 'border-orange-400',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-orange-300 font-semibold text-sm mb-1">rETH Staking: 5.8% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 91% • TVL: $1.8B</div>
          <div className="text-green-400 text-xs mt-1">Risk Level: Low • Liquid staking</div>
        </div>
      )
    },
    {
      id: 'frax-share',
      title: '❄️ Frax Share Pool',
      color: 'border-cyan-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-cyan-300 font-semibold text-sm mb-1">FXS Pool: 17.2% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 79% • TVL: $320M</div>
          <div className="text-yellow-400 text-xs mt-1">Risk Level: Medium • Algorithmic stable</div>
        </div>
      )
    },
    {
      id: 'lido-steth',
      title: '🌊 Lido stETH',
      color: 'border-blue-400',
      aiPriority: 'high',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-blue-300 font-semibold text-sm mb-1">stETH: 5.4% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 93% • TVL: $14.2B</div>
          <div className="text-green-400 text-xs mt-1">Risk Level: Low • Largest liquid staking</div>
        </div>
      )
    },
    {
      id: 'gmx-glp',
      title: '📈 GMX GLP Pool',
      color: 'border-red-400',
      aiPriority: 'high',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-red-300 font-semibold text-sm mb-1">GLP Pool: 22.1% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 84% • TVL: $450M</div>
          <div className="text-yellow-400 text-xs mt-1">Risk Level: Medium • Perp trading fees</div>
        </div>
      )
    },
    {
      id: 'pendle-yield',
      title: '📅 Pendle Yield Trading',
      color: 'border-violet-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-violet-300 font-semibold text-sm mb-1">PENDLE YT: 20.3% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 73% • TVL: $190M</div>
          <div className="text-yellow-400 text-xs mt-1">Risk Level: High • Yield tokenization</div>
        </div>
      )
    },
    {
      id: 'tokemak-reactor',
      title: '⚛️ Tokemak Reactor',
      color: 'border-emerald-500',
      aiPriority: 'low',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-emerald-300 font-semibold text-sm mb-1">TOKE Reactor: 11.8% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 69% • TVL: $85M</div>
          <div className="text-yellow-400 text-xs mt-1">Risk Level: Medium • Liquidity direction</div>
        </div>
      )
    },
    {
      id: 'olympus-ohm',
      title: '🏛️ Olympus OHM Staking',
      color: 'border-amber-500',
      aiPriority: 'low',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-amber-300 font-semibold text-sm mb-1">OHM Staking: 9.2% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 65% • TVL: $120M</div>
          <div className="text-red-400 text-xs mt-1">Risk Level: High • Rebase mechanism</div>
        </div>
      )
    },
    {
      id: 'ribbon-vault',
      title: '🎀 Ribbon Options Vault',
      color: 'border-rose-500',
      aiPriority: 'medium',
      category: 'yield',
      content: (
        <div className="p-4">
          <div className="text-rose-300 font-semibold text-sm mb-1">RBN Vault: 12.6% APY</div>
          <div className="text-white/70 text-xs">🤖 AI Confidence: 77% • TVL: $95M</div>
          <div className="text-yellow-400 text-xs mt-1">Risk Level: Medium • Options strategies</div>
        </div>
      )
    }
  ];

  // Right stack data - Risk & Alerts (20 cards)
  const rightStackData: StackData[] = [
    {
      id: 'risk-analysis',
      title: '⚠️ Risk Analysis',
      color: 'border-red-500',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div className="p-4">
          <div className="text-red-300 font-semibold text-sm mb-1">High Risk: Terra Luna Classic</div>
          <div className="text-white/70 text-xs">🤖 AI Recommendation: Avoid • Risk Score: 9.2/10</div>
          <div className="text-red-400 text-xs mt-1">Potential Loss: -95% • Exit immediately</div>
        </div>
      )
    },
    {
      id: 'alerts',
      title: '🚨 Market Alerts',
      color: 'border-orange-500',
      aiPriority: 'high',
      category: 'alert',
      content: (
        <div className="p-4">
          <div className="text-orange-300 font-semibold text-sm mb-1">Gas Fees Dropping</div>
          <div className="text-white/70 text-xs">🤖 Optimal rebalance window: Next 2 hours</div>
          <div className="text-orange-400 text-xs mt-1">Estimated savings: $234 in gas fees</div>
        </div>
      )
    },
    {
      id: 'ai-strategy',
      title: '🎯 AI Strategy Engine',
      color: 'border-cyan-500',
      aiPriority: 'high',
      category: 'opportunity',
      content: (
        <div className="p-4">
          <div className="text-cyan-300 font-semibold text-sm mb-1">3-Step Rebalance Plan</div>
          <div className="text-white/70 text-xs">🤖 Execute in 2h • Expected gain: +$10,234/year</div>
          <div className="text-cyan-400 text-xs mt-1">Confidence: 96% • Risk-adjusted return: +18.7%</div>
        </div>
      )
    },
    {
      id: 'smart-contract-risk',
      title: '🔒 Smart Contract Risk',
      color: 'border-red-400',
      aiPriority: 'high',
      category: 'risk',
      content: (
        <div className="p-4">
          <div className="text-red-300 font-semibold text-sm mb-1">Unaudited Contract Detected</div>
          <div className="text-white/70 text-xs">🤖 Protocol: NewDeFi • Risk Score: 8.5/10</div>
          <div className="text-red-400 text-xs mt-1">No audit found • Avoid until reviewed</div>
        </div>
      )
    },
    {
      id: 'liquidation-alert',
      title: '💧 Liquidation Warning',
      color: 'border-yellow-500',
      aiPriority: 'high',
      category: 'alert',
      content: (
        <div className="p-4">
          <div className="text-yellow-300 font-semibold text-sm mb-1">Position at Risk</div>
          <div className="text-white/70 text-xs">🤖 Collateral Ratio: 125% • Liquidation: 110%</div>
          <div className="text-yellow-400 text-xs mt-1">Add $2,500 collateral or reduce debt</div>
        </div>
      )
    },
    {
      id: 'impermanent-loss',
      title: '📉 Impermanent Loss Monitor',
      color: 'border-orange-400',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div className="p-4">
          <div className="text-orange-300 font-semibold text-sm mb-1">IL Risk: ETH/USDC Pool</div>
          <div className="text-white/70 text-xs">🤖 Current IL: -2.3% • Threshold: -5%</div>
          <div className="text-orange-400 text-xs mt-1">Monitor closely • Consider exit if &gt;-5%</div>
        </div>
      )
    },
    {
      id: 'protocol-governance',
      title: '🗳️ Governance Risk',
      color: 'border-purple-400',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div className="p-4">
          <div className="text-purple-300 font-semibold text-sm mb-1">Proposal #47: Fee Changes</div>
          <div className="text-white/70 text-xs">🤖 Impact: Medium • Voting ends: 2 days</div>
          <div className="text-purple-400 text-xs mt-1">May affect yield by -1.2% if passed</div>
        </div>
      )
    },
    {
      id: 'bridge-security',
      title: '🌉 Bridge Security Alert',
      color: 'border-red-600',
      aiPriority: 'high',
      category: 'alert',
      content: (
        <div className="p-4">
          <div className="text-red-300 font-semibold text-sm mb-1">Bridge Exploit Detected</div>
          <div className="text-white/70 text-xs">🤖 Affected: Wormhole • Loss: $320M</div>
          <div className="text-red-400 text-xs mt-1">Avoid cross-chain transactions</div>
        </div>
      )
    },
    {
      id: 'oracle-manipulation',
      title: '🔮 Oracle Risk Monitor',
      color: 'border-yellow-600',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div className="p-4">
          <div className="text-yellow-300 font-semibold text-sm mb-1">Price Feed Anomaly</div>
          <div className="text-white/70 text-xs">🤖 Asset: LINK • Deviation: +15%</div>
          <div className="text-yellow-400 text-xs mt-1">Potential manipulation • Verify prices</div>
        </div>
      )
    },
    {
      id: 'regulatory-risk',
      title: '⚖️ Regulatory Alert',
      color: 'border-indigo-500',
      aiPriority: 'medium',
      category: 'alert',
      content: (
        <div className="p-4">
          <div className="text-indigo-300 font-semibold text-sm mb-1">SEC Investigation</div>
          <div className="text-white/70 text-xs">🤖 Target: Uniswap Labs • Impact: TBD</div>
          <div className="text-indigo-400 text-xs mt-1">Monitor for protocol changes</div>
        </div>
      )
    },
    {
      id: 'flash-loan-attack',
      title: '⚡ Flash Loan Risk',
      color: 'border-red-500',
      aiPriority: 'high',
      category: 'risk',
      content: (
        <div className="p-4">
          <div className="text-red-300 font-semibold text-sm mb-1">Attack Vector Identified</div>
          <div className="text-white/70 text-xs">🤖 Protocol: BeanStalk • Vulnerability: Oracle</div>
          <div className="text-red-400 text-xs mt-1">$182M exploit • Avoid similar protocols</div>
        </div>
      )
    },
    {
      id: 'slippage-alert',
      title: '📊 Slippage Monitor',
      color: 'border-orange-300',
      aiPriority: 'low',
      category: 'alert',
      content: (
        <div className="p-4">
          <div className="text-orange-300 font-semibold text-sm mb-1">High Slippage Warning</div>
          <div className="text-white/70 text-xs">🤖 Pair: ETH/USDT • Current: 2.8%</div>
          <div className="text-orange-400 text-xs mt-1">Consider smaller trades or wait</div>
        </div>
      )
    },
    {
      id: 'rug-pull-detector',
      title: '🚩 Rug Pull Scanner',
      color: 'border-red-700',
      aiPriority: 'high',
      category: 'risk',
      content: (
        <div className="p-4">
          <div className="text-red-300 font-semibold text-sm mb-1">Suspicious Activity</div>
          <div className="text-white/70 text-xs">🤖 Token: SQUID • Liquidity: -89%</div>
          <div className="text-red-400 text-xs mt-1">Possible rug pull • Exit immediately</div>
        </div>
      )
    },
    {
      id: 'mev-protection',
      title: '🛡️ MEV Protection',
      color: 'border-green-400',
      aiPriority: 'medium',
      category: 'alert',
      content: (
        <div className="p-4">
          <div className="text-green-300 font-semibold text-sm mb-1">MEV Bot Detected</div>
          <div className="text-white/70 text-xs">🤖 Protection: Active • Savings: $45</div>
          <div className="text-green-400 text-xs mt-1">Transaction protected from sandwich</div>
        </div>
      )
    },
    {
      id: 'whale-movement',
      title: '🐋 Whale Alert',
      color: 'border-blue-600',
      aiPriority: 'medium',
      category: 'alert',
      content: (
        <div className="p-4">
          <div className="text-blue-300 font-semibold text-sm mb-1">Large Transfer Detected</div>
          <div className="text-white/70 text-xs">🤖 Amount: 50,000 ETH • Exchange: Binance</div>
          <div className="text-blue-400 text-xs mt-1">Potential market impact • Monitor prices</div>
        </div>
      )
    },
    {
      id: 'correlation-risk',
      title: '📈 Correlation Risk',
      color: 'border-purple-600',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div className="p-4">
          <div className="text-purple-300 font-semibold text-sm mb-1">High Correlation Alert</div>
          <div className="text-white/70 text-xs">🤖 Assets: ETH/BTC • Correlation: 0.89</div>
          <div className="text-purple-400 text-xs mt-1">Diversification needed • Add uncorrelated</div>
        </div>
      )
    },
    {
      id: 'gas-optimization',
      title: '⛽ Gas Optimization',
      color: 'border-yellow-400',
      aiPriority: 'low',
      category: 'alert',
      content: (
        <div className="p-4">
          <div className="text-yellow-300 font-semibold text-sm mb-1">Gas Price Forecast</div>
          <div className="text-white/70 text-xs">🤖 Current: 25 gwei • Optimal: 18 gwei</div>
          <div className="text-yellow-400 text-xs mt-1">Wait 2 hours for 28% savings</div>
        </div>
      )
    },
    {
      id: 'depegging-risk',
      title: '⚖️ Depeg Risk Monitor',
      color: 'border-orange-600',
      aiPriority: 'high',
      category: 'risk',
      content: (
        <div className="p-4">
          <div className="text-orange-300 font-semibold text-sm mb-1">Stablecoin Depeg Alert</div>
          <div className="text-white/70 text-xs">🤖 Asset: USDC • Price: $0.987</div>
          <div className="text-orange-400 text-xs mt-1">-1.3% from peg • Monitor closely</div>
        </div>
      )
    },
    {
      id: 'validator-risk',
      title: '🔗 Validator Risk',
      color: 'border-red-300',
      aiPriority: 'medium',
      category: 'risk',
      content: (
        <div className="p-4">
          <div className="text-red-300 font-semibold text-sm mb-1">Validator Slashing Event</div>
          <div className="text-white/70 text-xs">🤖 Network: Ethereum • Affected: 12 validators</div>
          <div className="text-red-400 text-xs mt-1">Staking rewards reduced • Review providers</div>
        </div>
      )
    },
    {
      id: 'insurance-coverage',
      title: '🛡️ Insurance Monitor',
      color: 'border-green-600',
      aiPriority: 'low',
      category: 'alert',
      content: (
        <div className="p-4">
          <div className="text-green-300 font-semibold text-sm mb-1">Coverage Expiring</div>
          <div className="text-white/70 text-xs">🤖 Protocol: Nexus Mutual • Days left: 7</div>
          <div className="text-green-400 text-xs mt-1">Renew coverage for $2,500 position</div>
        </div>
      )
    }
  ];

  // Convert stack data to window data
  const createWindowsFromStacks = () => {
    const centerWindow: WindowData = {
      id: 'ai-overview',
      title: '🤖 AI Yield Optimizer',
      x: 400,
      y: 200,
      width: 600,
      height: 400,
      zIndex: 30,
      color: 'border-blue-500',
      aiPriority: 'high',
      category: 'overview',
      position: 'center',
      collapsed: false,
      content: (
        <div className="p-6">
          <div className="border border-blue-400/30 rounded p-4 mb-4 bg-blue-500/10">
            <h3 className="text-blue-300 text-xl font-semibold mb-3">AI Deep Analysis</h3>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="border border-white/20 rounded p-3 text-center">
                <div className="text-green-400 text-sm">Best Yield</div>
                <div className="text-white font-bold text-2xl">23.4%</div>
                <div className="text-white/60 text-xs">Aave USDC</div>
              </div>
              <div className="border border-white/20 rounded p-3 text-center">
                <div className="text-yellow-400 text-sm">Risk Score</div>
                <div className="text-white font-bold text-2xl">7.2/10</div>
                <div className="text-white/60 text-xs">Medium Risk</div>
              </div>
              <div className="border border-white/20 rounded p-3 text-center">
                <div className="text-purple-400 text-sm">Confidence</div>
                <div className="text-white font-bold text-2xl">94%</div>
                <div className="text-white/60 text-xs">High</div>
              </div>
            </div>
            <div className="border border-green-400/30 rounded p-3 bg-green-500/10">
              <div className="text-green-300 text-sm font-semibold">🎯 Primary Recommendation</div>
              <div className="text-white/90 text-lg mt-2">Reallocate 40% portfolio to Aave USDC</div>
              <div className="text-green-400 text-sm mt-1">Expected additional yield: $10,234/year</div>
            </div>
          </div>
        </div>
      )
    };

    return [centerWindow];
  };

  const [windows, setWindows] = useState<WindowData[]>(createWindowsFromStacks());
  const [activeWindow, setActiveWindow] = useState<string | null>('ai-overview');
  const [aiMode, setAiMode] = useState<'analyzing' | 'optimizing' | 'monitoring'>('analyzing');
  
  // Side panel states
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);

  // AI-driven window management - simplified without animations
  useEffect(() => {
    const interval = setInterval(() => {
      setAiMode(prev => {
        const modes: typeof aiMode[] = ['analyzing', 'optimizing', 'monitoring'];
        const currentIndex = modes.indexOf(prev);
        return modes[(currentIndex + 1) % modes.length];
      });
      // Removed automatic z-index adjustments that cause re-renders
    }, 5000); // Increased interval to reduce re-renders

    return () => clearInterval(interval);
  }, []);

  const expandWindow = (windowId: string) => {
    // Find the item in either stack
    const stackItem = [...leftStackData, ...rightStackData].find(item => item.id === windowId);
    if (!stackItem) return;

    setWindows(prev => {
      const centerWindows = prev.filter(w => w.position === 'center');
      const maxZIndex = Math.max(...prev.map(w => w.zIndex), 0);
      
      // Calculate position for new center window
      const baseX = 300;
      const baseY = 150;
      const offsetX = centerWindows.length * 50; // Cascade effect
      const offsetY = centerWindows.length * 30;
      
      // Create new center window from stack data
      const newWindow: WindowData = {
        ...stackItem,
        x: baseX + offsetX,
        y: baseY + offsetY,
        width: 500,
        height: 350,
        zIndex: maxZIndex + 1,
        collapsed: false,
        position: 'center'
      };
      
      return [...prev, newWindow];
    });
    setActiveWindow(windowId);
  };

  const collapseWindow = (windowId: string) => {
    setWindows(prev => prev.filter(w => w.id !== windowId));
  };

  const tileWindows = (layout: 'grid' | 'cascade' | 'horizontal' | 'vertical') => {
    setWindows(prev => {
      const centerWindows = prev.filter(w => w.position === 'center');
      if (centerWindows.length === 0) return prev;

      // Use full viewport with margins for side stacks
      const workspaceX = 350; // Leave space for left stack
      const workspaceY = 80;  // Leave space for toolbar
      const workspaceWidth = viewportWidth - 700; // Space between left and right stacks
      const workspaceHeight = viewportHeight - 120; // Full height minus toolbar and margins

      return prev.map(w => {
        if (w.position === 'center') {
          const index = centerWindows.findIndex(cw => cw.id === w.id);
          let newX = w.x;
          let newY = w.y;
          let newWidth = w.width;
          let newHeight = w.height;

          switch (layout) {
            case 'grid':
              const cols = Math.ceil(Math.sqrt(centerWindows.length));
              const rows = Math.ceil(centerWindows.length / cols);
              const gridWidth = Math.floor(workspaceWidth / cols) - 20;
              const gridHeight = Math.floor(workspaceHeight / rows) - 20;
              
              newX = workspaceX + (index % cols) * (gridWidth + 20);
              newY = workspaceY + Math.floor(index / cols) * (gridHeight + 20);
              newWidth = Math.max(gridWidth, 300);
              newHeight = Math.max(gridHeight, 200);
              break;

            case 'cascade':
              newX = workspaceX + index * 40;
              newY = workspaceY + index * 30;
              newWidth = Math.min(600, workspaceWidth - index * 40);
              newHeight = Math.min(450, workspaceHeight - index * 30);
              break;

            case 'horizontal':
              const hWidth = Math.floor(workspaceWidth / centerWindows.length) - 20;
              newX = workspaceX + index * (hWidth + 20);
              newY = workspaceY;
              newWidth = Math.max(hWidth, 300);
              newHeight = workspaceHeight - 40; // Use almost full height
              break;

            case 'vertical':
              const vHeight = Math.floor(workspaceHeight / centerWindows.length) - 20;
              newX = workspaceX + 50;
              newY = workspaceY + index * (vHeight + 20);
              newWidth = workspaceWidth - 100; // Use most of the width
              newHeight = Math.max(vHeight, 200);
              break;
          }

          return {
            ...w,
            x: newX,
            y: newY,
            width: newWidth,
            height: newHeight,
            zIndex: 30 + index
          };
        }
        return w;
      });
    });
  };

  const collapseAllWindows = () => {
    setWindows([]);
  };

  const bringToFront = (windowId: string) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId 
        ? { ...w, zIndex: Math.max(...prev.map(win => win.zIndex)) + 1 }
        : w
    ));
    setActiveWindow(windowId);
  };

  const updateWindowPosition = (windowId: string, x: number, y: number) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, x, y } : w
    ));
  };

  const updateWindowSize = (windowId: string, width: number, height: number) => {
    setWindows(prev => prev.map(w => 
      w.id === windowId ? { ...w, width, height } : w
    ));
  };

  return (
    <div className="relative w-full h-full">
      {/* Simplified Background */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full border border-cyan-400/10"></div>
      </div>

      {/* Window Management Toolbar - Top of Screen */}
      <WindowToolbar
        onGridLayout={() => tileWindows('grid')}
        onCascadeLayout={() => tileWindows('cascade')}
        onCollapseAll={collapseAllWindows}
      />

      {/* Always Visible Tab Buttons */}
      <SideTabButton
        isOpen={leftPanelOpen}
        onClick={() => setLeftPanelOpen(!leftPanelOpen)}
        side="left"
        position="top-1/3"
        openLabel="OPPORTUNITIES"
        closedLabel="OPPORTUNITIES"
        openColor="bg-green-600/80"
        hoverColor="hover:bg-gray-700/80"
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
      />

      {/* Left Side Panel - Opportunities */}
      <div className={`absolute left-0 top-0 bottom-0 transition-transform duration-300 ease-in-out z-40 ${leftPanelOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Panel Content */}
        <div className="w-80 h-full bg-black/95 border-r border-gray-700/50 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
          <div className="space-y-3 p-4 pt-8">
            {leftStackData.map((item, index) => {
              const isExpanded = windows.some(w => w.id === item.id && w.position === 'center');
              if (isExpanded) return null;
              
              return (
                <div
                  key={item.id}
                  onClick={() => expandWindow(item.id)}
                  className={`w-full h-24 bg-black/80 border-2 ${item.color} rounded-lg cursor-pointer hover:bg-black/90 relative`}
                >
                  {/* Card Title Bar */}
                  <div className={`border-b ${item.color} p-2 bg-black/50 rounded-t-lg select-none flex items-center justify-between`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.aiPriority === 'high' ? 'bg-cyan-400' :
                        item.aiPriority === 'medium' ? 'bg-yellow-400' : 'bg-gray-400'
                      }`}></div>
                      <h3 className="text-white font-medium text-xs">{item.title}</h3>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="h-14 overflow-hidden">
                    {item.content}
                  </div>

                  {/* Expand Indicator */}
                  <div className="absolute bottom-1 right-2 text-cyan-400 text-xs">
                    ▶ EXPAND
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side Panel - Risk & Alerts */}
      <div className={`absolute right-0 top-0 bottom-0 transition-transform duration-300 ease-in-out z-40 ${rightPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Panel Content */}
        <div className="w-80 h-full bg-black/95 border-l border-gray-700/50 overflow-y-auto scrollbar-thin scrollbar-thumb-cyan-500/50 scrollbar-track-transparent">
          <div className="space-y-3 p-4 pt-8">
            {rightStackData.map((item, index) => {
              const isExpanded = windows.some(w => w.id === item.id && w.position === 'center');
              if (isExpanded) return null;
              
              return (
                <div
                  key={item.id}
                  onClick={() => expandWindow(item.id)}
                  className={`w-full h-24 bg-black/80 border-2 ${item.color} rounded-lg cursor-pointer hover:bg-black/90 relative`}
                >
                  {/* Card Title Bar */}
                  <div className={`border-b ${item.color} p-2 bg-black/50 rounded-t-lg select-none flex items-center justify-between`}>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        item.aiPriority === 'high' ? 'bg-cyan-400' :
                        item.aiPriority === 'medium' ? 'bg-yellow-400' : 'bg-gray-400'
                      }`}></div>
                      <h3 className="text-white font-medium text-xs">{item.title}</h3>
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="h-14 overflow-hidden">
                    {item.content}
                  </div>

                  {/* Expand Indicator */}
                  <div className="absolute bottom-1 right-2 text-cyan-400 text-xs">
                    ▶ EXPAND
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI-Managed Windows - Only Center Windows */}
      {windows.filter(w => w.position === 'center').map((windowData, index) => (
        <Rnd
          key={windowData.id}
          size={{ width: windowData.width, height: windowData.height }}
          position={{ x: windowData.x, y: windowData.y }}
          onDragStop={(e: any, d: any) => {
            updateWindowPosition(windowData.id, d.x, d.y);
          }}
          onResizeStop={(e: any, direction: any, ref: any, delta: any, position: any) => {
            updateWindowSize(windowData.id, ref.offsetWidth, ref.offsetHeight);
            updateWindowPosition(windowData.id, position.x, position.y);
          }}
          onDragStart={() => {
            bringToFront(windowData.id);
          }}
          dragHandleClassName="drag-handle"
          bounds="parent"
          minWidth={windowData.collapsed ? 300 : 400}
          minHeight={windowData.collapsed ? 100 : 300}
          disableDragging={windowData.collapsed}
          enableResizing={!windowData.collapsed}
          dragGrid={[5, 5]}
          resizeGrid={[5, 5]}
          style={{
            zIndex: windowData.zIndex,
          }}
        >
          <div
            className={`h-full w-full bg-black/80 border-2 ${windowData.color} rounded-lg ${windowData.collapsed ? 'cursor-pointer hover:bg-black/90' : ''}`}
            onClick={() => bringToFront(windowData.id)}
            style={{
              boxShadow: windowData.position === 'center'
                ? `0 0 10px rgba(59, 130, 246, 0.3)`
                : `0 2px 8px rgba(0,0,0,0.2)`,
            }}
          >
            {/* Window Title Bar with Holographic Effect */}
            <div
              className={`drag-handle border-b ${windowData.color} p-3 cursor-move bg-black/50 rounded-t-lg select-none flex items-center justify-between ${windowData.position === 'center' ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30' : ''}`}
            >
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${
                  windowData.aiPriority === 'high' ? 'bg-cyan-400' :
                  windowData.aiPriority === 'medium' ? 'bg-yellow-400' : 'bg-gray-400'
                }`}></div>
                <h3 className={`text-white font-medium ${windowData.collapsed ? 'text-xs' : 'text-sm'}`}>
                  {windowData.title}
                </h3>
                {windowData.position === 'center' && (
                  <div className="text-cyan-400 text-xs font-bold ml-2">[ACTIVE]</div>
                )}
              </div>
              <div className="flex space-x-2">
                {!windowData.collapsed && (
                  <>
                    <div 
                      className="w-3 h-3 bg-yellow-400 rounded-full cursor-pointer hover:bg-yellow-300"
                      onClick={(e) => {
                        e.stopPropagation();
                        collapseWindow(windowData.id);
                      }}
                      title="Collapse"
                    ></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full cursor-pointer hover:bg-green-300"></div>
                    <div className="w-3 h-3 bg-red-400 rounded-full cursor-pointer hover:bg-red-300"></div>
                  </>
                )}
              </div>
            </div>
            
            {/* Window Content */}
            <div className={`overflow-hidden ${windowData.collapsed ? 'h-[calc(100%-2.5rem)]' : 'h-[calc(100%-3rem)]'}`}>
              {windowData.content}
            </div>

            {/* Expand Indicator for Collapsed Cards */}
            {windowData.collapsed && (
              <div className="absolute bottom-2 right-2 text-cyan-400 text-xs">
                ▶ EXPAND
              </div>
            )}
          </div>
        </Rnd>
      ))}
    </div>
  );
};

export default WireframeOverlay; 