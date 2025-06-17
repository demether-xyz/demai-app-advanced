# Portfolio Service Implementation

## Overview

The portfolio service fetches real-time token balances from multiple blockchain networks and calculates USD values using CoinGecko prices with caching.

## Components

### 1. CoinGecko Utility (`utils/coingecko_util.py`)
- Fetches token prices from CoinGecko API
- Caches prices in MongoDB for 15 minutes
- Handles rate limiting and errors gracefully
- Supports batch price fetching

### 2. Portfolio Service (`utils/portfolio_service.py`)
- Connects to multiple blockchain networks (Ethereum, Arbitrum)
- Fetches ERC20 token balances using Web3
- Fetches native currency (ETH) balances
- Calculates total portfolio value in USD
- Supports all major DeFi tokens (WBTC, USDC, WETH, DAI, etc.)

### 3. API Endpoint (`main.py`)
- POST `/portfolio/` endpoint
- Accepts wallet address (authentication disabled for development)
- Returns complete portfolio summary with holdings breakdown

### 4. Frontend Integration (`src/services/demaiApi.ts` & `src/pages/index.tsx`)
- Fetches portfolio data when wallet connects
- Displays real-time portfolio value instead of hardcoded amounts
- Shows loading states and error handling

## Configuration

### RPC Endpoints
Configure blockchain RPC URLs via environment variables:
```bash
ETHEREUM_RPC_URL=https://eth.llamarpc.com
ARBITRUM_RPC_URL=https://arbitrum.llamarpc.com
```

### MongoDB
Set MongoDB connection string:
```bash
MONGODB_URI=mongodb://localhost:27017/demether
```

## Supported Networks & Tokens

### Networks
- Ethereum (Chain ID: 1)
- Arbitrum (Chain ID: 42161)

### Tokens
- WBTC, USDC, USDC.e, WETH, DAI, USDT
- LINK, UNI, AAVE, COMP, MKR, ARB
- Native ETH on all networks

## Testing

Run the test script to verify functionality:
```bash
cd backend
python test_portfolio.py
```

## Price Caching

- Prices are cached in MongoDB for 15 minutes
- Reduces API calls to CoinGecko
- Improves response times for repeated requests
- Handles cache misses gracefully

## Error Handling

- Network connectivity issues
- Invalid wallet addresses
- Missing token contracts
- API rate limits
- Database connection failures

## Usage

The system automatically activates when a user connects their wallet to the frontend. Portfolio data refreshes each time the page loads or when the wallet address changes.

Portfolio data includes:
- Total USD value across all chains
- Individual token holdings with balances and values
- Number of active chains and token positions
- Real-time price data with automatic caching