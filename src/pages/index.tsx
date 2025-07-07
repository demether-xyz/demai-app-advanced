/*
 * GENERIC CARD SURFACING SYSTEM WITH UNIQUE TIMESTAMPS
 * ===================================================
 *
 * This system allows ANY part of the app to surface ANY card by ID with unique timestamp tracking.
 *
 * How it works:
 * 1. Backend provides card data (any structure, any IDs)
 * 2. WireframeOverlay automatically detects all available card IDs
 * 3. Any component can surface a card using: surfaceCard(cardId)
 * 4. Each request gets a unique timestamp: cardId + timestamp
 * 5. Cards fly in with Minority Report-style animations
 * 6. System prevents duplicate processing using timestamp comparison
 *
 * Event Structure:
 * {
 *   cardId: "high-yield",
 *   timestamp: 1703123456789,
 *   count: 3
 * }
 *
 * Examples of usage:
 * - AI Chat: "Looking at your Aave position..." → surfaceCard('aave-position')
 * - Risk Alert: High risk detected → surfaceCard('risk-analysis')
 * - Notifications: Portfolio updated → surfaceCard('portfolio')
 * - User action: Click yield → surfaceCard('yield-opportunity-123')
 *
 * Benefits:
 * - Unique events prevent processing duplicates
 * - Timestamp tracking ensures proper sequencing
 * - Multiple rapid calls to same card work correctly
 * - Cross-component communication is reliable
 * - Backend integration is seamless
 */

import React, { useState, useEffect } from 'react'
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ethers } from 'ethers'
import { XMarkIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon, InformationCircleIcon } from '@heroicons/react/24/outline'
import DemaiAuthHandler from '@/components/DemaiAuthHandler'
import { useAuth } from '@/hooks/useAuth'
import DemaiNavbar from '@/components/DemaiNavbar'
import DemaiChatInterface from '@/components/DemaiChatInterface'
import Portfolio from '@/components/Portfolio'
import TokenIcon from '@/components/TokenIcon'
import { useEvent, useEventEmitter } from '@/hooks/useEvents'
import { usePortfolio } from '@/hooks/usePortfolio'
import { useVaultVerification } from '@/hooks/useVaultVerification'
import { useTokenBalancesAndApprovals } from '@/hooks/useTokenBalancesAndApprovals'
import { useVaultTokenBalances } from '@/hooks/useVaultTokenBalances'
import { useVaultAddress } from '@/hooks/useVaultAddress'
import { getTokensForChain, ERC20_ABI, VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, SUPPORTED_CHAINS, Chain } from '@/config/tokens'
import { useAppStore } from '@/store'

// Vault ABI for deposit/withdraw functions
const VAULT_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

type ViewType = 'portfolio' | 'vault' | 'strategy' | 'chat'

const DemaiPage = () => {
  const { isConnected, address } = useAccount()
  const { hasValidSignature } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [currentView, setCurrentView] = useState<ViewType>('portfolio')

  // Use the portfolio hook for fetching and store for reading
  const { refreshPortfolio } = usePortfolio(true)
  const portfolioData = useAppStore((state) => 
    address ? state.portfolio.cache[address.toLowerCase()] : undefined
  )

  // Listen for vault modal events - now switch to vault view instead
  const vaultOpenEvent = useEvent('vault.open')
  const strategyTriggerEvent = useEvent('strategy.trigger.open')
  const emit = useEventEmitter()
  
  // Handle vault open event - switch to vault view
  useEffect(() => {
    if (vaultOpenEvent > 0) {
      setCurrentView('vault')
    }
  }, [vaultOpenEvent])

  // Handle strategy trigger event - switch to strategy view
  useEffect(() => {
    if (strategyTriggerEvent > 0) {
      setCurrentView('strategy')
    }
  }, [strategyTriggerEvent])

  // Handle mounting state
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show main app when connected and authenticated
  const shouldShowMainApp = isConnected && hasValidSignature

  // Format currency values with smart decimal places based on value size
  const formatCurrency = (value: number) => {
    if (value === 0) return '$0.00'
    
    // Determine decimal places based on value size
    let decimals = 2
    if (value < 1) {
      decimals = 6  // Show 6 decimals for values less than $1
    } else if (value < 10) {
      decimals = 4  // Show 4 decimals for values less than $10
    } else if (value < 1000) {
      decimals = 3  // Show 3 decimals for values less than $1000
    }
    // Values >= $1000 keep 2 decimals (default)
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  // Inline Vault Component (copied from working VaultModal)
  const VaultComponent = () => {
    const currentChainId = useChainId()
    const { chains, switchChain, isPending: isSwitchingChain, error: switchChainError } = useSwitchChain()
    const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit')
    const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0])
    const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>('')
    const [amount, setAmount] = useState('')
    const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)
    const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false)

    // Use the new vault verification system
    const {
      hasVault: vaultHasVault,
      isLoading: isVaultLoading,
      clearCache: clearVaultCache,
    } = useVaultVerification(true)

    // Use the vault address hook for address calculation
    const { vaultAddress } = useVaultAddress(address, selectedChain.id)

    // Get token balances and approvals for the predicted vault address (for deposits)
    const {
      tokens: userTokens,
      isLoading: isUserTokensLoading,
      refetch: refetchUserTokens,
    } = useTokenBalancesAndApprovals(vaultAddress)

    // Get vault token balances (for withdrawals) - only when vault exists
    const {
      tokens: vaultTokens,
      isLoading: isVaultTokensLoading,
      refetch: refetchVaultTokens,
    } = useVaultTokenBalances(vaultHasVault ? vaultAddress : undefined)

    // Choose appropriate tokens based on action
    const availableTokens = action === 'withdraw' ? vaultTokens : userTokens
    const isTokensLoading = action === 'withdraw' ? isVaultTokensLoading : isUserTokensLoading
    const refetchTokens = action === 'withdraw' ? refetchVaultTokens : refetchUserTokens

    // Get available tokens for current chain
    const chainTokens = getTokensForChain(selectedChain.id)
    
    // Set default selected token when chain changes
    useEffect(() => {
      if (chainTokens.length > 0 && !selectedTokenSymbol) {
        setSelectedTokenSymbol(chainTokens[0].symbol)
      } else if (chainTokens.length > 0 && !chainTokens.find(t => t.symbol === selectedTokenSymbol)) {
        setSelectedTokenSymbol(chainTokens[0].symbol)
      }
    }, [chainTokens, selectedTokenSymbol])

    // Find the currently selected token data with balance and approval info
    const selectedToken = availableTokens.find(t => t.symbol === selectedTokenSymbol) || 
      chainTokens.find(t => t.symbol === selectedTokenSymbol) || null

    // Helper to get the token address regardless of token type
    const getSelectedTokenAddress = (): `0x${string}` | undefined => {
      if (!selectedToken) return undefined
      
      // If it's from availableTokens, it has 'address' field directly
      if ('address' in selectedToken) {
        return selectedToken.address
      }
      
      // If it's from chainTokens, it has 'addresses' field with chain mapping
      if ('addresses' in selectedToken) {
        return selectedToken.addresses[selectedChain.id]
      }
      
      return undefined
    }

    // Vault deployment functionality
    const { writeContract: deployVault, data: deployVaultHash, error: deployVaultError, isPending: isDeployPending } = useWriteContract()

    // Wait for deployment transaction
    const { 
      isLoading: isWaitingForDeployment, 
      isSuccess: isDeploymentSuccess, 
      error: deploymentReceiptError 
    } = useWaitForTransactionReceipt({
      hash: deployVaultHash,
    })

    // Token approval functionality
    const { writeContract: approveToken, data: approvalHash, error: approvalError, isPending: isApprovePending } = useWriteContract()

    // Wait for approval transaction
    const { 
      isLoading: isWaitingForApproval, 
      isSuccess: isApprovalSuccess, 
      error: approvalReceiptError 
    } = useWaitForTransactionReceipt({
      hash: approvalHash,
    })

    // Deposit functionality
    const { writeContract: depositToken, data: depositHash, error: depositError, isPending: isDepositPending } = useWriteContract()

    // Wait for deposit transaction
    const { 
      isLoading: isWaitingForDeposit, 
      isSuccess: isDepositSuccess, 
      error: depositReceiptError 
    } = useWaitForTransactionReceipt({
      hash: depositHash,
    })

    // Withdraw functionality
    const { writeContract: withdrawToken, data: withdrawHash, error: withdrawError, isPending: isWithdrawPending } = useWriteContract()

    // Wait for withdraw transaction
    const { 
      isLoading: isWaitingForWithdraw, 
      isSuccess: isWithdrawSuccess, 
      error: withdrawReceiptError 
    } = useWaitForTransactionReceipt({
      hash: withdrawHash,
    })

    const isOnCorrectChain = currentChainId === selectedChain.id

    // Auto-switch to a supported chain when component mounts
    useEffect(() => {
      if (currentChainId && !SUPPORTED_CHAINS.find(chain => chain.id === currentChainId)) {
        setSelectedChain(SUPPORTED_CHAINS[0])
      } else if (currentChainId) {
        const currentChain = SUPPORTED_CHAINS.find(chain => chain.id === currentChainId)
        if (currentChain) {
          setSelectedChain(currentChain)
        }
      }
    }, [currentChainId])

    // Handle successful vault deployment
    useEffect(() => {
      if (isDeploymentSuccess) {
        clearVaultCache()
      }
    }, [isDeploymentSuccess, clearVaultCache, deployVaultHash])

    // Handle successful token approval
    useEffect(() => {
      if (isApprovalSuccess) {
        refetchTokens()
      }
    }, [isApprovalSuccess, refetchTokens, approvalHash])

    // Handle successful deposit
    useEffect(() => {
      if (isDepositSuccess) {
        refetchTokens()
        refetchVaultTokens()
        emit('app.portfolio.refresh')
        setAmount('')
      }
    }, [isDepositSuccess, refetchTokens, refetchVaultTokens, emit, depositHash])

    // Handle successful withdrawal
    useEffect(() => {
      if (isWithdrawSuccess) {
        refetchTokens()
        refetchUserTokens()
        emit('app.portfolio.refresh')
        setAmount('')
      }
    }, [isWithdrawSuccess, refetchTokens, refetchUserTokens, emit, withdrawHash])

    // State for showing success message
    const [showSuccessMessage, setShowSuccessMessage] = useState(false)

    // Show success message when deposit or withdrawal is successful
    useEffect(() => {
      if ((isDepositSuccess && depositHash) || (isWithdrawSuccess && withdrawHash)) {
        setShowSuccessMessage(true)
        const timer = setTimeout(() => {
          setShowSuccessMessage(false)
        }, 10000)
        return () => clearTimeout(timer)
      }
    }, [isDepositSuccess, depositHash, isWithdrawSuccess, withdrawHash])

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      if (!isOnCorrectChain) {
        alert('Please switch to the correct chain first.')
        return
      }

      if (!address) {
        alert('Please connect your wallet first.')
        return
      }

      // Handle vault deployment if no vault exists
      if (!vaultHasVault && !isVaultLoading && action === 'deposit') {
        const factoryAddress = VAULT_FACTORY_ADDRESS
        if (!factoryAddress) {
          alert('Factory not available on this chain.')
          return
        }
        
        deployVault({
          address: factoryAddress,
          abi: VAULT_FACTORY_ABI,
          functionName: 'deployVault',
          args: [address as `0x${string}`],
        })
        return
      }

      // Handle token approval for deposits
      if (action === 'deposit' && selectedToken && 'hasAllowance' in selectedToken && !selectedToken.hasAllowance) {
        const tokenAddress = getSelectedTokenAddress()
        if (!tokenAddress) {
          alert('Token address not found for this chain.')
          return
        }
        
        approveToken({
          address: tokenAddress,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [vaultAddress as `0x${string}`, ethers.MaxUint256],
        })
        return
      }

      // Handle deposit action
      if (action === 'deposit' && vaultHasVault && selectedToken && amount && parseFloat(amount) > 0) {
        const tokenAddress = getSelectedTokenAddress()
        if (!tokenAddress) {
          alert('Token address not found for this chain.')
          return
        }
        
        const tokenDecimals = selectedToken.decimals || 18
        const amountInWei = ethers.parseUnits(amount, tokenDecimals)
        
        depositToken({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'deposit',
          args: [tokenAddress, amountInWei],
        })
        return
      }

      // Handle withdraw action
      if (action === 'withdraw' && vaultHasVault && selectedToken && amount && parseFloat(amount) > 0) {
        const tokenAddress = getSelectedTokenAddress()
        if (!tokenAddress) {
          alert('Token address not found for this chain.')
          return
        }
        
        const tokenDecimals = selectedToken.decimals || 18
        const amountInWei = ethers.parseUnits(amount, tokenDecimals)
        
        withdrawToken({
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'withdraw',
          args: [tokenAddress, amountInWei],
        })
        return
      }
    }

    const handleChainSwitch = () => {
      if (!switchChain) return
      switchChain({ chainId: selectedChain.id }, {
        onSuccess: () => {
          clearVaultCache()
        },
        onError: (error) => {
          console.error("Failed to switch chains:", error)
        }
      })
    }

    const handleMaxClick = () => {
      if (selectedToken && 'balance' in selectedToken) {
        setAmount(selectedToken.balance.replace(/,/g, ''))
      }
    }

    return (
      <div className="rounded-lg border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-6 h-full overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Vault</h2>
          <button
            onClick={() => setCurrentView('portfolio')}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-gray-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Action Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-300">Action</label>
            <div className="flex rounded-lg bg-gray-800/60 p-1">
              <button
                type="button"
                onClick={() => setAction('deposit')}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  action === 'deposit' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Deposit
              </button>
              <button
                type="button"
                onClick={() => setAction('withdraw')}
                disabled={!vaultHasVault && !isVaultLoading}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  action === 'withdraw' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                } ${!vaultHasVault && !isVaultLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Withdraw
              </button>
            </div>
          </div>

          {/* Vault Address Display */}
          {vaultAddress && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">Vault Address</label>
              <div className="rounded-lg border border-gray-600/60 bg-gray-800/80 px-4 py-3">
                <div className="font-mono text-sm text-gray-300 break-all">
                  {vaultAddress}
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-gray-400">
                    {vaultHasVault ? 'Deployed' : 'Predicted address'}
                  </div>
                  <a
                    href={`${selectedChain.explorerUrl}/address/${vaultAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center space-x-1 text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <span className="text-xs">View on Explorer</span>
                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

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
              <label className="text-sm font-medium text-gray-300">Token</label>
              {vaultAddress && (
                <button
                  type="button"
                  onClick={refetchTokens}
                  disabled={isTokensLoading}
                  className="text-xs text-blue-400 hover:text-blue-300 disabled:opacity-50"
                >
                  {isTokensLoading ? 'Loading...' : `Refresh ${action === 'deposit' ? 'wallet' : 'vault'} balances`}
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
                    {availableTokens.map((token) => (
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
                              {isTokensLoading ? '...' : token.balance}
                            </div>
                            {'hasAllowance' in token && (
                              <div className="text-xs text-gray-500">
                                {token.hasAllowance ? '✓ Approved' : '⚠ Not approved'}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
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
                  {action === 'deposit' ? 'Wallet' : 'Vault'} Balance: {selectedToken.balance} {selectedToken.symbol}
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
                {action === 'deposit' 
                  ? `Available to deposit: ${selectedToken.balance} ${selectedToken.symbol}`
                  : `Available to withdraw: ${selectedToken.balance} ${selectedToken.symbol} (from vault)`
                }
              </div>
            )}
          </div>

          {/* Error Messages */}
          {switchChainError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300 break-words">
                Error switching chain: {switchChainError.message.length > 100 
                  ? `${switchChainError.message.substring(0, 100)}...` 
                  : switchChainError.message}
              </div>
            </div>
          )}

          {deployVaultError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300 break-words">
                Error deploying vault: {deployVaultError.message.length > 100 
                  ? `${deployVaultError.message.substring(0, 100)}...` 
                  : deployVaultError.message}
              </div>
            </div>
          )}

          {/* Success Message */}
          {showSuccessMessage && (depositHash || withdrawHash) && (
            <div className="rounded-lg bg-green-900/50 border border-green-700/50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-green-400">✓</span>
                    <div className="text-sm font-medium text-green-300">
                      {depositHash ? 'Deposit' : 'Withdrawal'} Successful!
                    </div>
                  </div>
                  <div className="text-xs text-green-200 mb-3">
                    Your {selectedToken?.symbol} has been {depositHash ? 'deposited to' : 'withdrawn from'} your vault.
                  </div>
                  <a
                    href={`${selectedChain.explorerUrl}/tx/${depositHash || withdrawHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-green-400 hover:text-green-300 transition-colors"
                  >
                    <span className="text-xs">View Transaction</span>
                    <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                  </a>
                </div>
                <button
                  onClick={() => setShowSuccessMessage(false)}
                  className="ml-2 text-green-400 hover:text-green-300 transition-colors"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          {!isOnCorrectChain ? (
            <button
              type="button"
              onClick={handleChainSwitch}
              disabled={isSwitchingChain}
              className="w-full rounded-lg bg-orange-600 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-800"
            >
              {isSwitchingChain ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Switching...</span>
                </div>
              ) : (
                `Switch to ${selectedChain.name}`
              )}
            </button>
          ) : (
            <button
              type="submit"
              disabled={
                ((!amount || parseFloat(amount) <= 0) && !(action === 'deposit' && !vaultHasVault && !isVaultLoading) && !(action === 'deposit' && selectedToken && 'hasAllowance' in selectedToken && !selectedToken.hasAllowance)) ||
                isDeployPending ||
                isWaitingForDeployment ||
                isApprovePending ||
                isWaitingForApproval ||
                isDepositPending ||
                isWaitingForDeposit ||
                isWithdrawPending ||
                isWaitingForWithdraw
              }
              className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
                ((amount && parseFloat(amount) > 0) || (action === 'deposit' && !vaultHasVault && !isVaultLoading) || (action === 'deposit' && selectedToken && 'hasAllowance' in selectedToken && !selectedToken.hasAllowance)) && !isDeployPending && !isWaitingForDeployment && !isApprovePending && !isWaitingForApproval && !isDepositPending && !isWaitingForDeposit && !isWithdrawPending && !isWaitingForWithdraw
                  ? action === 'deposit'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                  : 'cursor-not-allowed bg-gray-700 text-gray-400'
              }`}
            >
              {isDeployPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Initiating deployment...</span>
                </div>
              ) : isWaitingForDeployment ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Deploying vault...</span>
                </div>
              ) : isApprovePending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Initiating approval...</span>
                </div>
              ) : isWaitingForApproval ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Approving {selectedToken?.symbol}...</span>
                </div>
              ) : isDepositPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Initiating deposit...</span>
                </div>
              ) : isWaitingForDeposit ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Depositing {selectedToken?.symbol}...</span>
                </div>
              ) : isWithdrawPending ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Initiating withdrawal...</span>
                </div>
              ) : isWaitingForWithdraw ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>Withdrawing {selectedToken?.symbol}...</span>
                </div>
              ) : (
                <>
                  {action === 'deposit' 
                    ? (!vaultHasVault && !isVaultLoading 
                        ? 'Deploy Vault' 
                        : (selectedToken && 'hasAllowance' in selectedToken && !selectedToken.hasAllowance
                            ? `Approve ${selectedToken.symbol} for Vault`
                            : `Deposit ${selectedToken?.symbol || 'Token'} on ${selectedChain.name}`))
                    : `Withdraw ${selectedToken?.symbol || 'Token'} on ${selectedChain.name}`}
                </>
              )}
            </button>
          )}
        </form>
      </div>
    )
  }

  // Inline Strategy Component (extracted from StrategyTrigger)
  const StrategyComponent = () => {
    // Define available strategies (from StrategyTrigger)
    const availableStrategies = [
      {
        id: 'aave-usdc-arbitrum',
        name: 'Aave USDC Lending',
        description: 'Automated USDC lending on Aave with optimal yield farming',
        detailedDescription: 'This strategy automatically lends your USDC on Aave V3 to earn lending rewards. The strategy monitors rates and automatically compounds rewards for maximum yield.',
        chain: SUPPORTED_CHAINS.find(c => c.id === 42161)!,
        primaryToken: 'USDC',
        secondaryTokens: ['AAVE'],
        apy: 18.5,
        riskLevel: 'low' as const,
        updateFrequency: 'Daily',
        protocol: 'Aave V3',
        thresholdInfo: 'Minimum 10 USDC required'
      },
      {
        id: 'uniswap-eth-usdc-arbitrum',
        name: 'Uniswap V3 ETH/USDC LP',
        description: 'Concentrated liquidity provision with automated rebalancing',
        detailedDescription: 'Provides liquidity to the ETH/USDC pool on Uniswap V3 with concentrated positions. Automatically rebalances when price moves outside the range.',
        chain: SUPPORTED_CHAINS.find(c => c.id === 42161)!,
        primaryToken: 'ETH',
        secondaryTokens: ['USDC'],
        apy: 24.2,
        riskLevel: 'medium' as const,
        updateFrequency: 'Every 6 hours',
        protocol: 'Uniswap V3',
        thresholdInfo: 'Minimum 0.1 ETH required'
      }
    ]

    const [selectedStrategy, setSelectedStrategy] = useState(availableStrategies[0])
    const [amount, setAmount] = useState('')
    const [isStrategyDropdownOpen, setIsStrategyDropdownOpen] = useState(false)
    const [showStrategyDetails, setShowStrategyDetails] = useState(false)

    // Use vault verification
    const {
      hasVault: strategyHasVault,
      isLoading: isVaultLoading,
    } = useVaultVerification(true)

    // Use vault address hook
    const { vaultAddress } = useVaultAddress(address, selectedStrategy.chain.id)

    // Get vault token balances
    const {
      tokens: vaultTokens,
      isLoading: isVaultTokensLoading,
      refetch: refetchVaultTokens,
    } = useVaultTokenBalances(strategyHasVault ? vaultAddress : undefined)

    // Find the primary token for the selected strategy
    const primaryToken = vaultTokens.find(t => t.symbol === selectedStrategy.primaryToken) || 
      getTokensForChain(selectedStrategy.chain.id).find(t => t.symbol === selectedStrategy.primaryToken)

    const handleMaxClick = () => {
      if (primaryToken && 'balance' in primaryToken) {
        setAmount(primaryToken.balance.replace(/,/g, ''))
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

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()

      if (!address) {
        alert('Please connect your wallet first.')
        return
      }

      if (!strategyHasVault && !isVaultLoading) {
        alert('Please deploy a vault first.')
        return
      }

      // Execute strategy
      emit('app.portfolio.refresh')
      setAmount('')
    }

    return (
      <div className="rounded-lg border border-slate-700/40 bg-slate-900/60 backdrop-blur-md p-6 h-full overflow-y-auto">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Strategy Execution</h2>
          <button
            onClick={() => setCurrentView('portfolio')}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-gray-200"
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
            </div>
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
                className="w-full rounded-lg border border-gray-600/60 bg-gray-800/80 py-3 px-4 pr-16 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
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
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              !amount || 
              parseFloat(amount) <= 0 || 
              !strategyHasVault || 
              isVaultLoading ||
              !primaryToken
            }
            className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
              amount && parseFloat(amount) > 0 && strategyHasVault && !isVaultLoading && primaryToken
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-gray-700 text-gray-400'
            }`}
          >
            {!strategyHasVault && !isVaultLoading
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
    )
  }

  // Don't render anything until mounted
  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Auth handler shows itself when wallet is connected but not authenticated */}
      <DemaiAuthHandler
        onSignatureUpdate={() => {
          // Auth state is now managed by useAuth hook
        }}
      />
      
      {/* Main app content - always render navbar so RainbowKit connect button works */}
      <div className="relative flex h-screen w-full flex-col overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/background.jpg)',
          }}
        />

        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Navbar - Fixed at top - ALWAYS visible so RainbowKit works */}
        <div className="relative z-10">
          <DemaiNavbar />
        </div>

        {/* Main Content Area - Only show when authenticated */}
        {shouldShowMainApp && (
          <div className="relative z-10 flex-1 overflow-hidden">
            <div className="flex h-full">
              {/* Left Panel - Portfolio Summary + Chat Interface */}
              <div className="flex-shrink-0 w-80 flex flex-col overflow-hidden">
                {/* Portfolio Summary Section */}
                <div className="p-8 pb-4">
                  <h1 className="mb-6 text-4xl font-bold text-white">demAI</h1>

                  {/* Portfolio Value */}
                  <div className="mb-6">
                    <div className="mb-2 text-5xl font-bold text-white">
                      {portfolioData && !portfolioData.isLoading && portfolioData.total_value_usd > 0
                        ? formatCurrency(portfolioData.total_value_usd)
                        : portfolioData?.isLoading
                          ? 'Loading...'
                          : '$0.00'}
                    </div>
                    
                    <div className="mb-1 text-lg font-medium text-white/70 flex items-center">
                      <span>
                        {portfolioData?.isLoading
                          ? 'Fetching portfolio data...'
                          : portfolioData?.error
                            ? 'Unable to load portfolio'
                            : portfolioData?.total_value_usd === 0
                              ? 'No funds in portfolio yet'
                              : `Across ${Object.keys(portfolioData?.chains || {}).length} chains`}
                      </span>
                      {!portfolioData?.isLoading && !portfolioData?.error && (
                        <button
                          onClick={refreshPortfolio}
                          className="ml-2 rounded p-1 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors"
                          title="Refresh portfolio data"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="flex items-center text-sm font-medium text-green-400">
                      <svg className="mr-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                      {portfolioData?.isLoading
                        ? 'Loading...'
                        : portfolioData?.error
                          ? 'Data unavailable'
                          : portfolioData?.total_value_usd === 0
                            ? 'Deploy a vault to start'
                            : Object.keys(portfolioData?.strategies || {}).length > 0
                              ? `${portfolioData.summary?.total_tokens || 0} tokens, ${Object.keys(portfolioData.strategies || {}).length} strategies (${formatCurrency(Object.values(portfolioData.strategies || {}).reduce((sum, s) => sum + (s.total_value_usd || 0), 0))})`
                              : `${portfolioData.summary?.total_tokens || 0} tokens`}
                    </div>
                  </div>

                  {/* View Navigation Buttons */}
                  <div className="flex flex-col space-y-3">
                    <div 
                      onClick={() => setCurrentView('portfolio')}
                      className={`flex h-12 cursor-pointer items-center justify-center rounded-xl p-3 transition-colors ${
                        currentView === 'portfolio' ? 'bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      <svg className="mr-2 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                      <span className="text-sm font-medium text-white">Portfolio</span>
                    </div>

                    <div 
                      onClick={() => setCurrentView('vault')}
                      className={`flex h-12 cursor-pointer items-center justify-center rounded-xl p-3 transition-colors ${
                        currentView === 'vault' ? 'bg-green-700' : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      <svg className="mr-2 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className="text-sm font-medium text-white">Vault</span>
                    </div>

                    <div 
                      onClick={() => setCurrentView('strategy')}
                      className={`flex h-12 cursor-pointer items-center justify-center rounded-xl p-3 transition-colors ${
                        currentView === 'strategy' ? 'bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      <svg className="mr-2 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span className="text-sm font-medium text-white">Strategy</span>
                    </div>

                    <div 
                      onClick={() => setCurrentView('chat')}
                      className={`flex h-12 cursor-pointer items-center justify-center rounded-xl p-3 transition-colors ${
                        currentView === 'chat' ? 'bg-orange-700' : 'bg-orange-600 hover:bg-orange-700'
                      }`}
                    >
                      <svg className="mr-2 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="text-sm font-medium text-white">Chat Assistant</span>
                    </div>
                  </div>
                </div>


              </div>

              {/* Right Panel - Dynamic Content Based on Current View */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full p-8">
                  {currentView === 'portfolio' && (
                    <Portfolio
                      expanded={true}
                      className="h-full"
                    />
                  )}
                  {currentView === 'vault' && <VaultComponent />}
                  {currentView === 'strategy' && <StrategyComponent />}
                  {currentView === 'chat' && <DemaiChatInterface mode="embedded" />}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default DemaiPage

