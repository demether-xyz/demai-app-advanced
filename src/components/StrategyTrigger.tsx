import React, { useState, useEffect } from 'react'
import { XMarkIcon, ChevronDownIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import { useAccount, useChainId } from 'wagmi'
import { useVaultVerification } from '../hooks/useVaultVerification'
import { useVaultTokenBalances } from '../hooks/useVaultTokenBalances'
import { useVaultAddress } from '../hooks/useVaultAddress'
import { useEventEmitter } from '../hooks/useEvents'
import { getTokensForChain } from '../config/tokens'
import TokenIcon from './TokenIcon'
import { useStrategies, Strategy } from '../hooks/useStrategies'

interface StrategyTriggerProps {
  isOpen: boolean
  onClose: () => void
}

// Remove hardcoded strategies - use API data from useStrategies hook

const StrategyTrigger: React.FC<StrategyTriggerProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  
  // Use the strategies hook to get API data
  const { strategies: availableStrategies, isLoading: isStrategiesLoading } = useStrategies()
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null)
  const [amount, setAmount] = useState('')
  const [isStrategyDropdownOpen, setIsStrategyDropdownOpen] = useState(false)
  const [showStrategyDetails, setShowStrategyDetails] = useState(false)

  // ALL HOOKS MUST BE CALLED BEFORE ANY EARLY RETURNS
  // Use the vault verification system - only when modal is open
  const {
    hasVault,
    isLoading: isVaultLoading,
  } = useVaultVerification(isOpen)

  // Use the vault address hook for address calculation
  const { vaultAddress } = useVaultAddress(address, selectedStrategy?.chain?.id ?? 1)

  // Event emitter for portfolio updates
  const emit = useEventEmitter()

  // Get vault token balances (only tokens in the vault can be used for strategies)
  const {
    tokens: vaultTokens,
  } = useVaultTokenBalances(hasVault ? vaultAddress : undefined)

  // Set the first available strategy when strategies load
  useEffect(() => {
    if (availableStrategies.length > 0 && !selectedStrategy) {
      setSelectedStrategy(availableStrategies[0])
    }
  }, [availableStrategies, selectedStrategy])

  // Format APY values to 4 decimal places
  const formatAPY = (apy: number) => {
    return apy.toFixed(4)
  }

  // Don't render if no strategy is selected or still loading
  if (!selectedStrategy || isStrategiesLoading || !selectedStrategy.chain) {
    return null
  }

  // Find the primary token for the selected strategy
  const primaryToken = vaultTokens.find(t => t.symbol === selectedStrategy.primaryToken) || 
    (selectedStrategy.chain ? getTokensForChain(selectedStrategy.chain.id).find(t => t.symbol === selectedStrategy.primaryToken) : undefined)

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
                      <div className="text-green-400 font-medium">{formatAPY(selectedStrategy.apy)}% APY</div>
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
                              <div className="text-green-400 font-medium">{formatAPY(strategy.apy)}% APY</div>
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