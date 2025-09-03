# Adding a New Chain to Demether

This document outlines the process for integrating a new blockchain into the Demether platform.

## Prerequisites
- New chain must be EVM-compatible
- RPC endpoint for the new chain
- Native currency information
- Token contracts deployed on the new chain

## Step-by-Step Process

### 1. Deploy Vault Factory on New Chain
- Deploy the VaultFactory contract using CREATE2 for deterministic addresses
- Record the factory address (should be same across all chains: `0x5C97F0a08a1c8a3Ed6C1E1dB2f7Ce08a4BFE53C7`)

### 2. Set Vault Manager
- Configure the vault manager permissions
- Ensure proper access controls are in place

### 3. Configure Frontend Token Support

**File:** `/Users/jdorado/dev/demether/demai-app/src/config/tokens.ts`

Add new chain to existing tokens:
```typescript
USDC: {
  symbol: 'USDC',
  name: 'USD Coin',
  icon: 'usdc',
  decimals: 6,
  addresses: {
    42161: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831', // Arbitrum
    1116: '0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9',   // Core
    NEW_CHAIN_ID: '0x...', // Add new chain address
  },
  coingeckoId: 'usd-coin',
},
```

Add new chain to SUPPORTED_CHAINS:
```typescript
export const SUPPORTED_CHAINS: Chain[] = [
  // ... existing chains
  {
    id: NEW_CHAIN_ID,
    name: 'Chain Name',
    icon: '=�',
    nativeCurrency: 'ETH', // or native token
    explorerUrl: 'https://explorer.example.com',
    factoryDeployed: true
  }
]
```

### 4. Configure Backend Token Support

**File:** `/Users/jdorado/dev/demether/demai-api/src/config.py`

Add chain to SUPPORTED_TOKENS:
```python
"USDC": {
    "symbol": "USDC",
    "name": "USD Coin", 
    "decimals": 6,
    "addresses": {
        42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",  # Arbitrum
        1116: "0xa4151B2B3e269645181dCcF2D426cE75fcbDeca9",   # Core
        NEW_CHAIN_ID: "0x...",  # Add new chain address
    },
    "aave_atokens": {
        # Add yield-bearing token addresses if applicable
        NEW_CHAIN_ID: "0x...",
    },
    # If yield token has different decimals than underlying token
    "atoken_decimals": {
        NEW_CHAIN_ID: 18,  # Only if aToken decimals differ from underlying token
    },
    "coingeckoId": "usd-coin"
},
```

Add chain configuration:
```python
CHAIN_CONFIG = {
    # ... existing chains
    NEW_CHAIN_ID: {
        "name": "Chain Name",
        "rpc_url": os.getenv("CHAIN_RPC_URL", "https://rpc.example.com"),
        "native_currency": {"symbol": "ETH", "name": "Ethereum", "decimals": 18, "coingeckoId": "ethereum"}
    }
}
```

### 5. Configure CoinGecko Price IDs

**Where to edit:** Both frontend and backend token configurations

**Common CoinGecko IDs:**
- `usd-coin` - USDC (H$1.00)
- `tether` - USDT (H$1.00) 
- `ethereum` - ETH
- `bitcoin` - BTC/WBTC
- `agora-dollar` - AUSD (H$1.00)

**Finding correct CoinGecko ID:**
1. Visit https://www.coingecko.com
2. Search for the token
3. Check the URL: `https://www.coingecko.com/en/coins/{coingecko-id}`
4. Use the `{coingecko-id}` part

**For new/custom tokens:**
- If token doesn't exist on CoinGecko, use a similar token's ID
- For stablecoins, use `usd-coin` or `tether`
- For yield-bearing tokens, use underlying asset's ID

### 6. Frontend Protocol Support (for Yield-Bearing Tokens)

**File:** `/Users/jdorado/dev/demether/demai-app/src/components/Portfolio.tsx`

For chains with different protocols (like Morpho on Katana vs Aave on other chains):

1. **Add protocol to display names:**
```typescript
const PROTOCOL_DISPLAY_NAMES: Record<string, string> = {
  'aave': 'Aave',
  'colend': 'Colend',
  'morpho': 'Morpho',  // Add new protocol
  // ... other protocols
}
```

2. **Add chain-specific formatting:**
```typescript
// Special case: Morpho protocol on Katana chain
if (assetType.toLowerCase().includes('morpho') && chainName?.toLowerCase().includes('katana')) {
  return 'Morpho'
}
```

3. **Add to store interface (`src/store/index.ts`):**
```typescript
export interface AssetData {
  protocol: string;
  asset_type: string;
  total_value_usd: number;
  tokens: Record<string, PortfolioToken>;
}
```

### 7. Testing Integration

⚠️ **IMPORTANT: Fund the vault first!**
1. **Fund test vault:** Send desired tokens to the vault address before testing
2. **Deploy test vault:** Create a vault on the new chain  
3. **Test token detection:** Verify portfolio API detects tokens
4. **Test pricing:** Ensure USD values are calculated correctly
5. **Test yield tokens:** Verify aTokens appear in Assets section with proper protocol branding
6. **Test transactions:** Verify DeFi operations work

### Example: Katana Chain Integration (with Morpho)

**Frontend (`tokens.ts`):**
```typescript
AUSD: {
  symbol: 'AUSD',
  name: 'AUSD Stablecoin',
  icon: 'ausd',
  decimals: 6,
  addresses: {
    747474: '0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a', // Katana
  },
  coingeckoId: 'agora-dollar',
},
```

**Backend (`config.py`):**
```python
"AUSD": {
    "symbol": "AUSD",
    "name": "AUSD Stablecoin",
    "decimals": 6,
    "addresses": {
        747474: "0x00000000eFE302BEAA2b3e6e1b18d08D69a9012a",  # Katana
    },
    "aave_atokens": {
        # Single vault (legacy format)
        # 747474: "0x82c4C641CCc38719ae1f0FBd16A64808d838fDfD",
        
        # Multiple vaults (new array format) - for chains with multiple yield vaults
        747474: [
            {
                "address": "0x82c4C641CCc38719ae1f0FBd16A64808d838fDfD",
                "name": "Steakhouse High Yield AUSD",
                "decimals": 18
            },
            {
                "address": "0x9540441C503D763094921dbE4f13268E6d1d3B56",
                "name": "Gauntlet AUSD",
                "decimals": 18
            }
        ]
    },
    "coingeckoId": "agora-dollar"
},
```

**Backend Portfolio Service (`portfolio_service.py`):**
- Chain-specific protocol detection (Morpho for Katana, Aave for others)
- Automatic decimal handling for yield tokens with different precision

## Important Notes

- **Fund vault first:** Always send test tokens to vault address before testing portfolio detection
- **Decimals matter:** Always verify token decimals (6 for USDC/USDT, 18 for ETH/WETH)
- **Yield tokens:** Use `atoken_decimals` config when yield tokens have different decimals than underlying tokens
- **Protocol detection:** Backend automatically detects protocol based on chain (Morpho for Katana, Aave for others)  
- **Frontend assets:** Yield tokens appear in green "Asset Tokens (Yield Bearing)" section, not regular tokens
- **Price accuracy:** Test pricing thoroughly, especially for stablecoins (should be ≈$1.00)
- **Factory address:** Must be identical across all chains due to CREATE2 deployment

## Troubleshooting

**Common Issues:**
1. **Wrong decimals:** Token shows incorrect balance (too high/low by powers of 10)
2. **Wrong price:** USD values way off (check CoinGecko ID)
3. **Token not detected:** Check addresses and chain configuration
4. **Vault errors:** Verify factory deployment and permissions