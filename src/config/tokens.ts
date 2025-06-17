// Token configuration with addresses per chain
export interface TokenConfig {
  symbol: string
  name: string
  icon: string
  decimals: number
  addresses: Record<number, `0x${string}`> // chainId -> contract address
  coingeckoId?: string // For price fetching if needed
}

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
      1: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // Ethereum
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
      1: '0xA0b86a33E6441b22fB1BCC9C6e47e85eF42cFbb5', // Ethereum (USDC.e)
      42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum (native USDC)
    },
    coingeckoId: 'usd-coin',
  },
  'USDC.e': {
    symbol: 'USDC.e',
    name: 'Bridged USDC',
    icon: '$',
    decimals: 6,
    addresses: {
      42161: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // Arbitrum (bridged USDC)
    },
    coingeckoId: 'usd-coin',
  },
  WETH: {
    symbol: 'WETH',
    name: 'Wrapped Ethereum',
    icon: 'Ξ',
    decimals: 18,
    addresses: {
      1: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // Ethereum
      42161: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // Arbitrum
    },
    coingeckoId: 'weth',
  },
  DAI: {
    symbol: 'DAI',
    name: 'Dai Stablecoin',
    icon: '◈',
    decimals: 18,
    addresses: {
      1: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // Ethereum
      42161: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // Arbitrum
    },
    coingeckoId: 'dai',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: '₮',
    decimals: 6,
    addresses: {
      1: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum
      42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum
    },
    coingeckoId: 'tether',
  },
  LINK: {
    symbol: 'LINK',
    name: 'Chainlink',
    icon: '🔗',
    decimals: 18,
    addresses: {
      1: '0x514910771AF9Ca656af840dff83E8264EcF986CA', // Ethereum
      42161: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4', // Arbitrum
    },
    coingeckoId: 'chainlink',
  },
  UNI: {
    symbol: 'UNI',
    name: 'Uniswap',
    icon: '🦄',
    decimals: 18,
    addresses: {
      1: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // Ethereum
      42161: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0', // Arbitrum
    },
    coingeckoId: 'uniswap',
  },
  AAVE: {
    symbol: 'AAVE',
    name: 'Aave',
    icon: '👻',
    decimals: 18,
    addresses: {
      1: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // Ethereum
      42161: '0xba5DdD1f9d7F570dc94a51479a000E3BCE967196', // Arbitrum
    },
    coingeckoId: 'aave',
  },
  COMP: {
    symbol: 'COMP',
    name: 'Compound',
    icon: '🏛️',
    decimals: 18,
    addresses: {
      1: '0xc00e94Cb662C3520282E6f5717214004A7f26888', // Ethereum
      42161: '0x354A6dA3fcde098F8389cad84b0182725c6C91dE', // Arbitrum
    },
    coingeckoId: 'compound-governance-token',
  },
  MKR: {
    symbol: 'MKR',
    name: 'Maker',
    icon: '🏗️',
    decimals: 18,
    addresses: {
      1: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2', // Ethereum
      // Note: MKR is not natively available on Arbitrum, would need to be bridged
    },
    coingeckoId: 'maker',
  },
  ARB: {
    symbol: 'ARB',
    name: 'Arbitrum',
    icon: '🔵',
    decimals: 18,
    addresses: {
      42161: '0x912CE59144191C1204E64559FE8253a0e49E6548', // Arbitrum native token
    },
    coingeckoId: 'arbitrum',
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
  1: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  42161: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
} as const 