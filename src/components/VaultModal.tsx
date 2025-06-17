import React, { useState, useEffect } from 'react'
import { XMarkIcon, ChevronDownIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { useAccount, useChainId, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { ethers } from 'ethers'
import { useVaultVerification } from '../hooks/useVaultVerification'

interface Token {
  symbol: string
  name: string
  icon: string
  balance?: string
}

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

const TOP_TOKENS: Token[] = [
  { symbol: 'WBTC', name: 'Wrapped Bitcoin', icon: '₿', balance: '0.0245' },
  { symbol: 'USDC', name: 'USD Coin', icon: '$', balance: '1,234.56' },
  { symbol: 'WETH', name: 'Wrapped Ethereum', icon: 'Ξ', balance: '5.678' },
  { symbol: 'DAI', name: 'Dai Stablecoin', icon: '◈', balance: '789.12' },
  { symbol: 'USDT', name: 'Tether USD', icon: '₮', balance: '2,345.67' },
  { symbol: 'LINK', name: 'Chainlink', icon: '🔗', balance: '45.23' },
  { symbol: 'UNI', name: 'Uniswap', icon: '🦄', balance: '23.45' },
  { symbol: 'AAVE', name: 'Aave', icon: '👻', balance: '12.34' },
  { symbol: 'COMP', name: 'Compound', icon: '🏛️', balance: '8.91' },
  { symbol: 'MKR', name: 'Maker', icon: '🏗️', balance: '1.23' },
]

const VaultModal: React.FC<VaultModalProps> = ({ isOpen, onClose }) => {
  const { address } = useAccount()
  const currentChainId = useChainId()
  const { switchChain } = useSwitchChain()
  const [action, setAction] = useState<'deposit' | 'withdraw'>('deposit')
  const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0])
  const [selectedToken, setSelectedToken] = useState<Token>(TOP_TOKENS[0])
  const [amount, setAmount] = useState('')
  const [isChainDropdownOpen, setIsChainDropdownOpen] = useState(false)
  const [isTokenDropdownOpen, setIsTokenDropdownOpen] = useState(false)

  // Use the new vault verification system - only when modal is open
  const {
    hasVault,
    isLoading: isVaultLoading,
    clearCache: clearVaultCache,
  } = useVaultVerification(isOpen)

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

  // Use predicted address for display
  const vaultAddress = address ? predictVaultAddressOffline(address) : ''
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

    // Check if vault exists for other actions
    if (!hasVault && !isVaultLoading) {
      return
    }

    // TODO: Implement actual deposit/withdraw logic
    console.log('Action:', action, 'Chain:', selectedChain.name, 'Token:', selectedToken.symbol, 'Amount:', amount, 'Vault:', vaultAddress)
    onClose()
  }

  const handleChainSwitch = () => {
    switchChain({ chainId: selectedChain.id })
    // Clear vault cache when switching chains to force re-verification
    clearVaultCache()
  }

  const handleMaxClick = () => {
    if (action === 'withdraw' && selectedToken.balance) {
      setAmount(selectedToken.balance.replace(',', ''))
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
            <label className="mb-2 block text-sm font-medium text-gray-300">Token</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsTokenDropdownOpen(!isTokenDropdownOpen)}
                className="w-full rounded-lg border border-gray-600/60 bg-gray-800/80 px-4 py-3 text-left text-white transition-all duration-200 hover:border-gray-500/60 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{selectedToken.icon}</span>
                    <div>
                      <div className="font-medium">{selectedToken.symbol}</div>
                      <div className="text-xs text-gray-400">{selectedToken.name}</div>
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
                    {TOP_TOKENS.map((token) => (
                      <button
                        key={token.symbol}
                        type="button"
                        onClick={() => {
                          setSelectedToken(token)
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
                            <div className="text-sm text-gray-300">{token.balance}</div>
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
            <label className="mb-2 block text-sm font-medium text-gray-300">Amount</label>
            <div className="relative">
              <input
                type="number"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="w-full rounded-lg border border-gray-600/60 bg-gray-800/80 py-3 px-4 pr-16 text-white placeholder-gray-500 transition-all duration-200 focus:border-blue-500/60 focus:outline-none focus:ring-1 focus:ring-blue-500/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required={!(action === 'deposit' && !hasVault && !isVaultLoading)}
              />
              {action === 'withdraw' && (
                <button
                  type="button"
                  onClick={handleMaxClick}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-400 hover:text-blue-300"
                >
                  MAX
                </button>
              )}
            </div>
            {action === 'withdraw' && selectedToken.balance && (
              <div className="mt-1 text-xs text-gray-400">
                Available: {selectedToken.balance} {selectedToken.symbol}
              </div>
            )}
          </div>

          {/* Error Messages */}
          {deployVaultError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300">
                Error deploying vault: {deployVaultError.message}
              </div>
            </div>
          )}

          {deploymentReceiptError && (
            <div className="rounded-lg bg-red-900/50 border border-red-700/50 p-3">
              <div className="text-sm text-red-300">
                Transaction failed: {deploymentReceiptError.message}
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
                (!amount && !(action === 'deposit' && !hasVault && !isVaultLoading)) ||
                isDeployPending ||
                isWaitingForDeployment
              }
              className={`w-full rounded-lg px-4 py-3 font-medium transition-colors ${
                (amount || (action === 'deposit' && !hasVault && !isVaultLoading)) && !isDeployPending && !isWaitingForDeployment
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
              ) : (
                <>
                  {action === 'deposit' 
                    ? (!hasVault && !isVaultLoading ? 'Deploy Vault' : `Deposit ${selectedToken.symbol} on ${selectedChain.name}`)
                    : `Withdraw ${selectedToken.symbol} on ${selectedChain.name}`}
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