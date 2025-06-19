import React, { useState, useEffect } from 'react'
import { XMarkIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ethers } from 'ethers'
import { useVaultVerification } from '../hooks/useVaultVerification'
import { useTokenBalancesAndApprovals } from '../hooks/useTokenBalancesAndApprovals'
import { useVaultTokenBalances } from '../hooks/useVaultTokenBalances'
import { useVaultAddress } from '../hooks/useVaultAddress'
import { useEventEmitter } from '../hooks/useEvents'
import { getTokensForChain, ERC20_ABI, VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, SUPPORTED_CHAINS, Chain } from '../config/tokens'

interface VaultModalProps {
  isOpen: boolean
  onClose: () => void
}

// Configuration constants are now imported from tokens.ts

// Vault ABI - for interacting with deployed vaults
const VAULT_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'deposit',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'token', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' }
    ],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'getTokenBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const



// Removed hardcoded tokens - now using dynamic token system

const VaultModal: React.FC<VaultModalProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const currentChainId = useChainId()
  const { chains, switchChain, isPending: isSwitchingChain, error: switchChainError } = useSwitchChain()
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit')
  const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0])
  const [selectedTokenSymbol, setSelectedTokenSymbol] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false)

  // Use the new vault verification system - only when modal is open
  const {
    hasVault,
    isLoading: isVaultLoading,
    clearCache: clearVaultCache,
  } = useVaultVerification(isOpen)

  // Use the vault address hook for address calculation
  const { vaultAddress } = useVaultAddress(address, selectedChain.id)

  // Event emitter for portfolio updates
  const emit = useEventEmitter()

  // Get token balances and approvals for the predicted vault address (for deposits)
  // This checks: 1) User's token balances, 2) Approvals to spend tokens to the vault
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
  } = useVaultTokenBalances(hasVault ? vaultAddress : undefined)

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
      // If current selected token is not available on this chain, select first available
      setSelectedTokenSymbol(chainTokens[0].symbol)
    }
  }, [chainTokens, selectedTokenSymbol])

  // Find the currently selected token data with balance and approval info
  // Prefer availableTokens (has balance/approval data) but fall back to chainTokens (has decimals)
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

  // Handle successful vault deployment
  useEffect(() => {
    if (isDeploymentSuccess) {
      // Clear vault cache to trigger re-verification
      clearVaultCache()
      // Reset any form state if needed
      console.log('Vault deployed successfully! Hash:', deployVaultHash)
    }
  }, [isDeploymentSuccess, clearVaultCache, deployVaultHash])

  // Handle successful token approval
  useEffect(() => {
    if (isApprovalSuccess) {
      // Refetch token balances and approvals to update the UI
      refetchTokens()
      console.log('Token approval successful! Hash:', approvalHash)
    }
  }, [isApprovalSuccess, refetchTokens, approvalHash])

  // Handle successful deposit
  useEffect(() => {
    if (isDepositSuccess) {
      // Refetch token balances to show updated amounts
      refetchTokens()
      // Also refetch vault tokens to update vault balances
      refetchVaultTokens()
      // Emit portfolio update event
      emit('app.portfolio.refresh')
      // Reset form
      setAmount('')
      console.log('Deposit successful! Hash:', depositHash)
    }
  }, [isDepositSuccess, refetchTokens, refetchVaultTokens, emit, depositHash])

  // Handle successful withdrawal
  useEffect(() => {
    if (isWithdrawSuccess) {
      // Refetch token balances to show updated amounts
      refetchTokens()
      // Also refetch user tokens to update wallet balances
      refetchUserTokens()
      // Emit portfolio update event
      emit('app.portfolio.refresh')
      // Reset form
      setAmount('')
      console.log('Withdrawal successful! Hash:', withdrawHash)
    }
  }, [isWithdrawSuccess, refetchTokens, refetchUserTokens, emit, withdrawHash])

  // State for showing success message
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Show success message when deposit or withdrawal is successful
  useEffect(() => {
    if ((isDepositSuccess && depositHash) || (isWithdrawSuccess && withdrawHash)) {
      setShowSuccessMessage(true)
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 10000)
      return () => clearTimeout(timer)
    }
  }, [isDepositSuccess, depositHash, isWithdrawSuccess, withdrawHash])

  if (!isOpen) return null

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
    if (!hasVault && !isVaultLoading && action === 'deposit') {
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
        args: [vaultAddress as `0x${string}`, ethers.MaxUint256], // Approve max amount
      })
      return
    }

    // Handle deposit action
    if (action === 'deposit' && hasVault && selectedToken && amount && parseFloat(amount) > 0) {
      const tokenAddress = getSelectedTokenAddress()
      if (!tokenAddress) {
        alert('Token address not found for this chain.')
        return
      }
      
      // Convert amount using the correct decimals for the selected token
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
    if (action === 'withdraw' && hasVault && selectedToken && amount && parseFloat(amount) > 0) {
      const tokenAddress = getSelectedTokenAddress()
      if (!tokenAddress) {
        alert('Token address not found for this chain.')
        return
      }
      
      // Convert amount using the correct decimals for the selected token
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

    // Check if vault exists for other actions
    if (!hasVault && !isVaultLoading) {
      return
    }
  }

  const handleChainSwitch = () => {
    if (!switchChain) return
    switchChain({ chainId: selectedChain.id }, {
      onSuccess: () => {
        // Clear vault cache when switching chains to force re-verification
        clearVaultCache()
      },
      onError: (error) => {
        // You can add user-facing error handling here, e.g., a toast notification
        console.error("Failed to switch chains:", error)
      }
    })
  }

  const handleMaxClick = () => {
    if (selectedToken && 'balance' in selectedToken) {
      // Use actual balance from token data, removing any commas for input
      setAmount(selectedToken.balance.replace(/,/g, ''))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 my-auto w-full max-w-md rounded-xl border border-gray-700/50 bg-gray-900/95 p-6 shadow-2xl backdrop-blur-md">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Vault</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-700/50 hover:text-gray-200"
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
                disabled={!hasVault && !isVaultLoading}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  action === 'withdraw' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'
                } ${!hasVault && !isVaultLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    {hasVault ? 'Deployed' : 'Predicted address'}
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
                    <span className="text-lg">{selectedToken?.icon || '🪙'}</span>
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
                            <span className="text-lg">{token.icon}</span>
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

          {deploymentReceiptError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300 break-words">
                Transaction failed: {deploymentReceiptError.message.length > 100 
                  ? `${deploymentReceiptError.message.substring(0, 100)}...` 
                  : deploymentReceiptError.message}
              </div>
            </div>
          )}

          {approvalError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300 break-words">
                Error approving token: {approvalError.message.length > 100 
                  ? `${approvalError.message.substring(0, 100)}...` 
                  : approvalError.message}
              </div>
            </div>
          )}

          {approvalReceiptError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300 break-words">
                Approval transaction failed: {approvalReceiptError.message.length > 100 
                  ? `${approvalReceiptError.message.substring(0, 100)}...` 
                  : approvalReceiptError.message}
              </div>
            </div>
          )}

          {depositError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300 break-words">
                Error depositing token: {depositError.message.length > 100 
                  ? `${depositError.message.substring(0, 100)}...` 
                  : depositError.message}
              </div>
            </div>
          )}

          {depositReceiptError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300 break-words">
                Deposit transaction failed: {depositReceiptError.message.length > 100 
                  ? `${depositReceiptError.message.substring(0, 100)}...` 
                  : depositReceiptError.message}
              </div>
            </div>
          )}

          {withdrawError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300 break-words">
                Error withdrawing token: {withdrawError.message.length > 100 
                  ? `${withdrawError.message.substring(0, 100)}...` 
                  : withdrawError.message}
              </div>
            </div>
          )}

          {withdrawReceiptError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300 break-words">
                Withdrawal transaction failed: {withdrawReceiptError.message.length > 100 
                  ? `${withdrawReceiptError.message.substring(0, 100)}...` 
                  : withdrawReceiptError.message}
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
                ((!amount || parseFloat(amount) <= 0) && !(action === 'deposit' && !hasVault && !isVaultLoading) && !(action === 'deposit' && selectedToken && 'hasAllowance' in selectedToken && !selectedToken.hasAllowance)) ||
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
                ((amount && parseFloat(amount) > 0) || (action === 'deposit' && !hasVault && !isVaultLoading) || (action === 'deposit' && selectedToken && 'hasAllowance' in selectedToken && !selectedToken.hasAllowance)) && !isDeployPending && !isWaitingForDeployment && !isApprovePending && !isWaitingForApproval && !isDepositPending && !isWaitingForDeposit && !isWithdrawPending && !isWaitingForWithdraw
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
                    ? (!hasVault && !isVaultLoading 
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
    </div>
  )
}

export default VaultModal 