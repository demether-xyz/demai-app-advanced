import { useChainId, useReadContracts } from 'wagmi'
import { formatUnits } from 'ethers'
import { getTokensForChain } from '../config/tokens'
import { formatTokenBalance } from '../utils/formatBalance'

export interface VaultTokenBalance {
  symbol: string
  name: string
  icon: string
  decimals: number
  address: `0x${string}`
  balance: string
  balanceRaw: bigint
  isLoading: boolean
  error?: string
}

export interface UseVaultTokenBalancesReturn {
  tokens: VaultTokenBalance[]
  isLoading: boolean
  error?: string
  refetch: () => void
}

// Vault ABI - just the getTokenBalance function
const VAULT_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'token', type: 'address' }],
    name: 'getTokenBalance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

export const useVaultTokenBalances = (
  vaultAddress?: string
): UseVaultTokenBalancesReturn => {
  const chainId = useChainId()

  // Get tokens for current chain
  const tokensForChain = getTokensForChain(chainId)

  // Prepare contracts for parallel reading of vault token balances
  const contracts = vaultAddress 
    ? tokensForChain.flatMap(token => {
        const tokenAddress = token.addresses[chainId]
        if (!tokenAddress) return []

        return [{
          address: vaultAddress as `0x${string}`,
          abi: VAULT_ABI,
          functionName: 'getTokenBalance',
          args: [tokenAddress],
        } as const]
      })
    : []

  // Use wagmi's useReadContracts for parallel execution
  const {
    data: contractResults,
    isLoading,
    error,
    refetch: refetchContracts,
  } = useReadContracts({
    contracts,
    query: {
      enabled: !!vaultAddress && tokensForChain.length > 0,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  })

  // Process results and format tokens
  const tokens: VaultTokenBalance[] = tokensForChain.map((tokenConfig, index) => {
    const tokenAddress = tokenConfig.addresses[chainId]
    if (!tokenAddress) {
      return {
        symbol: tokenConfig.symbol,
        name: tokenConfig.name,
        icon: tokenConfig.icon,
        decimals: tokenConfig.decimals,
        address: '0x0' as `0x${string}`,
        balance: '0',
        balanceRaw: BigInt(0),
        isLoading: false,
        error: 'Token not available on this chain',
      }
    }

    const balanceResult = contractResults?.[index]
    const balanceRaw = balanceResult?.status === 'success' ? (balanceResult.result as bigint) : BigInt(0)
    const balance = formatUnits(balanceRaw, tokenConfig.decimals)

    let tokenError: string | undefined
    if (balanceResult?.status === 'failure') {
      tokenError = `Vault balance error: ${balanceResult.error?.message || 'Unknown error'}`
    }

    return {
      symbol: tokenConfig.symbol,
      name: tokenConfig.name,
      icon: tokenConfig.icon,
      decimals: tokenConfig.decimals,
      address: tokenAddress,
      balance: formatTokenBalance(balance),
      balanceRaw,
      isLoading: isLoading,
      error: tokenError,
    }
  })

  return {
    tokens,
    isLoading,
    error: error?.message,
    refetch: refetchContracts,
  }
} 