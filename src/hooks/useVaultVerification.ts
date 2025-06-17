import { useEffect, useCallback } from 'react'
import { useAccount, useChainId, useReadContract } from 'wagmi'
import { useAppStore } from '../store'

// Factory contract addresses by chain ID
const FACTORY_ADDRESSES: Record<number, `0x${string}`> = {
  42161: '0x99bD7B3FB6fD467e5D944008bD084b5d4c4331d4', // Arbitrum
  // Add other chains as they are deployed
}

// VaultFactory ABI - only the function we need
const VAULT_FACTORY_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserVault',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export interface UseVaultVerificationReturn {
  vaultAddress: string | null | undefined
  hasVault: boolean
  isLoading: boolean
  isError: boolean
  refetch: () => void
  clearCache: () => void
}

export function useVaultVerification(enabled: boolean = true): UseVaultVerificationReturn {
  const { address } = useAccount()
  const chainId = useChainId()
  
  const {
    getUserVault,
    setUserVault,
    getVaultQueryStatus,
    setVaultQueryStatus,
    shouldQueryVault,
    clearVaultCache,
  } = useAppStore()

  // Get factory address for current chain
  const factoryAddress = FACTORY_ADDRESSES[chainId]

  // Get cached vault address and query status
  const cachedVaultAddress = address ? getUserVault(chainId, address) : undefined
  const queryStatus = address ? getVaultQueryStatus(chainId, address) : 'idle'
  const shouldQuery = enabled && address ? shouldQueryVault(chainId, address) : false

  // Wagmi contract read
  const {
    data: contractVaultAddress,
    isError: contractIsError,
    isLoading: contractIsLoading,
    refetch: contractRefetch,
  } = useReadContract({
    address: factoryAddress,
    abi: VAULT_FACTORY_ABI,
    functionName: 'getUserVault',
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(enabled && address && factoryAddress && shouldQuery),
    },
  })

  // Update store when contract query completes
  useEffect(() => {
    if (!address || !factoryAddress) return

    if (contractIsLoading && queryStatus !== 'loading') {
      setVaultQueryStatus(chainId, address, 'loading')
    } else if (!contractIsLoading && contractVaultAddress !== undefined) {
      // Convert zero address to null for cleaner state management
      const vaultAddress = contractVaultAddress === '0x0000000000000000000000000000000000000000' 
        ? null 
        : contractVaultAddress
      
      setUserVault(chainId, address, vaultAddress)
      setVaultQueryStatus(chainId, address, 'success')
    } else if (contractIsError && queryStatus !== 'error') {
      setVaultQueryStatus(chainId, address, 'error')
    }
  }, [
    address,
    factoryAddress,
    chainId,
    contractVaultAddress,
    contractIsLoading,
    contractIsError,
    queryStatus,
    setUserVault,
    setVaultQueryStatus,
  ])

  // Auto-query when conditions change
  useEffect(() => {
    if (enabled && address && factoryAddress && shouldQuery && queryStatus === 'idle') {
      contractRefetch()
    }
  }, [enabled, address, factoryAddress, shouldQuery, queryStatus, contractRefetch])

  const refetch = useCallback(() => {
    if (address) {
      setVaultQueryStatus(chainId, address, 'idle')
      contractRefetch()
    }
  }, [address, chainId, setVaultQueryStatus, contractRefetch])

  const clearCache = useCallback(() => {
    if (address) {
      clearVaultCache(chainId, address)
    }
  }, [address, chainId, clearVaultCache])

  // Determine final state
  const vaultAddress = cachedVaultAddress
  const hasVault = Boolean(vaultAddress && vaultAddress !== '0x0000000000000000000000000000000000000000')
  const isLoading = queryStatus === 'loading' || (shouldQuery && contractIsLoading)
  const isError = queryStatus === 'error' || contractIsError

  return {
    vaultAddress,
    hasVault,
    isLoading,
    isError,
    refetch,
    clearCache,
  }
}

// Additional hook for manual queries (when you need to check for a specific user/chain)
export function useVaultVerificationQuery(userAddress?: `0x${string}`, targetChainId?: number) {
  const currentChainId = useChainId()
  const chainId = targetChainId || currentChainId
  const factoryAddress = FACTORY_ADDRESSES[chainId]

  const {
    data: vaultAddress,
    isError,
    isLoading,
    refetch,
  } = useReadContract({
    address: factoryAddress,
    abi: VAULT_FACTORY_ABI,
    functionName: 'getUserVault',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: Boolean(userAddress && factoryAddress),
    },
  })

  const hasVault = Boolean(
    vaultAddress && 
    vaultAddress !== '0x0000000000000000000000000000000000000000'
  )

  return {
    vaultAddress: vaultAddress || null,
    hasVault,
    isLoading,
    isError,
    refetch,
  }
}

// Export factory addresses and ABI for other components
export { FACTORY_ADDRESSES, VAULT_FACTORY_ABI } 