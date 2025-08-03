import React, { useState, useEffect } from 'react'
import { XMarkIcon, ChevronDownIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline'
import { useStrategySubscriptions } from '@/hooks/useStrategySubscriptions'
import { useVaultVerification } from '@/hooks/useVaultVerification'
import { useVaultAddress } from '@/hooks/useVaultAddress'
import { useAccount } from 'wagmi'
import TokenIcon from '@/components/TokenIcon'
import { SUPPORTED_CHAINS } from '@/config/tokens'

interface StrategyManagerProps {
  onClose: () => void
}

const StrategyManager: React.FC<StrategyManagerProps> = ({ onClose }) => {
  const { address } = useAccount()
  const { strategies, subscriptions, isLoadingStrategies, isLoadingSubscriptions, subscribe, updateSubscription, deleteSubscription } = useStrategySubscriptions()
  const { hasVault, isLoading: isVaultLoading } = useVaultVerification(true)
  
  const [selectedStrategy, setSelectedStrategy] = useState<any>(null)
  const [percentage, setPercentage] = useState('')
  const [isStrategyDropdownOpen, setIsStrategyDropdownOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<string | null>(null)
  const [editPercentage, setEditPercentage] = useState('')

  // Get vault address for selected strategy's chain
  const selectedChainId = selectedStrategy ? 
    SUPPORTED_CHAINS.find(c => c.name.toLowerCase() === selectedStrategy.chain.toLowerCase())?.id : 
    undefined
  const { vaultAddress } = useVaultAddress(address, selectedChainId)

  // Set initial selected strategy when strategies load
  useEffect(() => {
    if (strategies.length > 0 && !selectedStrategy) {
      setSelectedStrategy(strategies[0])
    }
  }, [strategies, selectedStrategy])

  // Calculate total percentage allocated per chain
  const getChainAllocation = (chain: string) => {
    return subscriptions
      .filter(sub => sub.chain.toLowerCase() === chain.toLowerCase() && sub.enabled)
      .reduce((total, sub) => total + sub.percentage, 0)
  }

  // Get remaining allocation for a chain
  const getRemainingAllocation = (chain: string) => {
    return 100 - getChainAllocation(chain)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address) {
      alert('Please connect your wallet first.')
      return
    }

    if (!hasVault && !isVaultLoading) {
      alert('Please deploy a vault first.')
      return
    }

    if (!selectedStrategy || !percentage) {
      alert('Please select a strategy and enter a percentage.')
      return
    }


    const percentageNum = parseInt(percentage)
    if (percentageNum < 1 || percentageNum > 100) {
      alert('Percentage must be between 1 and 100.')
      return
    }

    const remaining = getRemainingAllocation(selectedStrategy.chain)
    if (percentageNum > remaining) {
      alert(`Cannot allocate ${percentageNum}%. Only ${remaining}% remaining for ${selectedStrategy.chain} chain.`)
      return
    }

    if (!vaultAddress) {
      console.error('Vault address not found for chain:', selectedStrategy.chain)
      return
    }

    try {
      setIsSubmitting(true)
      await subscribe(selectedStrategy.id, percentageNum, selectedStrategy.chain, vaultAddress)
      setPercentage('')
      setSelectedStrategy(strategies[0]) // Reset to first strategy
    } catch (error) {
      console.error('Error subscribing to strategy:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (taskId: string) => {
    const percentageNum = parseInt(editPercentage)
    if (percentageNum < 1 || percentageNum > 100) {
      alert('Percentage must be between 1 and 100.')
      return
    }

    const subscription = subscriptions.find(sub => sub._id === taskId)
    if (!subscription) return

    const currentAllocation = getChainAllocation(subscription.chain)
    const newAllocation = currentAllocation - subscription.percentage + percentageNum
    
    if (newAllocation > 100) {
      alert(`Cannot set to ${percentageNum}%. Total allocation for ${subscription.chain} would exceed 100%.`)
      return
    }

    try {
      await updateSubscription(taskId, { percentage: percentageNum })
      setEditingSubscription(null)
      setEditPercentage('')
    } catch (error) {
      console.error('Error updating subscription:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this strategy subscription?')) {
      return
    }

    try {
      await deleteSubscription(taskId)
    } catch (error) {
      console.error('Error deleting subscription:', error)
    }
  }

  const handleToggleEnabled = async (taskId: string, enabled: boolean) => {
    try {
      await updateSubscription(taskId, { enabled })
    } catch (error) {
      console.error('Error toggling subscription:', error)
    }
  }

  if (isLoadingStrategies) {
    return (
      <div className="rounded-2xl border border-slate-700/40 bg-slate-900/80 backdrop-blur-md p-6 h-full overflow-y-auto">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto mb-4"></div>
            <div className="text-gray-400">Loading strategies...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-slate-900/80 backdrop-blur-md p-6 h-full overflow-y-auto">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-white">Strategy Manager</h2>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-gray-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Active Strategies Section */}
      {isLoadingSubscriptions ? (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Active Strategies</h3>
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent mx-auto mb-2"></div>
              <div className="text-gray-400 text-sm">Loading your strategies...</div>
            </div>
          </div>
        </div>
      ) : subscriptions.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-white mb-4">Active Strategies</h3>
          
          {/* Chain allocation summary */}
          <div className="mb-4 space-y-3">
            <div className="text-xs text-gray-400 italic">
              Each chain's strategies allocate funds independently. No cross-chain transfers.
            </div>
            {Array.from(new Set(subscriptions.map(s => s.chain))).map(chain => {
              const allocation = getChainAllocation(chain)
              return (
                <div key={chain} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">{chain} vault funds allocated:</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${allocation > 90 ? 'bg-red-500' : allocation > 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${allocation}%` }}
                      />
                    </div>
                    <span className="text-white font-medium w-12 text-right">{allocation}%</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub._id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {sub.strategy?.tokens.map(token => (
                        <TokenIcon key={token} symbol={token} className="w-5 h-5" />
                      ))}
                    </div>
                    <div>
                      <div className="font-medium text-white">{sub.strategy?.name || sub.strategy_id}</div>
                      <div className="text-sm text-gray-400">{sub.chain} • {sub.strategy?.frequency}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {editingSubscription === sub._id ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={editPercentage}
                            onChange={(e) => setEditPercentage(e.target.value)}
                            className="w-16 px-2 py-1 text-sm bg-gray-700 border border-gray-600 rounded text-white"
                            placeholder="%"
                            min="1"
                            max="100"
                          />
                          <button
                            onClick={() => handleUpdate(sub._id)}
                            className="px-2 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setEditingSubscription(null)
                              setEditPercentage('')
                            }}
                            className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-700 text-white rounded"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-white font-medium">{sub.percentage}%</span>
                        <button
                          onClick={() => {
                            setEditingSubscription(sub._id)
                            setEditPercentage(sub.percentage.toString())
                          }}
                          className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                          title="Edit percentage"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleToggleEnabled(sub._id, !sub.enabled)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            sub.enabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {sub.enabled ? 'Active' : 'Paused'}
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id)}
                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                          title="Delete strategy"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Strategy Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <h3 className="text-lg font-semibold text-white">Add New Strategy</h3>
        
        {/* Strategy Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-300">Choose Strategy</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStrategyDropdownOpen(!isStrategyDropdownOpen)}
              className="w-full rounded-xl border border-gray-600/60 bg-gray-800/80 px-4 py-4 text-left text-white transition-all duration-200 hover:border-gray-500/60 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            >
              {selectedStrategy ? (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="flex items-center space-x-2">
                        {selectedStrategy.tokens.map((token: string) => (
                          <TokenIcon key={token} symbol={token} className="w-5 h-5" />
                        ))}
                      </div>
                      <div className="font-medium">{selectedStrategy.name}</div>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">{selectedStrategy.description}</div>
                    <div className="flex items-center space-x-3 text-xs">
                      <span className="text-gray-500">{selectedStrategy.chain} • {selectedStrategy.frequency}</span>
                      {selectedStrategy.current_yields && Object.keys(selectedStrategy.current_yields).length > 0 && (
                        <span className="text-green-400">
                          Current APY: {Object.entries(selectedStrategy.current_yields).map(([token, apy]) => 
                            `${token} ${apy}%`
                          ).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <ChevronDownIcon
                    className={`h-5 w-5 text-gray-400 transition-transform ml-2 ${isStrategyDropdownOpen ? 'rotate-180' : ''}`}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Select a strategy</span>
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                </div>
              )}
            </button>
            
            {isStrategyDropdownOpen && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-gray-600/60 bg-gray-800/95 shadow-lg backdrop-blur-md">
                <div className="max-h-80 overflow-y-auto p-2">
                  {strategies.map((strategy) => {
                    const isAlreadySubscribed = subscriptions.some(sub => sub.strategy_id === strategy.id)
                    return (
                      <button
                        key={strategy.id}
                        type="button"
                        onClick={() => {
                          if (!isAlreadySubscribed) {
                            setSelectedStrategy(strategy)
                            setIsStrategyDropdownOpen(false)
                          }
                        }}
                        disabled={isAlreadySubscribed}
                        className={`w-full rounded-md px-3 py-3 text-left transition-colors ${
                          isAlreadySubscribed 
                            ? 'opacity-50 cursor-not-allowed bg-gray-800/50' 
                            : 'hover:bg-gray-700/50'
                        } border-b border-gray-700/30 last:border-b-0`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-2">
                                {strategy.tokens.map((token: string) => (
                                  <TokenIcon key={token} symbol={token} className="w-5 h-5" />
                                ))}
                              </div>
                              <div className="font-medium text-white">
                                {strategy.name}
                                {isAlreadySubscribed && <span className="ml-2 text-xs text-gray-500">(Already subscribed)</span>}
                              </div>
                            </div>
                            <div className="text-sm text-gray-400 mb-2">{strategy.description}</div>
                            <div className="flex items-center space-x-3 text-xs">
                              <span className="text-gray-500">{strategy.chain} • {strategy.frequency}</span>
                              {strategy.current_yields && Object.keys(strategy.current_yields).length > 0 && (
                                <span className="text-green-400">
                                  APY: {Object.entries(strategy.current_yields).map(([token, apy]) => 
                                    `${token} ${apy}%`
                                  ).join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Strategy Details */}
        {selectedStrategy && (
          <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-4">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Strategy Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Chain:</span>
                <span className="text-white">{selectedStrategy.chain}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tokens:</span>
                <span className="text-white flex items-center space-x-1">
                  {selectedStrategy.tokens.map((token: string) => (
                    <div key={token} className="flex items-center space-x-1">
                      <TokenIcon symbol={token} className="w-4 h-4" />
                      <span>{token}</span>
                    </div>
                  ))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Protocols:</span>
                <span className="text-white">{selectedStrategy.protocols.join(', ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Frequency:</span>
                <span className="text-white">{selectedStrategy.frequency}</span>
              </div>
              {selectedStrategy.current_yields && Object.keys(selectedStrategy.current_yields).length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Current Yields:</span>
                  <span className="text-white">
                    {Object.entries(selectedStrategy.current_yields).map(([token, apy], index) => (
                      <span key={token}>
                        {index > 0 && ', '}
                        {token}: <span className="text-green-400">{apy}% APY</span>
                      </span>
                    ))}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Percentage Input */}
        {selectedStrategy && (
          <div>
            <div className="mb-2">
              <label className="text-sm font-medium text-gray-300">
                Allocation Percentage of {selectedStrategy.chain} Vault Funds
              </label>
              <div className="text-xs text-gray-400 mt-1">
                Available: {getRemainingAllocation(selectedStrategy.chain)}% • This allocates {selectedStrategy.chain} vault funds only
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder="Enter percentage (1-100)"
                min="1"
                max="100"
                className="w-full rounded-xl border border-gray-600/60 bg-gray-800/80 py-3 px-4 pr-12 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            !selectedStrategy ||
            !percentage ||
            parseInt(percentage) < 1 ||
            parseInt(percentage) > 100 ||
            !hasVault ||
            isVaultLoading ||
            isSubmitting ||
            (selectedStrategy && subscriptions.some(sub => sub.strategy_id === selectedStrategy.id))
          }
          className={`w-full rounded-xl px-4 py-3 font-medium transition-colors ${
            selectedStrategy && percentage && parseInt(percentage) >= 1 && parseInt(percentage) <= 100 && hasVault && !isVaultLoading && !isSubmitting && !subscriptions.some(sub => sub.strategy_id === selectedStrategy.id)
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'cursor-not-allowed bg-gray-700 text-gray-400'
          }`}
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              <span>Subscribing...</span>
            </div>
          ) : !hasVault && !isVaultLoading ? (
            'Deploy Vault First'
          ) : isVaultLoading ? (
            'Loading Vault...'
          ) : selectedStrategy && subscriptions.some(sub => sub.strategy_id === selectedStrategy.id) ? (
            'Already Subscribed'
          ) : (
            'Subscribe to Strategy'
          )}
        </button>
      </form>
    </div>
  )
}

export default StrategyManager