// Token configuration with addresses per chain
export interface TokenConfig {
  symbol: string
  name: string
  icon: string
  decimals: number
  addresses: Record<number, `0x${string}`> // chainId -> contract address
  coingeckoId?: string // For price fetching if needed
}

// Vault configuration constants
export const VAULT_FACTORY_ADDRESSES: Record<number, `0x${string}`> = {
  42161: '0x577264F9fC6595ae64d82d5a80a4Bc0c01d30135', // Arbitrum
  // Add other chains as they are deployed
}

export const BEACON_ADDRESS = '0xE8eEFd7A7D2e6EC7C970bcE1fe6Cda7a737f03b9' as const
export const BEACON_PROXY_CREATION_CODE = '0x60a08060405261047a80380380916100178285610292565b833981016040828203126101eb5761002e826102c9565b602083015190926001600160401b0382116101eb57019080601f830112156101eb57815161005b816102dd565b926100696040519485610292565b8184526020840192602083830101116101eb57815f926020809301855e84010152823b15610274577fa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d5080546001600160a01b0319166001600160a01b038516908117909155604051635c60da1b60e01b8152909190602081600481865afa9081156101f7575f9161023a575b50803b1561021a5750817f1cf3b03a6cf19fa2baba4df148e9dcabedea7f8a5c07840e207e5c089be95d3e5f80a282511561020257602060049260405193848092635c60da1b60e01b82525afa9182156101f7575f926101ae575b505f809161018a945190845af43d156101a6573d9161016e836102dd565b9261017c6040519485610292565b83523d5f602085013e6102f8565b505b608052604051610123908161035782396080518160180152f35b6060916102f8565b9291506020833d6020116101ef575b816101ca60209383610292565b810103126101eb575f80916101e161018a956102c9565b9394509150610150565b5f80fd5b3d91506101bd565b6040513d5f823e3d90fd5b505050341561018c5763b398979f60e01b5f5260045ffd5b634c9c8ce360e01b5f9081526001600160a01b0391909116600452602490fd5b90506020813d60201161026c575b8161025560209383610292565b810103126101eb57610266906102c9565b5f6100f5565b3d9150610248565b631933b43b60e21b5f9081526001600160a01b038416600452602490fd5b601f909101601f19168101906001600160401b038211908210176102b557604052565b634e487b7160e01b5f52604160045260245ffd5b51906001600160a01b03821682036101eb57565b6001600160401b0381116102b557601f01601f191660200190565b9061031c575080511561030d57805190602001fd5b63d6bda27560e01b5f5260045ffd5b8151158061034d575b61032d575090565b639996b31560e01b5f9081526001600160a01b0391909116600452602490fd5b50803b1561032556fe60806040819052635c60da1b60e01b81526020906004817f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03165afa801560a2575f901560d1575060203d602011609c575b6080601f8201601f1916810191906001600160401b0383119083101760885760849160405260800160ad565b60d1565b634e487b7160e01b5f52604160045260245ffd5b503d6058565b6040513d5f823e3d90fd5b602090607f19011260cd576080516001600160a01b038116810360cd5790565b5f80fd5b5f8091368280378136915af43d5f803e1560e9573d5ff35b3d5ffdfea26469706673582212205150f12dbfa71114694a79e73bba65c3ec6d0a1843519458cee7981cf548d6c264736f6c634300081d0033' as const

// VaultFactory ABI
export const VAULT_FACTORY_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserVault',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const 

// ERC20 ABI for balance and allowance calls
export const ERC20_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'owner', type: 'address' },
      { internalType: 'address', name: 'spender', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const

// Supported tokens configuration
export const SUPPORTED_TOKENS: Record<string, TokenConfig> = {
  WBTC: {
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    icon: '₿',
    decimals: 8,
    addresses: {
      42161: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f', // Arbitrum
    },
    coingeckoId: 'wrapped-bitcoin',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: '$',
    decimals: 6,
    addresses: {
      42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum (native USDC)
    },
    coingeckoId: 'usd-coin',
  },
}

// Helper functions
export const getTokensForChain = (chainId: number): TokenConfig[] => {
  return Object.values(SUPPORTED_TOKENS).filter(token => token.addresses[chainId])
}

export const getTokenAddress = (symbol: string, chainId: number): `0x${string}` | undefined => {
  const token = SUPPORTED_TOKENS[symbol]
  return token?.addresses[chainId]
}

export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
  return SUPPORTED_TOKENS[symbol]
}

export const getTokenByAddress = (address: string, chainId: number): TokenConfig | undefined => {
  return Object.values(SUPPORTED_TOKENS).find(
    token => token.addresses[chainId]?.toLowerCase() === address.toLowerCase()
  )
}

// Chain-specific native currency information
export const NATIVE_CURRENCIES = {
  42161: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
} as const