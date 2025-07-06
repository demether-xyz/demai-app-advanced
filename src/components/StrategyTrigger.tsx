import React, { useState, useEffect } from 'react'
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
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
  protocol: string
  apy: number
  description: string
  riskLevel: 'low' | 'medium' | 'high'
}

const availableStrategies: Strategy[] = [
  {
    id: 'aave-lending',
    name: 'Lending - 8.5% APY',
    protocol: 'Aave',
    apy: 8.5,
    description: 'Lend assets to earn interest',
    riskLevel: 'low'
  },
  {
    id: 'compound-supply',
    name: 'Supply - 12.3% APY',
    protocol: 'Compound',
    apy: 12.3,
    description: 'Supply assets to earn compound interest',
    riskLevel: 'low'
  },
  {
    id: 'uniswap-v3-lp',
    name: 'Liquidity Pool - 18.7% APY',
    protocol: 'Uniswap V3',
    apy: 18.7,
    description: 'Provide liquidity to earn fees',
    riskLevel: 'medium'
  },
  {
    id: 'curve-staking',
    name: 'Staking - 15.2% APY',
    protocol: 'Curve',
    apy: 15.2,
    description: 'Stake in curve pools',
    riskLevel: 'medium'
  },
  {
    id: 'yearn-vault',
    name: 'Auto-Compound - 21.4% APY',
    protocol: 'Yearn',
    apy: 21.4,
    description: 'Automated yield farming',
    riskLevel: 'high'
  }
]

const StrategyTrigger: React.FC<StrategyTriggerProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const currentChainId = useChainId()
  const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0])
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [selectedStrategy, setSelectedStrategy] = useState<string>('aave-lending')
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false)
  const [isStrategyDropdownOpen, setIsStrategyDropdownOpen] = useState(false)

  // Use the vault verification system - only when modal is open
  const {
    hasVault,
    isLoading: isVaultLoading,
  } = useVaultVerification(isOpen)

  // Use the vault address hook for address calculation
  const { vaultAddress } = useVaultAddress(address, selectedChain.id)

  // Event emitter for portfolio updates
  const emit = useEventEmitter()

  // Get vault token balances (only tokens in the vault can be used for strategies)
  const {
    tokens: vaultTokens,
    isLoading: isVaultTokensLoading,
    refetch: refetchVaultTokens,
  } = useVaultTokenBalances(hasVault ? vaultAddress : undefined)

  // Get available tokens for current chain
  const chainTokens = getTokensForChain(selectedChain.id)
  
  // Set default selected token when chain changes
  useEffect(() => {
    if (chainTokens.length > 0 && !selectedTokenSymbol) {
      setSelectedTokenSymbol(chainTokens[0].symbol)
    } else if (chainTokens.length > 0 && !chainTokens.find(t => t.symbol === selectedTokenSymbol)) {
      // If current selected token is not available on this chain, select first available
      setSelectedTokenSymbol(chainTokens[0].symbol)
    }
  }, [chainTokens, selectedTokenSymbol])

  // Find the currently selected token data with balance info
  // Prefer vaultTokens (has balance data) but fall back to chainTokens (has decimals)
  const selectedToken = vaultTokens.find(t => t.symbol === selectedTokenSymbol) || 
    chainTokens.find(t => t.symbol === selectedTokenSymbol) || null

  const selectedStrategyData = availableStrategies.find(s => s.id === selectedStrategy)

  // Auto-switch to a supported chain when modal opens
  useEffect(() => {
    if (isOpen && currentChainId && !SUPPORTED_CHAINS.find(chain => chain.id === currentChainId)) {
      setSelectedChain(SUPPORTED_CHAINS[0])
    } else if (isOpen && currentChainId) {
      const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === currentChainId)
      if (currentChain) {
        setSelectedChain(currentChain)
      }
    }
  }, [isOpen, currentChainId])

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
      asset: selectedTokenSymbol,
      amount: parseFloat(amount),
      strategy: selectedStrategy,
      vaultAddress,
      chainId: selectedChain.id
    })
    
    // Emit portfolio update event
    emit('app.portfolio.refresh')
    
    // Reset form and close
    setAmount('')
    onClose()
  }

  const handleMaxClick = () => {
    if (selectedToken && 'balance' in selectedToken) {
      // Use actual balance from token data, removing any commas for input
      setAmount(selectedToken.balance.replace(/,/g, ''))
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 my-auto w-full max-w-md rounded-xl border border-gray-700/50 bg-gray-900/95 p-6 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Trigger Strategy</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-gray-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Chain Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Chain</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsChainDropdownOpen(!isChainDropdownOpen)}
                className="w-full rounded-lg border border-gray-600/60 bg-gray-800/80 px-4 py-3 text-left text-white transition-all duration-200 hover:border-gray-500/60 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{selectedChain.icon}</span>
                    <div>
                      <div className="font-medium">{selectedChain.name}</div>
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transition-transform ${isChainDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {isChainDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-600/60 bg-gray-800/95 shadow-lg backdrop-blur-md">
                  <div className="p-1">
                    {SUPPORTED_CHAINS.map((chain) => (
                      <button
                        key={chain.id}
                        type="button"
                        onClick={() => {
                          setSelectedChain(chain)
                          setIsChainDropdownOpen(false)
                        }}
                        className="w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-700/50"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className="text-lg">{chain.icon}</span>
                            <div>
                              <div className="font-medium text-white">{chain.name}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">{chain.nativeCurrency}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Token Selection */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Token (from Vault)</label>
              {vaultAddress && (
                <button
                  type="button"
                  onClick={refetchVaultTokens}
                  disabled={isVaultTokensLoading}
                  className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                  {isVaultTokensLoading ? 'Loading...' : 'Refresh vault balances'}
                </button>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                className="w-full rounded-lg border border-gray-600/60 bg-gray-800/80 px-4 py-3 text-left text-white transition-all duration-200 hover:border-gray-500/60 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <TokenIcon 
                      symbol={selectedToken?.symbol || 'DEFAULT'} 
                      className="w-6 h-6"
                    />
                    <div>
                      <div className="font-medium">{selectedToken?.symbol || 'Select Token'}</div>
                      <div className="text-xs text-gray-400">{selectedToken?.name || 'No token selected'}</div>
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transition-transform ${isTokenDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>

              {isTokenDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-600/60 bg-gray-800/95 shadow-lg backdrop-blur-md">
                  <div className="max-h-60 overflow-y-auto p-1">
                    {vaultTokens.length > 0 ? (
                      vaultTokens.map((token) => (
                        <button
                          key={token.symbol}
                          type="button"
                          onClick={() => {
                            setSelectedTokenSymbol(token.symbol)
                            setIsTokenDropdownOpen(false)
                          }}
                          className="w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-700/50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <TokenIcon 
                                symbol={token.symbol} 
                                className="w-6 h-6"
                              />
                              <div>
                                <div className="font-medium text-white">{token.symbol}</div>
                                <div className="text-xs text-gray-400">{token.name}</div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-300">
                                {isVaultTokensLoading ? '...' : token.balance}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-400">
                        {!hasVault ? 'Deploy a vault first' : 'No tokens in vault'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">Amount</label>
              {selectedToken && 'balance' in selectedToken && (
                <div className="text-xs text-gray-400">
                  Vault Balance: {selectedToken.balance} {selectedToken.symbol}
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
              {selectedToken && 'balance' in selectedToken && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                >
                  MAX
                </button>
              )}
            </div>
            {selectedToken && 'balance' in selectedToken && (
              <div className="mt-1 text-xs text-gray-500">
                Available for strategy: {selectedToken.balance} {selectedToken.symbol} (from vault)
              </div>
            )}
          </div>

          {/* Strategy Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Opportunity</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStrategyDropdownOpen(!isStrategyDropdownOpen)}
                className="w-full rounded-lg border border-gray-600/60 bg-gray-800/80 px-4 py-3 text-left text-white transition-all duration-200 hover:border-gray-500/60 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{selectedStrategyData?.name}</div>
                    <div className="text-xs text-gray-400">{selectedStrategyData?.protocol}</div>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transition-transform ${isStrategyDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              </button>
              
              {isStrategyDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-600/60 bg-gray-800/95 shadow-lg backdrop-blur-md">
                  <div className="max-h-60 overflow-y-auto p-1">
                    {availableStrategies.map((strategy) => (
                      <button
                        key={strategy.id}
                        type="button"
                        onClick={() => {
                          setSelectedStrategy(strategy.id)
                          setIsStrategyDropdownOpen(false)
                        }}
                        className="w-full rounded-md px-3 py-2 text-left transition-colors hover:bg-gray-700/50"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-white">{strategy.name}</div>
                            <div className="text-xs text-gray-400">{strategy.protocol} • {strategy.description}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-medium">{strategy.apy}%</div>
                            <div className={`text-xs ${getRiskColor(strategy.riskLevel)}`}>
                              {strategy.riskLevel} risk
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              !amount || 
              parseFloat(amount) <= 0 || 
              !hasVault || 
              isVaultLoading ||
              !selectedToken ||
              vaultTokens.length === 0
            }
            className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
              amount && parseFloat(amount) > 0 && hasVault && !isVaultLoading && selectedToken && vaultTokens.length > 0
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-700 text-gray-400'
            }`}
          >
            {!hasVault && !isVaultLoading
              ? 'Deploy Vault First'
              : isVaultLoading
                ? 'Loading Vault...'
                : vaultTokens.length === 0
                  ? 'No Tokens in Vault'
                  : `Execute ${selectedStrategyData?.protocol || 'Strategy'} on ${selectedChain.name}`
            }
          </button>
        </form>
      </div>
    </div>
  )
}

export default StrategyTrigger 