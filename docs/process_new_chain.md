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

### 7. Adding New Protocol Tools to Assistant

When adding new protocols (like Morpho) that the AI assistant can interact with:

**File:** `/Users/jdorado/dev/demether/demai-api/src/utils/defi_tools.py`

1. **Add tool import:**
```python
from tools.morpho_tool import create_morpho_tool  # Add new tool import
```

2. **Add input schema:**
```python
class MorphoLendingInput(BaseModel):
    chain_name: str = Field(description="The blockchain network - currently 'Katana' for MetaMorpho vaults")
    token_symbol: str = Field(description="The token symbol (e.g., 'AUSD')")
    amount: float = Field(description="The amount to supply or withdraw")
    action: str = Field(description="The operation - 'supply' or 'withdraw'")
    market_id: str = Field(description="Morpho market ID or MetaMorpho vault address")
```

3. **Add tool to creation function:**
```python
# Morpho tool
morpho_config = create_morpho_tool(vault_address=vault_address)
morpho_func = morpho_config["tool"]

tools.append(create_langchain_tool(
    func=morpho_func,
    name="morpho_lending",
    description="Supply or withdraw tokens on Morpho Blue markets or MetaMorpho vaults.",
    args_schema=MorphoLendingInput
))
```

**File:** `/Users/jdorado/dev/demether/demai-api/src/services/assistant.py`

4. **Update available tools list in system prompt:**
```python
"available_tools": [
    # ... existing tools
    {
        "name": "morpho_lending",
        "description": "Supply or withdraw tokens on Morpho Blue markets or MetaMorpho vaults (Katana chain) for advanced yield opportunities"
    }
],
```

5. **Update action guidelines:**
```python
"action_guidelines": [
    "For yield optimization requests: Compare ALL available options (Aave/Colend AND Morpho), identify best opportunities, then deposit to the highest yield protocol",
    "PROTOCOL SELECTION: When multiple yield options are available, always choose the highest APY option across all protocols (Aave, Colend, Morpho)",
    "IMPORTANT: Cross-chain transfers are NOT supported. You can only: 1) Swap tokens on Core via Akka, 2) Lend on Arbitrum via Aave, 3) Lend on Core via Colend, 4) Lend on Katana via Morpho vaults"
]
```

6. **Add protocol yields to context:**
```python
"current_lending_rates": {
    "aave_colend": {
        "description": "Current borrow APY rates for tokens on Aave/Colend",
        "yields": aave_yields,
        "note": "Traditional lending yields"
    },
    "morpho": {
        "description": "Current supply APY rates for Morpho markets and MetaMorpho vaults", 
        "yields": morpho_yields,
        "note": "Advanced lending yields through Morpho Blue protocol"
    },
    "usage_note": "Compare both Aave/Colend and Morpho rates to recommend the highest yield option"
}
```

7. **Add chain transaction formatting:**
```python
"transaction_formatting": {
    "Core": "https://scan.coredao.org/tx/{tx_hash}",
    "Arbitrum": "https://arbiscan.io/tx/{tx_hash}",
    "Katana": "https://katana-explorer.vercel.app/tx/{tx_hash}"  # Add new chain
},
```

**File:** `/Users/jdorado/dev/demether/demai-api/src/utils/aave_yields_utils.py`

8. **Update context utility to show yield-bearing assets:**
```python
def get_available_tokens_and_yield_assets() -> Dict[str, Any]:
    """Get available tokens, yield-bearing assets, and chains from config."""
    # Extract both regular tokens and yield-bearing assets (aTokens/vault tokens)
    available_tokens = {}
    yield_bearing_assets = {}
    
    for token_symbol, token_info in SUPPORTED_TOKENS.items():
        # ... process regular tokens
        
        # Get yield-bearing assets (aTokens/vault tokens)  
        if "aave_atokens" in token_info:
            for chain_id, atoken_config in token_info["aave_atokens"].items():
                # Handle both single aToken and multiple aTokens (array format)
                if isinstance(atoken_config, list):
                    # Multiple yield assets (new array format like Katana vaults)
                    for atoken_data in atoken_config:
                        asset_name = atoken_data.get("name")  # Use configured name
                        yield_bearing_assets[asset_name] = [chain_name]
                # ... handle other formats
```

### 8. Adding Protocol Yield Fetching (for Assistant AI)

When adding new lending protocols, the AI assistant needs access to yield data for optimization decisions:

**Step 8.1: Create Yield Calculation Functions**

**File:** `/Users/jdorado/dev/demether/demai-api/src/tools/{protocol}_tool.py`

```python
# Add yield calculation functions similar to morpho_tool.py:

async def get_all_morpho_yields(
    web3_instances: Optional[Dict] = None,
    cache_service: Optional[MorphoYieldCacheService] = None,
    db: Optional[AsyncIOMotorDatabase] = None,
    known_markets_and_vaults: Optional[Dict[int, List[str]]] = None
) -> Dict[str, List[Dict[str, Any]]]:
    """Get current yield rates for all known protocol markets/vaults."""
    
    # Default known markets/vaults configuration
    if known_markets_and_vaults is None:
        known_markets_and_vaults = {
            747474: [  # Katana - MetaMorpho vaults
                "0x82c4C641CCc38719ae1f0FBd16A64808d838fDfD",  # Steakhouse Prime
                "0x9540441C503D763094921dbE4f13268E6d1d3B56",  # Gauntlet
            ]
        }
    
    # Parallel fetching with caching
    tasks = []
    for chain_id, markets_and_vaults in known_markets_and_vaults.items():
        for market_or_vault_id in markets_and_vaults:
            tasks.append(_get_yield_with_cache(
                web3_instances[chain_id],
                market_or_vault_id,
                chain_id,
                cache_service
            ))
    
    # Execute and organize results by token symbol
    results = await asyncio.gather(*tasks, return_exceptions=True)
    # ... organize by token symbol
```

**Step 8.2: Create Protocol Yield Cache Service**

```python
class MorphoYieldCacheService:
    """Cache service for protocol yields with TTL."""
    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None, cache_ttl_hours: int = 3):
        self.db = db
        self.cache_ttl = timedelta(hours=cache_ttl_hours)
        # ... implement caching logic
```

**Step 8.3: Create Yield Utilities Module**

**File:** `/Users/jdorado/dev/demether/demai-api/src/utils/{protocol}_yields_utils.py`

```python
async def get_simplified_morpho_yields() -> List[Dict[str, Any]]:
    """Get simplified protocol yields for assistant context."""
    try:
        db = await mongo_connection.connect()
        yields = await get_all_morpho_yields(db=db)
        
        simplified_yields = []
        for token_symbol, chain_yields in yields.items():
            for yield_data in chain_yields:
                chain_id = yield_data.get('chain_id')
                chain_name = CHAIN_CONFIG.get(chain_id, {}).get('name')
                
                # Map known addresses to friendly names
                protocol_name = "Protocol Name"
                if yield_data.get('vault_address') == "0x82c4C641...":
                    protocol_name = "Steakhouse Prime AUSD Vault"
                
                simplified_yields.append({
                    'token': token_symbol,
                    'chain': chain_name,
                    'supply_apy': yield_data.get('supply_apy', 0),
                    'protocol': protocol_name,
                    'market_or_vault_id': yield_data.get('vault_address')
                })
        
        return simplified_yields
    except Exception as e:
        logger.warning(f"Failed to fetch protocol yields: {e}")
        return []
```

**Step 8.4: Update Assistant Context**

**File:** `/Users/jdorado/dev/demether/demai-api/src/services/assistant.py`

1. **Add yield import:**
```python
from utils.morpho_yields_utils import get_simplified_morpho_yields
```

2. **Update context building:**
```python
async def _build_context_prompt(self, memory_data: dict = None) -> str:
    # Get yields from all protocols
    aave_yields = await get_simplified_aave_yields()
    morpho_yields = await get_simplified_morpho_yields()  # Add new protocol
    
    context_data = {
        "current_context": {
            "current_lending_rates": {
                "aave_colend": {
                    "description": "Current borrow APY rates for Aave/Colend",
                    "yields": aave_yields,
                    "note": "Traditional lending yields"
                },
                "morpho": {  # Add new protocol section
                    "description": "Current supply APY rates for Morpho markets and MetaMorpho vaults",
                    "yields": morpho_yields,
                    "note": "Advanced lending yields through Morpho Blue protocol"
                },
                "usage_note": "Compare ALL protocols to recommend highest yield option"
            }
        }
    }
```

3. **Update action guidelines:**
```python
"action_guidelines": [
    "For yield optimization requests: Compare ALL available options (Aave/Colend AND Morpho), identify best opportunities, then deposit to the highest yield protocol",
    "PROTOCOL SELECTION: When multiple yield options are available, always choose the highest APY option across all protocols",
]
```

**Step 8.5: Testing Yield Integration**

Create test files to verify yield fetching works:

**File:** `/Users/jdorado/dev/demether/demai-api/src/test/test_{protocol}_yields.py`

```python
async def test_protocol_yields_fetching():
    """Test fetching protocol yields through the utils function."""
    simplified_yields = await get_simplified_morpho_yields()
    
    if simplified_yields:
        logging.info(f"✅ Found {len(simplified_yields)} yield opportunities:")
        for yield_data in simplified_yields:
            logging.info(f"  - {yield_data['token']} on {yield_data['chain']}: "
                       f"{yield_data['supply_apy']}% APY via {yield_data['protocol']}")
    
    # Test best yield selection
    best_yield = await get_best_morpho_yield_for_token("AUSD")
    if "error" not in best_yield:
        logging.info(f"✅ Best yield: {best_yield['best_apy']}% APY")
```

**Step 8.6: Testing Assistant Integration**

```python
async def test_assistant_context():
    """Test that assistant context includes protocol yields."""
    assistant = SimpleAssistant(vault_address="0x...")
    await assistant._init_agent()
    
    context_prompt = await assistant._build_context_prompt()
    
    # Verify protocol data is included
    assert "morpho" in context_prompt.lower()
    assert "steakhouse" in context_prompt.lower()
    
    # Verify system prompt includes tools
    system_prompt = assistant._build_system_prompt()
    assert "morpho_lending" in system_prompt.lower()
```

### 9. Testing Integration

⚠️ **IMPORTANT: Fund the vault first!**
1. **Fund test vault:** Send desired tokens to the vault address before testing
2. **Deploy test vault:** Create a vault on the new chain  
3. **Test token detection:** Verify portfolio API detects tokens
4. **Test pricing:** Ensure USD values are calculated correctly
5. **Test yield tokens:** Verify aTokens appear in Assets section with proper protocol branding
6. **Test protocol tools:** Verify AI assistant can use new protocol tools
7. **Test yield fetching:** Verify assistant can fetch and compare yields across protocols
8. **Test yield optimization:** Verify assistant recommends highest yield options
9. **Test transactions:** Verify DeFi operations work

### Example: Katana Chain Integration (with Morpho)

This example shows the complete integration of Katana chain with Morpho protocol support:

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
        # Multiple vaults (array format) - for chains with multiple yield vaults
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

CHAIN_CONFIG = {
    747474: {
        "name": "Katana",
        "rpc_url": os.getenv("KATANA_RPC_URL", "https://rpc.katana.dev"),
        "native_currency": {"symbol": "ETH", "name": "Ethereum", "decimals": 18, "coingeckoId": "ethereum"}
    }
}
```

**Morpho Tool Implementation (`morpho_tool.py`):**
```python
# Yield calculation functions
async def get_all_morpho_yields() -> Dict[str, List[Dict[str, Any]]]:
    """Get yields from known Morpho vaults."""
    known_markets_and_vaults = {
        747474: [  # Katana MetaMorpho vaults
            "0x82c4C641CCc38719ae1f0FBd16A64808d838fDfD",  # Steakhouse Prime
            "0x9540441C503D763094921dbE4f13268E6d1d3B56",  # Gauntlet
        ]
    }
    # ... yield fetching and caching logic

# Vault operations
async def deposit_to_metamorpho_vault(executor, vault_address, asset_token, amount, target_vault):
    """Deposit to MetaMorpho vault via strategy vault."""
    call_data = _encode_vault_deposit(amount, vault_address) 
    approvals = [(asset_token, amount)]
    return await executor.execute_strategy(vault_address, target_vault, call_data, approvals)
```

**Morpho Yields Utility (`morpho_yields_utils.py`):**
```python
async def get_simplified_morpho_yields() -> List[Dict[str, Any]]:
    """Get simplified Morpho yields for assistant context."""
    yields = await get_all_morpho_yields(db=db)
    
    simplified_yields = []
    for token_symbol, chain_yields in yields.items():
        for yield_data in chain_yields:
            # Map vault addresses to friendly names
            vault_address = yield_data.get('vault_address', '')
            if vault_address == "0x82c4C641CCc38719ae1f0FBd16A64808d838fDfD":
                protocol_name = "Steakhouse Prime AUSD Vault"
            elif vault_address == "0x9540441C503D763094921dbE4f13268E6d1d3B56":
                protocol_name = "Gauntlet AUSD Vault"
            else:
                protocol_name = f"MetaMorpho Vault ({vault_address[:8]}...)"
            
            simplified_yields.append({
                'token': token_symbol,
                'chain': 'Katana',
                'supply_apy': yield_data.get('supply_apy', 0),
                'protocol': protocol_name,
                'vault_type': 'MetaMorpho',
                'market_or_vault_id': vault_address
            })
    
    return simplified_yields
```

**Assistant Integration (`assistant.py`):**
```python
# Import Morpho yields
from utils.morpho_yields_utils import get_simplified_morpho_yields

async def _build_context_prompt(self, memory_data: dict = None) -> str:
    # Get yields from both protocols
    aave_yields = await get_simplified_aave_yields()
    morpho_yields = await get_simplified_morpho_yields()
    
    context_data = {
        "current_context": {
            "current_lending_rates": {
                "aave_colend": {
                    "description": "Current borrow APY rates for Aave/Colend",
                    "yields": aave_yields,
                    "note": "Traditional lending yields"
                },
                "morpho": {
                    "description": "Current supply APY rates for Morpho markets and MetaMorpho vaults",
                    "yields": morpho_yields,
                    "note": "Advanced lending yields through Morpho Blue protocol"
                },
                "usage_note": "Compare both Aave/Colend and Morpho rates to recommend highest yield option"
            }
        }
    }

# Update available tools to include Morpho
"available_tools": [
    {"name": "morpho_lending", "description": "Supply or withdraw tokens on Morpho Blue markets or MetaMorpho vaults"}
],

# Update action guidelines for protocol comparison
"action_guidelines": [
    "For yield optimization: Compare ALL options (Aave/Colend AND Morpho), then deposit to highest yield protocol",
    "PROTOCOL SELECTION: Always choose the highest APY option across all protocols (Aave, Colend, Morpho)"
]
```

**Testing Results:**
```bash
# Test yield fetching
$ poetry run python src/test/test_morpho_yields.py
✅ Found 2 Morpho yield opportunities:
  - AUSD on Katana: 3.5% APY via Steakhouse Prime AUSD Vault
  - AUSD on Katana: 3.5% APY via Gauntlet AUSD Vault
✅ Best AUSD yield: 3.5% APY on Steakhouse Prime AUSD Vault (Katana)

# Test assistant context 
$ poetry run python src/test/test_assistant_context.py
✅ Morpho yields are included in assistant context
✅ Steakhouse Prime vault data found in context
✅ Gauntlet vault data found in context
✅ Morpho lending tool is included in system prompt
```

**Backend Portfolio Service (`portfolio_service.py`):**
- Chain-specific protocol detection (Morpho for Katana, Aave for others)
- Automatic decimal handling for yield tokens with different precision
- Support for multiple vaults per token via array format configuration

## Important Notes

- **Fund vault first:** Always send test tokens to vault address before testing portfolio detection
- **Decimals matter:** Always verify token decimals (6 for USDC/USDT, 18 for ETH/WETH)
- **Yield tokens:** Use `atoken_decimals` config when yield tokens have different decimals than underlying tokens
- **Protocol detection:** Backend automatically detects protocol based on chain (Morpho for Katana, Aave for others)  
- **Frontend assets:** Yield tokens appear in green "Asset Tokens (Yield Bearing)" section, not regular tokens
- **Price accuracy:** Test pricing thoroughly, especially for stablecoins (should be ≈$1.00)
- **Factory address:** Must be identical across all chains due to CREATE2 deployment

### 9. Strategy Setup (for Automated Yield Optimization)

When adding strategies for automated DeFi yield optimization on new chains:

**Step 9.1: Define Strategy in strategies.py**

**File:** `/Users/jdorado/dev/demether/demai-api/src/services/strategies.py`

Add new strategy definition:
```python
"chain_token_protocol_optimizer": {
    "id": "chain_token_protocol_optimizer",
    "name": "Chain Token Protocol Yield Optimizer",
    "description": "Optimizes token yield between different protocols/vaults on target chain",
    "task": "Compare yields between [list of protocols/vaults], then move {percentage}% of [TOKEN] funds to the highest yielding option",
    "chain": "chain_name",  # Must match exactly with chain name in config
    "tokens": ["TOKEN"],    # Tokens this strategy operates on
    "frequency": "daily",   # or hourly, weekly, monthly
    "vaults": [            # Optional: specific vault information
        {
            "name": "Protocol A Vault",
            "address": "0x...",
            "description": "High-yield strategy vault"
        },
        {
            "name": "Protocol B Vault", 
            "address": "0x...",
            "description": "Conservative yield vault"
        }
    ]
}
```

**Step 9.2: Update Strategy Execution Context**

**File:** `/Users/jdorado/dev/demether/demai-api/src/services/strategy_execution.py`

1. **Import protocol yields utilities:**
```python
from utils.morpho_yields_utils import get_simplified_morpho_yields  # Add new protocol
from utils.aave_yields_utils import get_simplified_aave_yields      # Existing
```

2. **Add protocol tools to available tools:**
```python
async def execute_defi_strategy(task: str, vault_address: str, model: str = "claude-3-5-sonnet-20241022") -> Dict[str, Any]:
    # Get available tools including new protocol
    available_tools = create_defi_tools(vault_address)
    
    # Tools should now include: view_portfolio, akka_swaps, aave_lending, colend_lending, morpho_lending
```

3. **Update context to include all protocol yields:**
```python
# Get yields from all protocols for comparison
aave_yields = await get_simplified_aave_yields()
morpho_yields = await get_simplified_morpho_yields()  # Add new protocol

context_data = {
    "current_context": {
        "current_lending_rates": {
            "aave_colend": {
                "description": "Current borrow APY rates for tokens on Aave/Colend",
                "yields": aave_yields,
                "note": "Traditional lending yields"
            },
            "morpho": {  # Add new protocol section
                "description": "Current supply APY rates for Morpho markets and MetaMorpho vaults", 
                "yields": morpho_yields,
                "note": "Advanced lending yields through Morpho Blue protocol"
            },
            "usage_note": "Compare ALL protocols (Aave/Colend AND Morpho) to recommend highest yield option"
        }
    }
}
```

4. **Update action guidelines for cross-protocol optimization:**
```python
"action_guidelines": [
    "For yield optimization requests: Compare ALL available options (Aave/Colend AND Morpho), identify best opportunities, then deposit to the highest yield protocol",
    "PROTOCOL SELECTION: When multiple yield options are available, always choose the highest APY option across all protocols (Aave, Colend, Morpho)",
    "IMPORTANT: Cross-chain transfers are NOT supported. Only operate on tokens within the same chain",
    "STRATEGY EXECUTION: Always check current portfolio first, then compare ALL protocol yields, then execute optimal move"
]
```

**Step 9.3: Update API Endpoints for Frontend Display**

**File:** `/Users/jdorado/dev/demether/demai-api/src/main.py`

Update `/strategies/` endpoint to include yields from all protocols:
```python
@app.get("/strategies/")
async def list_strategies():
    try:
        strategies = get_all_strategies()
        
        # Get yields from all protocols
        aave_yields = await get_simplified_aave_yields()
        morpho_yields = await get_simplified_morpho_yields()  # Add new protocol
        
        for strategy in strategies:
            # ... existing logic for tokens and chains
            
            # Add yields from all protocols for this strategy's tokens and chain
            for token in strategy.get("tokens", []):
                # Check Aave/Colend yields
                aave_yield = next((y for y in aave_yields 
                                 if y["token"] == token and y["chain"] == strategy["chain"]), None)
                
                # Check Morpho yields  
                morpho_yield = next((y for y in morpho_yields
                                   if y["token"] == token and y["chain"] == strategy["chain"]), None)
                
                # Use highest yield from any protocol
                if aave_yield and morpho_yield:
                    if morpho_yield["supply_apy"] > aave_yield["supply_apy"]:
                        strategy["current_apy"] = morpho_yield["supply_apy"]
                        strategy["yield_source"] = morpho_yield["protocol"]
                    else:
                        strategy["current_apy"] = aave_yield["supply_apy"]
                        strategy["yield_source"] = aave_yield["protocol"]
                elif morpho_yield:
                    strategy["current_apy"] = morpho_yield["supply_apy"]
                    strategy["yield_source"] = morpho_yield["protocol"]
                elif aave_yield:
                    strategy["current_apy"] = aave_yield["supply_apy"]
                    strategy["yield_source"] = aave_yield["protocol"]
```

**Step 9.4: Create Strategy Test Script**

Create or update test script for new strategies:

**File:** `/Users/jdorado/dev/demether/demai-api/src/test_strategy_flow.py`

Update default strategy and add chain-specific test cases:
```python
parser.add_argument('--strategy', default='katana_ausd_morpho_optimizer', help='Strategy ID to test')
parser.add_argument('--vault', help='Vault address')
parser.add_argument('--user', help='User wallet address')
parser.add_argument('--percentage', type=int, default=25, help='Percentage to allocate (1-100)')

# Add chain-specific examples in help text
parser.description = '''
Test Strategy Execution Flow

Example usage:
  # Test Katana AUSD Morpho strategy
  python test_strategy_flow.py --strategy katana_ausd_morpho_optimizer --percentage 25 --vault 0x... --user 0x...
  
  # Test Core stablecoin optimizer strategy  
  python test_strategy_flow.py --strategy core_stablecoin_optimizer --percentage 30 --vault 0x... --user 0x...
'''
```

**Step 9.5: Strategy Documentation and Testing**

Create strategy-specific documentation section:

**Example Strategy Documentation:**

```markdown
### Strategy Example: Katana AUSD Morpho Optimizer

**Purpose:** Automatically optimize AUSD yields between Steakhouse Prime and Gauntlet MetaMorpho vaults on Katana chain

**Configuration:**
- **Strategy ID:** `katana_ausd_morpho_optimizer` 
- **Chain:** Katana (747474)
- **Token:** AUSD
- **Frequency:** Daily
- **Target Vaults:**
  - Steakhouse Prime: `0x82c4C641CCc38719ae1f0FBd16A64808d838fDfD`
  - Gauntlet: `0x9540441C503D763094921dbE4f13268E6d1d3B56`

**Execution Flow:**
1. **Portfolio Analysis:** Check user's AUSD balance on Katana
2. **Yield Comparison:** Compare current APY rates between both MetaMorpho vaults
3. **Optimal Selection:** Identify vault with highest yield  
4. **Rebalancing:** Move specified percentage to optimal vault
5. **Notification:** Send results via Telegram if configured

**Testing:**
```bash
# List available strategies
python src/test_strategy_flow.py --list-strategies

# Test direct execution (no task creation)
python src/test_strategy_flow.py \
  --strategy katana_ausd_morpho_optimizer \
  --vault 0xYourVaultAddress \
  --user 0xYourWalletAddress \
  --percentage 25 \
  --direct-only

# Test full workflow (create task → execute → cleanup)  
python src/test_strategy_flow.py \
  --strategy katana_ausd_morpho_optimizer \
  --vault 0xYourVaultAddress \
  --user 0xYourWalletAddress \
  --percentage 25
```

**Expected Results:**
```json
{
  "status": "success",
  "task": "Compare yields between Steakhouse Prime and Gauntlet vaults, then move 25% of AUSD funds to highest yielding vault",
  "actions_taken": [
    "view_portfolio: {...}",
    "morpho_lending: {chain_name: 'Katana', token_symbol: 'AUSD', amount: 125.0, action: 'supply', market_id: '0x82c4C641CCc38719ae1f0FBd16A64808d838fDfD'}"
  ],
  "transactions": [
    "https://katana-explorer.vercel.app/tx/0x..."
  ],
  "memo": "Moved 25% AUSD (125 tokens) to Steakhouse Prime vault for 3.87% APY"
}
```

**Production Deployment:**
1. **API Subscription:** Users subscribe via `/strategies/subscribe` endpoint
2. **Task Scheduling:** System schedules daily execution based on strategy frequency
3. **Automated Execution:** Cron job or scheduler calls `/tasks` endpoint every 5 minutes
4. **Notifications:** Users receive Telegram notifications on execution results
```

**Step 9.6: Task Management Schema**

Ensure MongoDB task schema supports new strategy fields:

```javascript
// strategy_tasks collection document structure
{
  "_id": ObjectId,
  "user_address": "0x...",      // User's wallet
  "vault_address": "0x...",     // User's vault  
  "strategy_id": "katana_ausd_morpho_optimizer",
  "chain": "katana",            // Must match strategy chain
  "percentage": 25,             // 1-100
  "enabled": true,
  "created_at": ISODate,
  "updated_at": ISODate,
  "last_executed": ISODate,
  "next_run_time": ISODate,     // When to run next
  "execution_count": 5,
  "last_execution_memo": "Moved 25% AUSD to Steakhouse Prime vault",
  "last_execution_status": "success" // or "failed"
}
```

**Step 9.7: Testing Checklist for New Strategy**

- [ ] **Strategy Definition:** Strategy appears in `--list-strategies` output  
- [ ] **Yield Data:** Strategy shows correct APY in `/strategies` API endpoint
- [ ] **Direct Execution:** `--direct-only` test completes without errors
- [ ] **Task Creation:** Full workflow creates and executes task successfully  
- [ ] **AI Decision Making:** Assistant correctly identifies highest yield option
- [ ] **Protocol Tools:** Assistant can execute actions via protocol tools (e.g., morpho_lending)
- [ ] **Transaction Generation:** Valid transaction URLs are returned
- [ ] **Error Handling:** Graceful handling when vault has insufficient balance
- [ ] **Scheduling:** Next execution time calculated correctly based on frequency
- [ ] **Cross-Protocol:** Assistant compares yields across ALL available protocols

### 10. Production Deployment and Monitoring

**Automated Task Execution via Cron:**
```bash
# Execute due tasks every 5 minutes
*/5 * * * * curl -X GET "http://localhost:8000/tasks" > /dev/null 2>&1
```

**Manual Task Monitoring:**
```bash
# Check what tasks are due
python src/test_strategy_flow.py --check-due

# Check task execution history in MongoDB
use demether_db
db.strategy_tasks.find({"last_executed": {$exists: true}}).sort({"last_executed": -1}).limit(10)
```

**Strategy Performance Monitoring:**
- Monitor execution success rates via `last_execution_status` field
- Track yield improvements via `last_execution_memo` analysis  
- Set up alerts for failed strategy executions
- Monitor protocol yield spreads to validate strategy effectiveness

## Troubleshooting

**Common Issues:**
1. **Wrong decimals:** Token shows incorrect balance (too high/low by powers of 10)
2. **Wrong price:** USD values way off (check CoinGecko ID)
3. **Token not detected:** Check addresses and chain configuration
4. **Vault errors:** Verify factory deployment and permissions
5. **Strategy not executing:** Check `next_run_time` is in the past and strategy is `enabled: true`
6. **Zero yields in frontend:** Verify `/strategies` endpoint includes yields from all protocols
7. **Strategy execution failed:** Check AI has access to all required protocol tools
8. **Task not scheduled:** Verify strategy `chain` matches exactly with `CHAIN_CONFIG` key