import React, { useState, useEffect } from 'react'
import { XMarkIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ethers } from 'ethers'
import { useVaultVerification } from '../hooks/useVaultVerification'
import { useTokenBalancesAndApprovals } from '../hooks/useTokenBalancesAndApprovals'
import { useVaultTokenBalances } from '../hooks/useVaultTokenBalances'
import { getTokensForChain, ERC20_ABI } from '../config/tokens'



interface Chain {
  id: number
  name: string
  icon: string
  nativeCurrency: string
  explorerUrl: string
}

interface VaultModalProps {
  isOpen: boolean
  onClose: () => void
}

const SUPPORTED_CHAINS: Chain[] = [
  // { id: 1, name: 'Ethereum', icon: 'Ξ', nativeCurrency: 'ETH', explorerUrl: 'https://etherscan.io' },
  { id: 42161, name: 'Arbitrum', icon: '🔵', nativeCurrency: 'ETH', explorerUrl: 'https://arbiscan.io' },
]

// Configuration from your contract deployment
const VAULT_FACTORY_ADDRESS = '0x99bD7B3FB6fD467e5D944008bD084b5d4c4331d4'
const BEACON_ADDRESS = '0x329177804cab5440e1D4A2607Ea94a3fe3b303cb'
const BEACON_PROXY_CREATION_CODE = '0x60a08060405261047a80380380916100178285610292565b833981016040828203126101eb5761002e826102c9565b602083015190926001600160401b0382116101eb57019080601f830112156101eb57815161005b816102dd565b926100696040519485610292565b8184526020840192602083830101116101eb57815f926020809301855e84010152823b15610274577fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d5080546001600160a01b0319166001600160a01b038516908117909155604051635c60da1b60e01b8152909190602081600481865afa9081156101f7575f9161023a575b50803b1561021a5750817f1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e5f80a282511561020257602060049260405193848092635c60da1b60e01b82525afa9182156101f7575f926101ae575b505f809161018a945190845af43d156101a6573d9161016e836102dd565b9261017c6040519485610292565b83523d5f602085013e6102f8565b505b608052604051610123908161035782396080518160180152f35b6060916102f8565b9291506020833d6020116101ef575b816101ca60209383610292565b810103126101eb575f80916101e161018a956102c9565b9394509150610150565b5f80fd5b3d91506101bd565b6040513d5f823e3d90fd5b505050341561018c5763b398979f60e01b5f5260045ffd5b634c9c8ce360e01b5f9081526001600160a01b0391909116600452602490fd5b90506020813d60201161026c575b8161025560209383610292565b810103126101eb57610266906102c9565b5f6100f5565b3d9150610248565b631933b43b60e21b5f9081526001600160a01b038416600452602490fd5b601f909101601f19168101906001600160401b038211908210176102b557604052565b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b03821682036101eb57565b6001600160401b0381116102b557601f01601f191660200190565b9061031c575080511561030d57805190602001fd5b63d6bda27560e01b5f5260045ffd5b8151158061034d575b61032d575090565b639996b31560e01b5f9081526001600160a01b0391909116600452602490fd5b50803b1561032556fe60806040819052635c60da1b60e01b81526020906004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa801560a2575f901560d1575060203d602011609c575b6080601f8201601f1916810191906001600160401b0383119083101760885760849160405260800160ad565b60d1565b634e487b7160e01b5f52604160045260245ffd5b503d6058565b6040513d5f823e3d90fd5b602090607f19011260cd576080516001600160a01b038116810360cd5790565b5f80fd5b5f8091368280378136915af43d5f803e1560e9573d5ff35b3d5ffdfea264697066735822122071a3b448b47de4dbffbebc1a06ad7dd9c7033c5ea7b32ab1802a80647e227fcf64736f6c634300081d0033'

// VaultFactory ABI - only the functions we need
const VAULT_FACTORY_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'vaultOwner', type: 'address' }],
    name: 'deployVault',
    outputs: [{ internalType: 'address', name: 'vaultAddress', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserVault',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

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

/**
 * Predicts the address of a vault using CREATE2 logic completely off-chain.
 * This matches your exact contract implementation.
 */
const predictVaultAddressOffline = (vaultOwner: string): string => {
  try {
    // Use the same salt logic as the contract: bytes32(uint256(uint160(vaultOwner)))
    const salt = ethers.zeroPadValue(vaultOwner, 32)

    // 1. Prepare the initialization data for the Vault's `initialize` function
    const vaultInterface = new ethers.Interface([
      "function initialize(address factoryAdmin, address vaultOwner)"
    ])
    const initData = vaultInterface.encodeFunctionData("initialize", [
      VAULT_FACTORY_ADDRESS,
      vaultOwner
    ])

    // 2. Encode the constructor arguments for the BeaconProxy
    const constructorArgs = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'bytes'],
      [BEACON_ADDRESS, initData]
    )

    // 3. Construct the full bytecode for deployment
    // Convert the hex string to Uint8Array first
    const creationCodeBytes = new Uint8Array(
      BEACON_PROXY_CREATION_CODE.slice(2).match(/.{2}/g)!.map(byte => parseInt(byte, 16))
    )
    const fullBytecode = ethers.concat([creationCodeBytes, constructorArgs])

    // 4. Compute the CREATE2 address
    const predictedAddress = ethers.getCreate2Address(
      VAULT_FACTORY_ADDRESS,
      salt,
      ethers.keccak256(fullBytecode)
    )

    return predictedAddress
  } catch (error) {
    console.error('Error calculating vault address:', error)
    return ''
  }
}

// Removed hardcoded tokens - now using dynamic token system

const VaultModal: React.FC<VaultModalProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()
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

  // Use predicted address for display and approvals
  // This is the address where the user's vault WILL BE deployed (deterministic)
  // We check approvals against THIS address, not the factory
  const vaultAddress = address ? predictVaultAddressOffline(address) : ''

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
      // Reset form
      setAmount('')
      console.log('Deposit successful! Hash:', depositHash)
    }
  }, [isDepositSuccess, refetchTokens, refetchVaultTokens, depositHash])

  // Handle successful withdrawal
  useEffect(() => {
    if (isWithdrawSuccess) {
      // Refetch token balances to show updated amounts
      refetchTokens()
      // Also refetch user tokens to update wallet balances
      refetchUserTokens()
      // Reset form
      setAmount('')
      console.log('Withdrawal successful! Hash:', withdrawHash)
    }
  }, [isWithdrawSuccess, refetchTokens, refetchUserTokens, withdrawHash])

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
      deployVault({
        address: VAULT_FACTORY_ADDRESS as `0x${string}`,
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
    switchChain({ chainId: selectedChain.id })
    // Clear vault cache when switching chains to force re-verification
    clearVaultCache()
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
              className="w-full rounded-lg bg-orange-600 px-4 py-3 font-medium text-white transition-colors hover:bg-orange-700"
            >
              Switch to {selectedChain.name}
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