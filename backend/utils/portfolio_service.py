import os
from typing import Dict, List, Optional, Any, TYPE_CHECKING
from decimal import Decimal
import logging
from .coingecko_util import CoinGeckoUtil
from .mongo_util import MongoUtil

if TYPE_CHECKING:
    from web3 import Web3

logger = logging.getLogger(__name__)

# ERC20 ABI for balance calls
ERC20_ABI = [
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
]

# Token configuration matching frontend tokens.ts
SUPPORTED_TOKENS = {
    "WBTC": {
        "symbol": "WBTC",
        "name": "Wrapped Bitcoin",
        "decimals": 8,
        "addresses": {
            1: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",  # Ethereum
            42161: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f",  # Arbitrum
        },
        "coingeckoId": "wrapped-bitcoin",
    },
    "USDC": {
        "symbol": "USDC",
        "name": "USD Coin",
        "decimals": 6,
        "addresses": {
            1: "0xA0b86a33E6441b22fB1BCC9C6e47e85eF42cFbb5",  # Ethereum (USDC.e)
            42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",  # Arbitrum (native USDC)
        },
        "coingeckoId": "usd-coin",
    },
    "USDC.e": {
        "symbol": "USDC.e",
        "name": "Bridged USDC",
        "decimals": 6,
        "addresses": {
            42161: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",  # Arbitrum (bridged USDC)
        },
        "coingeckoId": "usd-coin",
    },
    "WETH": {
        "symbol": "WETH",
        "name": "Wrapped Ethereum",
        "decimals": 18,
        "addresses": {
            1: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",  # Ethereum
            42161: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",  # Arbitrum
        },
        "coingeckoId": "weth",
    },
    "DAI": {
        "symbol": "DAI",
        "name": "Dai Stablecoin",
        "decimals": 18,
        "addresses": {
            1: "0x6B175474E89094C44Da98b954EedeAC495271d0F",  # Ethereum
            42161: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",  # Arbitrum
        },
        "coingeckoId": "dai",
    },
    "USDT": {
        "symbol": "USDT",
        "name": "Tether USD",
        "decimals": 6,
        "addresses": {
            1: "0xdAC17F958D2ee523a2206206994597C13D831ec7",  # Ethereum
            42161: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",  # Arbitrum
        },
        "coingeckoId": "tether",
    },
    "LINK": {
        "symbol": "LINK",
        "name": "Chainlink",
        "decimals": 18,
        "addresses": {
            1: "0x514910771AF9Ca656af840dff83E8264EcF986CA",  # Ethereum
            42161: "0xf97f4df75117a78c1A5a0DBb814Af92458539FB4",  # Arbitrum
        },
        "coingeckoId": "chainlink",
    },
    "UNI": {
        "symbol": "UNI",
        "name": "Uniswap",
        "decimals": 18,
        "addresses": {
            1: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",  # Ethereum
            42161: "0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0",  # Arbitrum
        },
        "coingeckoId": "uniswap",
    },
    "AAVE": {
        "symbol": "AAVE",
        "name": "Aave",
        "decimals": 18,
        "addresses": {
            1: "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",  # Ethereum
            42161: "0xba5DdD1f9d7F570dc94a51479a000E3BCE967196",  # Arbitrum
        },
        "coingeckoId": "aave",
    },
    "ARB": {
        "symbol": "ARB",
        "name": "Arbitrum",
        "decimals": 18,
        "addresses": {
            42161: "0x912CE59144191C1204E64559FE8253a0e49E6548",  # Arbitrum native token
        },
        "coingeckoId": "arbitrum",
    },
}

# RPC endpoints configuration
RPC_ENDPOINTS = {
    1: os.getenv("ETHEREUM_RPC_URL", "https://eth.llamarpc.com"),  # Ethereum
    42161: os.getenv("ARBITRUM_RPC_URL", "https://arbitrum.llamarpc.com"),  # Arbitrum
}

# Native currencies for each chain (for ETH balance)
NATIVE_CURRENCIES = {
    1: {"symbol": "ETH", "name": "Ethereum", "decimals": 18, "coingeckoId": "ethereum"},
    42161: {"symbol": "ETH", "name": "Ethereum", "decimals": 18, "coingeckoId": "ethereum"},
}


class PortfolioService:
    """Service for fetching portfolio balances and calculating total value"""
    
    def __init__(self, mongo_util: Optional[MongoUtil] = None):
        self.mongo_util = mongo_util
        self.coingecko = CoinGeckoUtil(mongo_util)
        self.web3_instances = {}
        self.Web3 = None
        self._import_web3()
        self._initialize_web3_connections()
    
    def _import_web3(self):
        """Safely import web3 library"""
        try:
            from web3 import Web3
            self.Web3 = Web3
        except ImportError:
            logger.error("web3 package not available")
            self.Web3 = None
    
    def _initialize_web3_connections(self):
        """Initialize Web3 connections for all supported chains"""
        if not self.Web3:
            logger.error("Web3 not available - cannot initialize connections")
            return
            
        for chain_id, rpc_url in RPC_ENDPOINTS.items():
            try:
                w3 = self.Web3(self.Web3.HTTPProvider(rpc_url))
                if w3.is_connected():
                    self.web3_instances[chain_id] = w3
                    logger.info(f"Connected to chain {chain_id}")
                else:
                    logger.warning(f"Failed to connect to chain {chain_id}")
            except Exception as e:
                logger.error(f"Error connecting to chain {chain_id}: {e}")
    
    def get_portfolio_summary(self, wallet_address: str) -> Dict[str, Any]:
        """
        Get complete portfolio summary including balances and USD values
        """
        if not self.Web3:
            return {
                "wallet_address": wallet_address,
                "total_value_usd": 0.0,
                "holdings": [],
                "chains_count": 0,
                "tokens_count": 0,
                "error": "Web3 not available"
            }
            
        try:
            # Normalize wallet address
            wallet_address = self.Web3.to_checksum_address(wallet_address)
            
            # Get balances for all tokens across all chains
            all_balances = self._get_all_token_balances(wallet_address)
            
            # Get ETH balances
            eth_balances = self._get_native_balances(wallet_address)
            
            # Combine all balances
            all_balances.extend(eth_balances)
            
            # Get prices for all tokens
            unique_coingecko_ids = list(set(
                balance["coingeckoId"] for balance in all_balances 
                if balance["coingeckoId"] and balance["balance"] > 0
            ))
            
            prices = self.coingecko.get_token_prices(unique_coingecko_ids)
            
            # Calculate USD values
            total_value = 0.0
            holdings = []
            
            for balance in all_balances:
                if balance["balance"] > 0:
                    token_price = prices.get(balance["coingeckoId"], 0.0)
                    usd_value = balance["balance"] * token_price
                    total_value += usd_value
                    
                    holdings.append({
                        "symbol": balance["symbol"],
                        "name": balance["name"],
                        "chain_id": balance["chain_id"],
                        "balance": balance["balance"],
                        "price_usd": token_price,
                        "value_usd": usd_value
                    })
            
            # Sort holdings by USD value (highest first)
            holdings.sort(key=lambda x: x["value_usd"], reverse=True)
            
            return {
                "wallet_address": wallet_address,
                "total_value_usd": total_value,
                "holdings": holdings,
                "chains_count": len(set(h["chain_id"] for h in holdings)),
                "tokens_count": len(holdings)
            }
            
        except Exception as e:
            logger.error(f"Error getting portfolio summary for {wallet_address}: {e}")
            return {
                "wallet_address": wallet_address,
                "total_value_usd": 0.0,
                "holdings": [],
                "chains_count": 0,
                "tokens_count": 0,
                "error": str(e)
            }
    
    def _get_all_token_balances(self, wallet_address: str) -> List[Dict[str, Any]]:
        """Get balances for all ERC20 tokens across all chains"""
        balances = []
        
        for token_symbol, token_config in SUPPORTED_TOKENS.items():
            for chain_id, token_address in token_config["addresses"].items():
                if chain_id not in self.web3_instances:
                    continue
                    
                balance = self._get_token_balance(
                    wallet_address, token_address, chain_id, token_config
                )
                
                if balance is not None:
                    balances.append({
                        "symbol": token_config["symbol"],
                        "name": token_config["name"],
                        "chain_id": chain_id,
                        "balance": balance,
                        "coingeckoId": token_config.get("coingeckoId")
                    })
        
        return balances
    
    def _get_native_balances(self, wallet_address: str) -> List[Dict[str, Any]]:
        """Get native currency (ETH) balances for all chains"""
        balances = []
        
        for chain_id in self.web3_instances:
            if chain_id in NATIVE_CURRENCIES:
                native_config = NATIVE_CURRENCIES[chain_id]
                balance = self._get_native_balance(wallet_address, chain_id)
                
                if balance is not None:
                    balances.append({
                        "symbol": native_config["symbol"],
                        "name": native_config["name"],
                        "chain_id": chain_id,
                        "balance": balance,
                        "coingeckoId": native_config.get("coingeckoId")
                    })
        
        return balances
    
    def _get_token_balance(self, wallet_address: str, token_address: str, chain_id: int, token_config: Dict) -> Optional[float]:
        """Get balance for a specific ERC20 token"""
        try:
            w3 = self.web3_instances.get(chain_id)
            if not w3 or not self.Web3:
                return None
            
            # Create contract instance
            contract = w3.eth.contract(
                address=self.Web3.to_checksum_address(token_address),
                abi=ERC20_ABI
            )
            
            # Get balance
            balance_wei = contract.functions.balanceOf(wallet_address).call()
            
            # Convert to human readable format
            decimals = token_config["decimals"]
            balance = float(balance_wei) / (10 ** decimals)
            
            return balance
            
        except Exception as e:
            logger.error(f"Error getting token balance for {token_config['symbol']} on chain {chain_id}: {e}")
            return None
    
    def _get_native_balance(self, wallet_address: str, chain_id: int) -> Optional[float]:
        """Get native currency balance (ETH)"""
        try:
            w3 = self.web3_instances.get(chain_id)
            if not w3:
                return None
            
            balance_wei = w3.eth.get_balance(wallet_address)
            balance_eth = float(balance_wei) / (10 ** 18)  # ETH has 18 decimals
            
            return balance_eth
            
        except Exception as e:
            logger.error(f"Error getting native balance on chain {chain_id}: {e}")
            return None