import { useEffect, useCallback, useRef } from 'react'
import { useAccount, useChainId, useReadContract } from 'wagmi'
import { useAppStore } from '../store'
import { VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI } from '../config/tokens'

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
  
  // Use stable selectors to avoid re-renders
  const getUserVault = useAppStore((state) => state.getUserVault)
  const setUserVault = useAppStore((state) => state.setUserVault)
  const getVaultQueryStatus = useAppStore((state) => state.getVaultQueryStatus)
  const setVaultQueryStatus = useAppStore((state) => state.setVaultQueryStatus)
  const shouldQueryVault = useAppStore((state) => state.shouldQueryVault)
  const clearVaultCache = useAppStore((state) => state.clearVaultCache)
  
  // Track processed states to avoid infinite loops
  const processedStateRef = useRef<string>('')
  
  // Reset processed state when key parameters change
  useEffect(() => {
    processedStateRef.current = ''
  }, [address, chainId, enabled])

  // Get factory address for current chain
  const factoryAddress = VAULT_FACTORY_ADDRESS

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

    // Create a state key to track what we've processed
    const stateKey = `${chainId}-${address}-${contractIsLoading}-${contractVaultAddress}-${contractIsError}-${queryStatus}`
    
    // Skip if we've already processed this state
    if (processedStateRef.current === stateKey) return
    
    if (contractIsLoading && queryStatus !== 'loading') {
      setVaultQueryStatus(chainId, address, 'loading')
      processedStateRef.current = stateKey
    } else if (!contractIsLoading && contractVaultAddress !== undefined) {
      // Convert zero address to null for cleaner state management
      const vaultAddress = contractVaultAddress === '0x0000000000000000000000000000000000000000' 
        ? null 
        : contractVaultAddress
      
      setUserVault(chainId, address, vaultAddress)
      setVaultQueryStatus(chainId, address, 'success')
      processedStateRef.current = stateKey
    } else if (contractIsError && queryStatus !== 'error') {
      setVaultQueryStatus(chainId, address, 'error')
      processedStateRef.current = stateKey
    }
  }, [
    address,
    factoryAddress,
    chainId,
    contractVaultAddress,
    contractIsLoading,
    contractIsError,
    queryStatus,
    // Removed setUserVault and setVaultQueryStatus from dependencies to prevent infinite loops
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
  }, [address, chainId, contractRefetch])

  const clearCache = useCallback(() => {
    if (address) {
      clearVaultCache(chainId, address)
    }
  }, [address, chainId])

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
  const factoryAddress = VAULT_FACTORY_ADDRESS

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

// Export factory ABI for other components that might need it
export { VAULT_FACTORY_ABI } 