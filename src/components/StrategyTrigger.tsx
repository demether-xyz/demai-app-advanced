import React, { useState, useEffect } from 'react'
import { XMarkIcon, ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { useAccount, useChainId } from 'wagmi'
import { useVaultVerification } from '../hooks/useVaultVerification'
import { useVaultTokenBalances } from '../hooks/useVaultTokenBalances'
import { useVaultAddress } from '../hooks/useVaultAddress'
import { useEventEmitter } from '../hooks/useEvents'
import { getTokensForChain, SUPPORTED_CHAINS, Chain } from '../config/tokens'
import TokenIcon from './TokenIcon'

interface StrategyTriggerProps {
  isOpen: boolean
  onClose: () => void
}

interface Strategy {
  id: string
  name: string
  description: string
  detailedDescription: string
  chain: Chain
  primaryToken: string
  secondaryTokens?: string[]
  apy: number
  riskLevel: 'low' | 'medium' | 'high'
  updateFrequency: string
  protocol: string
  thresholdInfo?: string
}

const availableStrategies: Strategy[] = [
  {
    id: 'bitcoin-core-yield-optimizer',
    name: 'Bitcoin Core Yield Optimizer',
    description: 'Automatically swaps between Bitcoin variants on Core chain for maximum yield',
    detailedDescription: 'This strategy invests in Bitcoin on Core chain and intelligently swaps between three Bitcoin variants (coreBTC, WBTC, and stBTC) based on yield optimization. The strategy updates daily to monitor which variant offers the highest yield and automatically rebalances when there\'s a significant threshold change. All deposits are managed through CoLand protocol for secure yield generation.',
    chain: SUPPORTED_CHAINS.find(c => c.name === 'Core') || SUPPORTED_CHAINS[0],
    primaryToken: 'BTC',
    secondaryTokens: ['coreBTC', 'WBTC', 'stBTC'],
    apy: 12.5,
    riskLevel: 'medium',
    updateFrequency: 'Daily',
    protocol: 'CoLand',
    thresholdInfo: 'Rebalances when yield difference exceeds 0.5%'
  },
  {
    id: 'ethereum-defi-maximizer',
    name: 'Ethereum DeFi Maximizer',
    description: 'Multi-protocol ETH strategy across Aave, Compound, and Lido',
    detailedDescription: 'This strategy optimizes ETH yields by dynamically allocating between Aave lending, Compound supply, and Lido staking. The algorithm monitors real-time APY rates across all three protocols and automatically rebalances your ETH to the highest-yielding opportunity. Updates occur every 6 hours to capture rate changes and maximize compound growth.',
    chain: SUPPORTED_CHAINS.find(c => c.name === 'Ethereum') || SUPPORTED_CHAINS[0],
    primaryToken: 'ETH',
    secondaryTokens: ['stETH', 'aETH', 'cETH'],
    apy: 8.7,
    riskLevel: 'low',
    updateFrequency: 'Every 6 hours',
    protocol: 'Multi-Protocol',
    thresholdInfo: 'Rebalances when yield difference exceeds 0.3%'
  },
  {
    id: 'arbitrum-stable-yield',
    name: 'Arbitrum Stable Yield',
    description: 'USDC yield optimization across Arbitrum DeFi protocols',
    detailedDescription: 'Focuses on stable yield generation using USDC across Arbitrum\'s DeFi ecosystem. The strategy rotates between GMX, Radiant Capital, and Curve Finance based on the highest stable yields available. Perfect for conservative investors seeking steady returns with minimal impermanent loss risk.',
    chain: SUPPORTED_CHAINS.find(c => c.name === 'Arbitrum') || SUPPORTED_CHAINS[0],
    primaryToken: 'USDC',
    secondaryTokens: ['GMX', 'RDNT', 'CRV'],
    apy: 6.8,
    riskLevel: 'low',
    updateFrequency: 'Daily',
    protocol: 'Multi-Protocol',
    thresholdInfo: 'Rebalances when yield difference exceeds 0.2%'
  },
  {
    id: 'uniswap-v3-concentrated',
    name: 'Uniswap V3 Concentrated Liquidity',
    description: 'Active liquidity management for maximum fee collection',
    detailedDescription: 'Advanced Uniswap V3 strategy that actively manages concentrated liquidity positions to maximize fee collection. The strategy automatically adjusts position ranges based on market volatility and rebalances between different fee tiers. Includes automated compounding of collected fees back into the position.',
    chain: SUPPORTED_CHAINS.find(c => c.name === 'Ethereum') || SUPPORTED_CHAINS[0],
    primaryToken: 'ETH',
    secondaryTokens: ['USDC'],
    apy: 18.3,
    riskLevel: 'high',
    updateFrequency: 'Every 2 hours',
    protocol: 'Uniswap V3',
    thresholdInfo: 'Adjusts ranges when price moves 2% from center'
  }
]

const StrategyTrigger: React.FC<StrategyTriggerProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const currentChainId = useChainId()
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy>(availableStrategies[0])
  const [amount, setAmount] = useState('')
  const [isStrategyDropdownOpen, setIsStrategyDropdownOpen] = useState(false)
  const [showStrategyDetails, setShowStrategyDetails] = useState(false)

  // Use the vault verification system - only when modal is open
  const {
    hasVault,
    isLoading: isVaultLoading,
  } = useVaultVerification(isOpen)

  // Use the vault address hook for address calculation
  const { vaultAddress } = useVaultAddress(address, selectedStrategy.chain.id)

  // Event emitter for portfolio updates
  const emit = useEventEmitter()

  // Get vault token balances (only tokens in the vault can be used for strategies)
  const {
    tokens: vaultTokens,
    isLoading: isVaultTokensLoading,
    refetch: refetchVaultTokens,
  } = useVaultTokenBalances(hasVault ? vaultAddress : undefined)

  // Find the primary token for the selected strategy
  const primaryToken = vaultTokens.find(t => t.symbol === selectedStrategy.primaryToken) || 
    getTokensForChain(selectedStrategy.chain.id).find(t => t.symbol === selectedStrategy.primaryToken)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      alert('Please connect your wallet first.')
      return
    }

    if (!hasVault && !isVaultLoading) {
      alert('Please deploy a vault first.')
      return
    }

    // TODO: Implement actual strategy execution logic
    console.log('Executing strategy:', {
      strategy: selectedStrategy.id,
      strategyName: selectedStrategy.name,
      amount: parseFloat(amount),
      primaryToken: selectedStrategy.primaryToken,
      chain: selectedStrategy.chain.name,
      vaultAddress,
      chainId: selectedStrategy.chain.id
    })
    
    // Emit portfolio update event
    emit('app.portfolio.refresh')
    
    // Reset form and close
    setAmount('')
    onClose()
  }

  const handleMaxClick = () => {
    if (primaryToken && 'balance' in primaryToken) {
      // Use actual balance from token data, removing any commas for input
      setAmount(primaryToken.balance.replace(/,/g, ''))
    }
  }

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-400/20 text-green-400'
      case 'medium': return 'bg-yellow-400/20 text-yellow-400'
      case 'high': return 'bg-red-400/20 text-red-400'
      default: return 'bg-gray-400/20 text-gray-400'
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 my-auto w-full max-w-lg rounded-xl border border-gray-700/50 bg-gray-900/95 p-6 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Select Strategy</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-gray-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Strategy Selection */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-300">Choose Your Strategy</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStrategyDropdownOpen(!isStrategyDropdownOpen)}
                className="w-full rounded-lg border border-gray-600/60 bg-gray-800/80 px-4 py-4 text-left text-white transition-all duration-200 hover:border-gray-500/60 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{selectedStrategy.chain.icon}</span>
                        <TokenIcon 
                          symbol={selectedStrategy.primaryToken} 
                          className="w-5 h-5"
                        />
                      </div>
                      <div className="font-medium">{selectedStrategy.name}</div>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">{selectedStrategy.description}</div>
                    <div className="flex items-center space-x-3">
                      <div className="text-green-400 font-medium">{selectedStrategy.apy}% APY</div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(selectedStrategy.riskLevel)}`}>
                        {selectedStrategy.riskLevel} risk
                      </span>
                      <div className="text-xs text-gray-500">{selectedStrategy.updateFrequency}</div>
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transition-transform ml-2 ${isStrategyDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>
              
              {isStrategyDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-600/60 bg-gray-800/95 shadow-lg backdrop-blur-md">
                  <div className="max-h-80 overflow-y-auto p-2">
                    {availableStrategies.map((strategy) => (
                      <button
                        key={strategy.id}
                        type="button"
                        onClick={() => {
                          setSelectedStrategy(strategy)
                          setIsStrategyDropdownOpen(false)
                        }}
                        className="w-full rounded-md px-3 py-3 text-left transition-colors hover:bg-gray-700/50 border-b border-gray-700/30 last:border-b-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-lg">{strategy.chain.icon}</span>
                                <TokenIcon 
                                  symbol={strategy.primaryToken} 
                                  className="w-5 h-5"
                                />
                              </div>
                              <div className="font-medium text-white">{strategy.name}</div>
                            </div>
                            <div className="text-sm text-gray-400 mb-2">{strategy.description}</div>
                            <div className="flex items-center space-x-3">
                              <div className="text-green-400 font-medium">{strategy.apy}% APY</div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskBadgeColor(strategy.riskLevel)}`}>
                                {strategy.riskLevel} risk
                              </span>
                              <div className="text-xs text-gray-500">{strategy.updateFrequency}</div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Strategy Details */}
          <div className="rounded-lg border border-gray-700/50 bg-gray-800/40 p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">Strategy Details</h3>
              <button
                type="button"
                onClick={() => setShowStrategyDetails(!showStrategyDetails)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                <InformationCircleIcon className="h-4 w-4" />
              </button>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Chain:</span>
                <span className="text-white flex items-center space-x-1">
                  <span>{selectedStrategy.chain.icon}</span>
                  <span>{selectedStrategy.chain.name}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Primary Token:</span>
                <span className="text-white flex items-center space-x-1">
                  <TokenIcon symbol={selectedStrategy.primaryToken} className="w-4 h-4" />
                  <span>{selectedStrategy.primaryToken}</span>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protocol:</span>
                <span className="text-white">{selectedStrategy.protocol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Updates:</span>
                <span className="text-white">{selectedStrategy.updateFrequency}</span>
              </div>
              {selectedStrategy.thresholdInfo && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Threshold:</span>
                  <span className="text-white text-xs">{selectedStrategy.thresholdInfo}</span>
                </div>
              )}
            </div>

            {showStrategyDetails && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-300 leading-relaxed">
                  {selectedStrategy.detailedDescription}
                </p>
                {selectedStrategy.secondaryTokens && (
                  <div className="mt-3">
                    <div className="text-xs text-gray-400 mb-1">Manages tokens:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedStrategy.secondaryTokens.map((token) => (
                        <span key={token} className="px-2 py-1 bg-gray-700/50 rounded text-xs text-gray-300">
                          {token}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Amount Input */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Amount ({selectedStrategy.primaryToken})
              </label>
              {primaryToken && 'balance' in primaryToken && (
                <div className="text-xs text-gray-400">
                  Vault Balance: {primaryToken.balance} {primaryToken.symbol}
                </div>
              )}
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-lg border border-gray-600/60 bg-gray-800/80 py-3 px-4 pr-16 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              {primaryToken && 'balance' in primaryToken && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  MAX
                </button>
              )}
            </div>
            {primaryToken && 'balance' in primaryToken && (
              <div className="mt-1 text-xs text-gray-500">
                Available: {primaryToken.balance} {primaryToken.symbol} (from vault on {selectedStrategy.chain.name})
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              !amount || 
              parseFloat(amount) <= 0 || 
              !hasVault || 
              isVaultLoading ||
              !primaryToken
            }
            className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
              amount && parseFloat(amount) > 0 && hasVault && !isVaultLoading && primaryToken
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-700 text-gray-400'
            }`}
          >
            {!hasVault && !isVaultLoading
              ? 'Deploy Vault First'
              : isVaultLoading
                ? 'Loading Vault...'
                : !primaryToken
                  ? `No ${selectedStrategy.primaryToken} in Vault`
                  : `Execute ${selectedStrategy.name}`
            }
          </button>
        </form>
      </div>
    </div>
  )
}

export default StrategyTrigger 