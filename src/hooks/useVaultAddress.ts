import { useMemo } from 'react'
import { useReadContract } from 'wagmi'
import { VAULT_FACTORY_ADDRESS, VAULT_FACTORY_ABI, isFactoryDeployed } from '../config/tokens'

/**
 * Hook to get vault addresses using the factory's deterministic predictVaultAddress function
 * This replaces manual CREATE2 calculation and ensures perfect compatibility with the contract
 */
const useVaultAddress = (vaultOwner: string | undefined, chainId: number) => {
  const factoryDeployed = isFactoryDeployed(chainId)
  const factoryAddress = VAULT_FACTORY_ADDRESS

  // First, check if the user already has a deployed vault
  const { data: existingVault, isLoading: isLoadingExisting } = useReadContract({
    address: factoryAddress,
    abi: VAULT_FACTORY_ABI,
    functionName: 'getUserVault',
    args: vaultOwner ? [vaultOwner as `0x${string}`] : undefined,
    chainId,
    query: {
      enabled: !!(vaultOwner && factoryAddress && factoryDeployed),
      staleTime: 30_000, // Cache for 30 seconds
    },
  })

  const hasDeployedVault = useMemo(() => existingVault && existingVault !== '0x0000000000000000000000000000000000000000', [existingVault])

  // Only predict the address if a vault is NOT already deployed
  const {
    data: predictedAddress,
    isError,
    isLoading: isLoadingPredicted,
  } = useReadContract({
    address: factoryAddress,
    abi: VAULT_FACTORY_ABI,
    functionName: 'predictVaultAddress',
    args: vaultOwner ? [vaultOwner as `0x${string}`] : undefined,
    chainId,
    query: {
      enabled: !!(vaultOwner && factoryAddress && factoryDeployed && !hasDeployedVault),
      staleTime: Infinity, // Predicted addresses are deterministic and never change
    },
  })

  const vaultInfo = useMemo(() => {
    if (!vaultOwner || !factoryAddress || !factoryDeployed) {
      return {
        vaultAddress: '',
        predictedAddress: '',
        existingVault: '',
        hasVault: false,
        isDeployed: false,
        isLoading: false,
        isError: true,
        errorMessage: !factoryDeployed ? `Factory not deployed on chain ${chainId}` : 'Invalid parameters',
      }
    }

    const isLoading = isLoadingExisting || isLoadingPredicted

    if (isLoading) {
      return {
        vaultAddress: '',
        predictedAddress: '',
        existingVault: '',
        hasVault: false,
        isDeployed: false,
        isLoading: true,
        isError: false,
        errorMessage: '',
      }
    }

    if (isError && !hasDeployedVault) {
      return {
        vaultAddress: '',
        predictedAddress: '',
        existingVault: '',
        hasVault: false,
        isDeployed: false,
        isLoading: false,
        isError: true,
        errorMessage: 'Failed to predict vault address',
      }
    }
    
    const finalPredictedAddress = (predictedAddress || '') as string;
    const finalExistingVault = (existingVault || '') as string;
    const vaultAddress = hasDeployedVault ? finalExistingVault : finalPredictedAddress

    return {
      vaultAddress,
      predictedAddress: finalPredictedAddress,
      existingVault: finalExistingVault,
      hasVault: hasDeployedVault,
      isDeployed: hasDeployedVault,
      isLoading: false,
      isError: false,
      errorMessage: '',
    }
  }, [
    vaultOwner,
    chainId,
    factoryAddress,
    factoryDeployed,
    predictedAddress,
    existingVault,
    isLoadingExisting,
    isLoadingPredicted,
    isError,
    hasDeployedVault
  ])

  return {
    // Main interface
    ...vaultInfo,

    // Backward compatibility
    address: vaultInfo.vaultAddress,

    // Additional useful info
    factoryAddress,
    factoryDeployed,

    // Cross-chain consistency info
    isDeterministic: true,
    isUniversal: factoryDeployed, // Will be same address on all deployed chains
  }
}

export { useVaultAddress }

/**
 * Hook to check if a user has a vault deployed (simplified version)
 */
export const useHasVault = (userAddress: string | undefined, chainId: number) => {
  const factoryAddress = VAULT_FACTORY_ADDRESS
  const factoryDeployed = isFactoryDeployed(chainId)

  const { data: hasVault, isLoading } = useReadContract({
    address: factoryAddress,
    abi: VAULT_FACTORY_ABI,
    functionName: 'hasVault',
    args: userAddress ? [userAddress as `0x${string}`] : undefined,
    chainId,
    query: {
      enabled: !!(userAddress && factoryAddress && factoryDeployed),
      staleTime: 30_000,
    },
  })

  return {
    hasVault: !!hasVault,
    isLoading,
    factoryDeployed,
  }
}

/**
 * Hook to get vault address across multiple chains (for cross-chain display)
 */
export const useVaultAddressMultichain = (vaultOwner: string | undefined) => {
  const arbitrumVault = useVaultAddress(vaultOwner, 42161)
  const coreVault = useVaultAddress(vaultOwner, 1116)

  return useMemo(() => {
    const vaults = [
      { chainId: 42161, chainName: 'Arbitrum', ...arbitrumVault },
      { chainId: 1116, chainName: 'Core', ...coreVault },
    ].filter(vault => vault.factoryDeployed)

    // Check if addresses are consistent across chains (they should be!)
    const addresses = vaults.map(v => v.predictedAddress).filter(Boolean)
    const isConsistent = addresses.length > 1 ? addresses.every(addr => addr === addresses[0]) : true

    return {
      vaults,
      isConsistent,
      universalAddress: addresses[0] || '',
      deployedChains: vaults.filter(v => v.isDeployed).map(v => ({ chainId: v.chainId, chainName: v.chainName })),
    }
  }, [arbitrumVault, coreVault])
} 