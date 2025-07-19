import { } from 'react'
import { useAccount, useChainId, useReadContracts } from 'wagmi'
import { formatUnits } from 'ethers'
import { getTokensForChain, ERC20_ABI } from '../config/tokens'
import { formatTokenBalance } from '../utils/formatBalance'

export interface TokenBalanceAndApproval {
  symbol: string
  name: string
  icon: string
  decimals: number
  address: `0x${string}`
  balance: string
  balanceRaw: bigint
  allowance: string
  allowanceRaw: bigint
  hasAllowance: boolean
  isLoading: boolean
  error?: string
}

export interface UseTokenBalancesAndApprovalsReturn {
  tokens: TokenBalanceAndApproval[]
  isLoading: boolean
  error?: string
  refetch: () => void
}

export const useTokenBalancesAndApprovals = (
  spenderAddress?: string
): UseTokenBalancesAndApprovalsReturn => {
  const { address: userAddress } = useAccount()
  const chainId = useChainId()

  // Get tokens for current chain
  const tokensForChain = getTokensForChain(chainId)

  // Prepare contracts for parallel reading
  const contracts = userAddress && spenderAddress 
    ? tokensForChain.flatMap(token => {
        const tokenAddress = token.addresses[chainId]
        if (!tokenAddress) return []

        return [
          {
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'balanceOf',
            args: [userAddress],
          },
          {
            address: tokenAddress,
            abi: ERC20_ABI,
            functionName: 'allowance',
            args: [userAddress, spenderAddress],
          },
        ] as const
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
      enabled: !!userAddress && !!spenderAddress && tokensForChain.length > 0,
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  })

  // Process results and format tokens
  const tokens: TokenBalanceAndApproval[] = tokensForChain.map((tokenConfig, index) => {
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
        allowance: '0',
        allowanceRaw: BigInt(0),
        hasAllowance: false,
        isLoading: false,
        error: 'Token not available on this chain',
      }
    }

    // Get results from parallel calls
    const balanceIndex = index * 2
    const allowanceIndex = index * 2 + 1
    
    const balanceResult = contractResults?.[balanceIndex]
    const allowanceResult = contractResults?.[allowanceIndex]

    const balanceRaw = balanceResult?.status === 'success' ? (balanceResult.result as bigint) : BigInt(0)
    const allowanceRaw = allowanceResult?.status === 'success' ? (allowanceResult.result as bigint) : BigInt(0)

    const balance = formatUnits(balanceRaw, tokenConfig.decimals)
    const allowance = formatUnits(allowanceRaw, tokenConfig.decimals)

    let tokenError: string | undefined
    if (balanceResult?.status === 'failure') {
      tokenError = `Balance error: ${balanceResult.error?.message || 'Unknown error'}`
    } else if (allowanceResult?.status === 'failure') {
      tokenError = `Allowance error: ${allowanceResult.error?.message || 'Unknown error'}`
    }

    return {
      symbol: tokenConfig.symbol,
      name: tokenConfig.name,
      icon: tokenConfig.icon,
      decimals: tokenConfig.decimals,
      address: tokenAddress,
      balance: formatTokenBalance(balance),
      balanceRaw,
      allowance: formatTokenBalance(allowance),
      allowanceRaw,
      hasAllowance: allowanceRaw > BigInt(0),
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