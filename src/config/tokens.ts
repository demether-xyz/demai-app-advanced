// Token configuration with addresses per chain
export interface TokenConfig {
  symbol: string
  name: string
  icon: string
  decimals: number
  addresses: Record<number, `0x${string}`> // chainId -> contract address
  coingeckoId?: string // For price fetching if needed
}

// DETERMINISTIC VAULT FACTORY ADDRESS
// This address is IDENTICAL across all chains due to CREATE2 deployment.
export const VAULT_FACTORY_ADDRESS = '0x5C97F0a08a1c8a3Ed6C1E1dB2f7Ce08a4BFE53C7' as const;

// Enhanced VaultFactory ABI with all needed functions for deterministic addresses
export const VAULT_FACTORY_ABI = [
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getUserVault',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'vaultOwner', type: 'address' }],
    name: 'predictVaultAddress',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getBeacon',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'getImplementation',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'vaultOwner', type: 'address' }],
    name: 'deployVault',
    outputs: [{ internalType: 'address', name: '', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'hasVault',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'VAULT_DEPLOYER_ID',
    outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }],
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
  {
    inputs: [],
    name: 'symbol',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'name',
    outputs: [{ internalType: 'string', name: '', type: 'string' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'decimals',
    outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const

// Supported tokens configuration
export const SUPPORTED_TOKENS: Record<string, TokenConfig> = {
  SOLVBTC: {
    symbol: 'SOLVBTC',
    name: 'SolvBTC',
    icon: 'btc', // Will be rendered as Bitcoin icon with Solv branding
    decimals: 18,
    addresses: {
      1116: '0xe04d21d999FaEDf1e72AdE6629e20A11a1ed14FA', // Core
    },
    coingeckoId: 'solvbtc',
  },
  BTCB: {
    symbol: 'BTCB',
    name: 'Bitcoin',
    icon: 'btc', // Will be rendered as Bitcoin icon
    decimals: 18,
    addresses: {
      1116: '0x7a6888c85edba8e38f6c7e0485212da602761c08', // Core
    },
    coingeckoId: 'bitcoin',
  },
  USDC: {
    symbol: 'USDC',
    name: 'USD Coin',
    icon: 'usdc', // Will be rendered as USDC icon
    decimals: 6,
    addresses: {
      42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum (native USDC)
      1116: '0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9', // Core
    },
    coingeckoId: 'usd-coin',
  },
  USDT: {
    symbol: 'USDT',
    name: 'Tether USD',
    icon: 'usdt', // Will be rendered as USDT icon
    decimals: 6,
    addresses: {
      42161: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // Arbitrum
      1116: '0x900101d06A7426441Ae63e9AB3B9b0F63Be145F1', // Core
    },
    coingeckoId: 'tether',
  },
  AUSD: {
    symbol: 'AUSD',
    name: 'AUSD Stablecoin',
    icon: 'ausd', // Will be rendered with dedicated AUSD icon
    decimals: 6,
    addresses: {
      747474: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a', // Katana
    },
    coingeckoId: 'ausd',
  },
}

// Helper functions
export const getTokensForChain = (chainId: number): TokenConfig[] => {
  return Object.values(SUPPORTED_TOKENS).filter(token => 
    token.addresses[chainId] && token.addresses[chainId] !== '0x0000000000000000000000000000000000000000'
  )
}

export const getTokenAddress = (symbol: string, chainId: number): `0x${string}` | undefined => {
  const token = SUPPORTED_TOKENS[symbol]
  const address = token?.addresses[chainId]
  return address && address !== '0x0000000000000000000000000000000000000000' ? address : undefined
}

export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
  return SUPPORTED_TOKENS[symbol]
}

export const getTokenByAddress = (address: string, chainId: number): TokenConfig | undefined => {
  return Object.values(SUPPORTED_TOKENS).find(
    token => token.addresses[chainId]?.toLowerCase() === address.toLowerCase() &&
             address.toLowerCase() !== '0x0000000000000000000000000000000000000000'
  )
}

// Chain configuration interface
export interface Chain {
  id: number
  name: string
  icon: string
  nativeCurrency: string
  explorerUrl: string
  factoryDeployed: boolean // Whether the deterministic factory is deployed on this chain
}

// Supported chains configuration
export const SUPPORTED_CHAINS: Chain[] = [
  { 
    id: 42161, 
    name: 'Arbitrum', 
    icon: '🔵', 
    nativeCurrency: 'ETH', 
    explorerUrl: 'https://arbiscan.io',
    factoryDeployed: true // TODO: Update based on actual deployment status
  },
  { 
    id: 1116, 
    name: 'Core', 
    icon: '🟠', 
    nativeCurrency: 'CORE', 
    explorerUrl: 'https://scan.coredao.org',
    factoryDeployed: true // TODO: Update based on actual deployment status
  },
  {
    id: 747474,
    name: 'Katana',
    icon: '🟡',
    nativeCurrency: 'ETH',
    explorerUrl: 'https://explorer.katanarpc.com',
    factoryDeployed: true // TODO: Update based on actual deployment status
  }
]

// Chain-specific native currency information
export const NATIVE_CURRENCIES = {
  42161: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  1116: { symbol: 'CORE', name: 'Core', decimals: 18 },
  747474: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  // 1: { symbol: 'ETH', name: 'Ethereum', decimals: 18 },
  // 137: { symbol: 'MATIC', name: 'Polygon', decimals: 18 },
} as const

// Helper to get chains where factory is deployed
export const getDeployedChains = (): Chain[] => {
  return SUPPORTED_CHAINS.filter(chain => chain.factoryDeployed)
}

// Helper to check if a chain has factory deployed
export const isFactoryDeployed = (chainId: number): boolean => {
  return SUPPORTED_CHAINS.find(chain => chain.id === chainId)?.factoryDeployed || false
}