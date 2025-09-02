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

  // Helper function to format dates
  const formatDate = (dateString: string | any) => {
    // Handle MongoDB date objects
    let dateStr = typeof dateString === 'object' && dateString.$date ? dateString.$date : dateString
    
    // If the date string doesn't end with 'Z', add it to treat as UTC
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
      dateStr = dateStr.replace('000', '') + 'Z'  // Remove microseconds and add Z
    }
    
    const date = new Date(dateStr)
    const now = new Date()
    
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    const diffHours = Math.round(diffMinutes / 60)
    const diffDays = Math.round(diffHours / 24)
    
    if (diffMinutes < 1) {
      return 'just now'
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min ago`
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  // Helper function to format future dates
  const formatFutureDate = (dateString: string | any) => {
    // Handle MongoDB date objects
    let dateStr = typeof dateString === 'object' && dateString.$date ? dateString.$date : dateString
    
    // If the date string doesn't end with 'Z', add it to treat as UTC
    if (typeof dateStr === 'string' && !dateStr.endsWith('Z') && !dateStr.includes('+')) {
      dateStr = dateStr.replace('000', '') + 'Z'  // Remove microseconds and add Z
    }
    
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = date.getTime() - now.getTime()
    const diffMinutes = Math.round(diffMs / (1000 * 60))
    const diffHours = Math.round(diffMinutes / 60)
    const diffDays = Math.round(diffHours / 24)
    
    if (diffMinutes < 1) {
      return 'any moment'
    } else if (diffMinutes < 60) {
      return `in ${diffMinutes} min`
    } else if (diffHours < 24) {
      return `in ${diffHours} hour${diffHours > 1 ? 's' : ''}`
    } else if (diffDays < 7) {
      return `in ${diffDays} day${diffDays > 1 ? 's' : ''}`
    } else {
      return date.toLocaleDateString()
    }
  }

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
      console.error('Cannot submit: wallet not connected')
      return
    }

    if (!hasVault && !isVaultLoading) {
      console.error('Cannot submit: vault not deployed')
      return
    }

    if (!selectedStrategy || !percentage) {
      console.error('Cannot submit: strategy or percentage not selected')
      return
    }


    const percentageNum = parseInt(percentage)
    if (percentageNum < 1 || percentageNum > 100) {
      console.error('Cannot submit: percentage must be between 1 and 100')
      return
    }

    const remaining = getRemainingAllocation(selectedStrategy.chain)
    if (percentageNum > remaining) {
      console.error(`Cannot submit: allocation would exceed 100% for ${selectedStrategy.chain} chain`)
      return
    }

    if (!vaultAddress) {
      console.error('Cannot submit: vault address not found for chain')
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
      console.error('Cannot update: percentage must be between 1 and 100')
      return
    }

    const subscription = subscriptions.find(sub => sub._id === taskId)
    if (!subscription) return

    const currentAllocation = getChainAllocation(subscription.chain)
    const newAllocation = currentAllocation - subscription.percentage + percentageNum
    
    if (newAllocation > 100) {
      console.error(`Cannot update: total allocation for ${subscription.chain} would exceed 100%`)
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
              <div key={sub._id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-3 lg:p-4">
                <div className="space-y-3">
                  {/* Strategy Header with Title and Icons */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0">
                      <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                        {sub.strategy?.tokens.map(token => (
                          <TokenIcon key={token} symbol={token} className="w-4 h-4 lg:w-5 lg:h-5" />
                        ))}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-white text-sm lg:text-base truncate">{sub.strategy?.name || sub.strategy_id}</div>
                        <div className="text-xs lg:text-sm text-gray-400">{sub.chain} • {sub.strategy?.frequency}</div>
                      </div>
                    </div>
                    
                    {/* Percentage Display (Mobile: below, Desktop: right) */}
                    <div className="hidden lg:flex items-center">
                      <span className="text-white font-medium text-base">{sub.percentage}%</span>
                    </div>
                  </div>
                  
                  {/* Execution Status */}
                  <div className="flex flex-wrap gap-x-2 lg:gap-x-4 gap-y-1 text-xs">
                    <div className="flex items-center space-x-1">
                      <span className="text-gray-500">Executions:</span>
                      <span className="text-gray-300">{sub.execution_count || 0}</span>
                    </div>
                    
                    {sub.last_executed && (
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">Last run:</span>
                        <span className="text-gray-300">
                          {formatDate(sub.last_executed)}
                        </span>
                      </div>
                    )}
                    
                    {sub.next_run_time && (
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">Next run:</span>
                        <span className="text-gray-300">
                          {formatFutureDate(sub.next_run_time)}
                        </span>
                      </div>
                    )}
                    
                    {sub.last_execution_status && (
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">Status:</span>
                        <span className={sub.last_execution_status === 'success' ? 'text-green-400' : 'text-red-400'}>
                          {sub.last_execution_status}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {sub.last_execution_memo && (
                    <div className="text-xs text-gray-400 italic bg-gray-700/30 rounded px-2 py-1 break-words">
                      "{sub.last_execution_memo}"
                    </div>
                  )}
                  
                  {/* Action Buttons Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-700/30">
                    {/* Mobile Percentage Display */}
                    <div className="lg:hidden">
                      <span className="text-white font-medium text-sm">{sub.percentage}%</span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-auto">
                      {editingSubscription === sub._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={editPercentage}
                            onChange={(e) => setEditPercentage(e.target.value)}
                            className="w-12 lg:w-16 px-1 lg:px-2 py-1 text-xs lg:text-sm bg-gray-700 border border-gray-600 rounded text-white"
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
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              setEditingSubscription(sub._id)
                              setEditPercentage(sub.percentage.toString())
                            }}
                            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition-colors"
                            title="Edit percentage"
                          >
                            <PencilIcon className="h-3 w-3 lg:h-4 lg:w-4" />
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
                            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                            title="Delete strategy"
                          >
                            <TrashIcon className="h-3 w-3 lg:h-4 lg:w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add New Strategy Form */}
      <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-6">
        <h3 className="text-base lg:text-lg font-semibold text-white">Add New Strategy</h3>
        
        {/* Strategy Selection */}
        <div>
          <label className="mb-3 block text-sm font-medium text-gray-300">Choose Strategy</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsStrategyDropdownOpen(!isStrategyDropdownOpen)}
              className="w-full rounded-xl border border-gray-600/60 bg-gray-800/80 px-3 lg:px-4 py-3 lg:py-4 text-left text-white transition-all duration-200 hover:border-gray-500/60 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
            >
              {selectedStrategy ? (
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 lg:space-x-3 mb-2">
                      <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                        {selectedStrategy.tokens.map((token: string) => (
                          <TokenIcon key={token} symbol={token} className="w-4 h-4 lg:w-5 lg:h-5" />
                        ))}
                      </div>
                      <div className="font-medium text-sm lg:text-base truncate">{selectedStrategy.name}</div>
                    </div>
                    <div className="text-xs lg:text-sm text-gray-400 mb-2 line-clamp-2">{selectedStrategy.description}</div>
                    <div className="flex items-center space-x-2 lg:space-x-3 text-xs">
                      <span className="text-gray-500 flex-shrink-0">{selectedStrategy.chain} • {selectedStrategy.frequency}</span>
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
                    className={`h-4 w-4 lg:h-5 lg:w-5 text-gray-400 transition-transform ml-1 lg:ml-2 flex-shrink-0 ${isStrategyDropdownOpen ? 'rotate-180' : ''}`}
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
                        className={`w-full rounded-md px-2 lg:px-3 py-2 lg:py-3 text-left transition-colors ${
                          isAlreadySubscribed 
                            ? 'opacity-50 cursor-not-allowed bg-gray-800/50' 
                            : 'hover:bg-gray-700/50'
                        } border-b border-gray-700/30 last:border-b-0`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 lg:space-x-3 mb-2">
                              <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
                                {strategy.tokens.map((token: string) => (
                                  <TokenIcon key={token} symbol={token} className="w-4 h-4 lg:w-5 lg:h-5" />
                                ))}
                              </div>
                              <div className="font-medium text-white text-sm lg:text-base min-w-0 flex-1">
                                <div className="truncate">{strategy.name}</div>
                                {isAlreadySubscribed && <span className="text-xs text-gray-500">(Already subscribed)</span>}
                              </div>
                            </div>
                            <div className="text-xs lg:text-sm text-gray-400 mb-2 line-clamp-2">{strategy.description}</div>
                            <div className="flex items-center space-x-2 lg:space-x-3 text-xs flex-wrap gap-y-1">
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
          <div className="rounded-xl border border-gray-700/50 bg-gray-800/40 p-3 lg:p-4">
            <h3 className="text-xs lg:text-sm font-medium text-gray-300 mb-3">Strategy Details</h3>
            <div className="space-y-2 text-xs lg:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Chain:</span>
                <span className="text-white">{selectedStrategy.chain}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400 flex-shrink-0">Tokens:</span>
                <span className="text-white flex items-center space-x-1 flex-wrap justify-end">
                  {selectedStrategy.tokens.map((token: string) => (
                    <div key={token} className="flex items-center space-x-1">
                      <TokenIcon symbol={token} className="w-3 h-3 lg:w-4 lg:h-4" />
                      <span>{token}</span>
                    </div>
                  ))}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-400 flex-shrink-0">Protocols:</span>
                <span className="text-white text-right break-words">{selectedStrategy.protocols.join(', ')}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Frequency:</span>
                <span className="text-white">{selectedStrategy.frequency}</span>
              </div>
              {selectedStrategy.current_yields && Object.keys(selectedStrategy.current_yields).length > 0 && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-400 flex-shrink-0">Current Yields:</span>
                  <span className="text-white text-right">
                    {Object.entries(selectedStrategy.current_yields).map(([token, apy], index) => (
                      <span key={token} className="block">
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
                className="w-full rounded-xl border border-gray-600/60 bg-gray-800/80 py-2 lg:py-3 px-3 lg:px-4 pr-8 lg:pr-12 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="absolute right-3 lg:right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm lg:text-base">%</span>
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