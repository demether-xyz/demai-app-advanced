from typing import Dict, List, Optional, Any, TYPE_CHECKING, Union
from decimal import Decimal
import logging
import asyncio
from utils.coingecko_util import CoinGeckoUtil
from utils.mongo_util import MongoUtil
from config import SUPPORTED_TOKENS, RPC_ENDPOINTS, NATIVE_CURRENCIES, ERC20_ABI
from strategies.strategy_config import STRATEGY_BALANCE_CHECKERS

if TYPE_CHECKING:
    from web3 import Web3
    from pymongo.database import Database

logger = logging.getLogger(__name__)


class PortfolioService:
    """Service for fetching portfolio balances and calculating total value"""
    
    def __init__(self, db_or_mongo_util: Optional[Union["Database", MongoUtil]] = None):
        # Handle both database and MongoUtil for backward compatibility
        if db_or_mongo_util is not None and hasattr(db_or_mongo_util, 'db'):  # It's a MongoUtil
            self.mongo_util = db_or_mongo_util
            self.db = db_or_mongo_util.db
        else:  # It's a database directly or None
            self.mongo_util = None
            self.db = db_or_mongo_util
            
        self.coingecko = CoinGeckoUtil(self.mongo_util if self.mongo_util is not None else self.db)
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
    
    async def get_portfolio_summary(self, vault_address: str) -> Dict[str, Any]:
        """
        Get complete portfolio summary for a vault address including balances and USD values
        """
        if not self.Web3:
            return {
                "vault_address": vault_address,
                "total_value_usd": 0.0,
                "holdings": [],
                "chains_count": 0,
                "tokens_count": 0,
                "strategy_count": 0,
                "active_strategies": [],
                "error": "Web3 not available"
            }
            
        try:
            # Normalize vault address
            vault_address = self.Web3.to_checksum_address(vault_address)
            
            # Get balances for all tokens across all chains concurrently
            token_balances_task = self._get_all_token_balances(vault_address)
            eth_balances_task = self._get_native_balances(vault_address)
            strategy_balances_task = self._get_all_strategy_balances(vault_address)
            
            # Wait for all tasks to complete
            all_balances, eth_balances, strategy_balances = await asyncio.gather(
                token_balances_task,
                eth_balances_task,
                strategy_balances_task
            )
            
            # Combine all balances
            all_balances.extend(eth_balances)
            
            # Filter to only tokens with positive balances and valid coingecko IDs
            tokens_with_balances = [
                balance for balance in all_balances 
                if balance["coingeckoId"] and balance["balance"] > 0
            ]
            
            logger.info(f"Found {len(tokens_with_balances)} tokens with positive balances for vault {vault_address}")
            
            # Only get prices if we have tokens with balances
            prices = {}
            if tokens_with_balances:
                unique_coingecko_ids = list(set(
                    balance["coingeckoId"] for balance in tokens_with_balances
                ))
                logger.info(f"Getting prices for {len(unique_coingecko_ids)} unique tokens: {unique_coingecko_ids}")
                prices = await self._get_token_prices_async(unique_coingecko_ids)
            else:
                logger.info("No tokens with positive balances found, skipping price lookup")
            
            # Calculate USD values for regular holdings
            total_value = 0.0
            holdings = []
            
            for balance in tokens_with_balances:
                token_price = prices.get(balance["coingeckoId"], 0.0)
                usd_value = balance["balance"] * token_price
                total_value += usd_value
                
                holdings.append({
                    "symbol": balance["symbol"],
                    "name": balance["name"],
                    "chain_id": balance["chain_id"],
                    "balance": balance["balance"],
                    "price_usd": token_price,
                    "value_usd": usd_value,
                    "type": "token"
                })
            
            # Calculate USD values for strategy balances
            strategy_holdings = []
            strategy_tokens_with_prices = [
                balance for balance in strategy_balances 
                if balance["coingeckoId"] and balance["balance"] > 0
            ]
            
            for balance in strategy_tokens_with_prices:
                token_price = prices.get(balance["coingeckoId"], 0.0)
                usd_value = balance["balance"] * token_price
                total_value += usd_value
                
                strategy_holdings.append({
                    "symbol": balance["token_symbol"],
                    "name": balance["token_name"],
                    "chain_id": balance["chain_id"],
                    "balance": balance["balance"],
                    "price_usd": token_price,
                    "value_usd": usd_value,
                    "type": "strategy",
                    "strategy": balance["strategy"],
                    "protocol": balance["protocol"],
                    "strategy_type": balance["strategy_type"]
                })
            
            # Combine all holdings
            all_holdings = holdings + strategy_holdings
            
            # Sort holdings by USD value (highest first)
            all_holdings.sort(key=lambda x: x["value_usd"], reverse=True)
            
            # Count active strategies
            active_strategies = list(set(
                h["strategy"] for h in strategy_holdings
            ))
            
            return {
                "vault_address": vault_address,
                "total_value_usd": total_value,
                "holdings": all_holdings,
                "chains_count": len(set(h["chain_id"] for h in all_holdings)),
                "tokens_count": len(holdings),
                "strategy_count": len(strategy_holdings),
                "active_strategies": active_strategies
            }
            
        except Exception as e:
            logger.error(f"Error getting portfolio summary for vault {vault_address}: {e}")
            return {
                "vault_address": vault_address,
                "total_value_usd": 0.0,
                "holdings": [],
                "chains_count": 0,
                "tokens_count": 0,
                "strategy_count": 0,
                "active_strategies": [],
                "error": str(e)
            }
    
    async def _get_token_prices_async(self, coingecko_ids: List[str]) -> Dict[str, float]:
        """Async wrapper for getting token prices with proper event loop handling"""
        if not coingecko_ids:
            logger.info("No CoinGecko IDs provided, returning empty prices")
            return {}
            
        # Use the async version that properly handles the event loop and database
        return await self.coingecko.get_token_prices_async(coingecko_ids)
    
    async def _get_all_token_balances(self, vault_address: str) -> List[Dict[str, Any]]:
        """Get balances for all ERC20 tokens across all chains concurrently"""
        tasks = []
        
        for token_symbol, token_config in SUPPORTED_TOKENS.items():
            for chain_id, token_address in token_config["addresses"].items():
                if chain_id not in self.web3_instances:
                    logger.warning(f"Chain {chain_id} not available for token {token_symbol}")
                    continue
                    
                task = self._get_token_balance_async(
                    vault_address, token_address, chain_id, token_config
                )
                tasks.append((task, token_config, chain_id))
        
        logger.info(f"Checking balances for {len(tasks)} token/chain combinations")
        
        # Execute all balance checks concurrently
        results = await asyncio.gather(*[task for task, _, _ in tasks], return_exceptions=True)
        
        balances = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error getting balance: {result}")
                continue
                
            _, token_config, chain_id = tasks[i]
            balance = result
            
            # Always include balances (even zero) for proper tracking
            if balance is not None:
                balances.append({
                    "symbol": token_config["symbol"],
                    "name": token_config["name"],
                    "chain_id": chain_id,
                    "balance": balance,
                    "coingeckoId": token_config.get("coingeckoId")
                })
                logger.debug(f"{token_config['symbol']} on chain {chain_id}: {balance}")
        
        logger.info(f"Retrieved balances for {len(balances)} tokens")
        return balances
    
    async def _get_native_balances(self, vault_address: str) -> List[Dict[str, Any]]:
        """Get native currency (ETH) balances for all chains concurrently"""
        tasks = []
        
        for chain_id in self.web3_instances:
            if chain_id in NATIVE_CURRENCIES:
                native_config = NATIVE_CURRENCIES[chain_id]
                task = self._get_native_balance_async(vault_address, chain_id)
                tasks.append((task, native_config, chain_id))
        
        logger.info(f"Checking native balances for {len(tasks)} chains")
        
        # Execute all balance checks concurrently
        results = await asyncio.gather(*[task for task, _, _ in tasks], return_exceptions=True)
        
        balances = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Error getting native balance: {result}")
                continue
                
            _, native_config, chain_id = tasks[i]
            balance = result
            
            # Always include balances (even zero) for proper tracking
            if balance is not None:
                balances.append({
                    "symbol": native_config["symbol"],
                    "name": native_config["name"],
                    "chain_id": chain_id,
                    "balance": balance,
                    "coingeckoId": native_config.get("coingeckoId")
                })
                logger.debug(f"{native_config['symbol']} on chain {chain_id}: {balance}")
        
        logger.info(f"Retrieved native balances for {len(balances)} chains")
        return balances
    
    async def _get_all_strategy_balances(self, vault_address: str) -> List[Dict[str, Any]]:
        """Get balances for all strategies concurrently"""
        tasks = []
        
        # Create tasks for each strategy balance checker
        for strategy_name, balance_checker in STRATEGY_BALANCE_CHECKERS.items():
            task = balance_checker(self.web3_instances, vault_address, SUPPORTED_TOKENS)
            tasks.append((task, strategy_name))
        
        logger.info(f"Checking strategy balances for {len(tasks)} strategies")
        
        # Execute all strategy balance checks concurrently
        results = await asyncio.gather(*[task for task, _ in tasks], return_exceptions=True)
        
        all_strategy_balances = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                _, strategy_name = tasks[i]
                logger.error(f"Error getting {strategy_name} strategy balances: {result}")
                continue
                
            # Result should be a list of strategy balance dictionaries
            if isinstance(result, list):
                all_strategy_balances.extend(result)
                logger.info(f"Found {len(result)} strategy balances from {tasks[i][1]}")
        
        logger.info(f"Retrieved total of {len(all_strategy_balances)} strategy balances")
        return all_strategy_balances
    
    async def _get_token_balance_async(self, vault_address: str, token_address: str, chain_id: int, token_config: Dict) -> Optional[float]:
        """Get balance for a specific ERC20 token asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._get_token_balance,
            vault_address,
            token_address,
            chain_id,
            token_config
        )
    
    async def _get_native_balance_async(self, vault_address: str, chain_id: int) -> Optional[float]:
        """Get native currency balance (ETH) asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None,
            self._get_native_balance,
            vault_address,
            chain_id
        )
    
    def _get_token_balance(self, vault_address: str, token_address: str, chain_id: int, token_config: Dict) -> Optional[float]:
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
            balance_wei = contract.functions.balanceOf(vault_address).call()
            
            # Convert to human readable format
            decimals = token_config["decimals"]
            balance = float(balance_wei) / (10 ** decimals)
            
            return balance
            
        except Exception as e:
            logger.error(f"Error getting token balance for {token_config['symbol']} on chain {chain_id}: {e}")
            return None
    
    def _get_native_balance(self, vault_address: str, chain_id: int) -> Optional[float]:
        """Get native currency balance (ETH)"""
        try:
            w3 = self.web3_instances.get(chain_id)
            if not w3:
                return None
            
            balance_wei = w3.eth.get_balance(vault_address)
            balance_eth = float(balance_wei) / (10 ** 18)  # ETH has 18 decimals
            
            return balance_eth
            
        except Exception as e:
            logger.error(f"Error getting native balance on chain {chain_id}: {e}")
            return None