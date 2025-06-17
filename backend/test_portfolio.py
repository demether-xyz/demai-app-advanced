#!/usr/bin/env python3
"""
Test script for portfolio service
Run this to test the portfolio functionality before using it in the main app
"""

import asyncio
from utils.mongo_util import MongoUtil
from utils.portfolio_service import PortfolioService
from utils.coingecko_util import CoinGeckoUtil

async def test_coingecko_prices():
    """Test CoinGecko price fetching"""
    print("Testing CoinGecko price fetching...")
    
    # Initialize MongoDB (optional for price testing)
    mongo = MongoUtil()
    try:
        mongo.connect()
        print("✓ MongoDB connected")
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        print("  Continuing without MongoDB (prices won't be cached)")
        mongo = None
    
    # Test price fetching
    coingecko = CoinGeckoUtil(mongo)
    test_tokens = ["ethereum", "bitcoin", "usd-coin", "chainlink"]
    
    try:
        prices = coingecko.get_token_prices(test_tokens)
        print(f"✓ Successfully fetched prices: {prices}")
        
        if mongo:
            # Test cached prices
            cached_prices = coingecko.get_token_prices(test_tokens)
            print(f"✓ Successfully fetched cached prices: {cached_prices}")
        
    except Exception as e:
        print(f"✗ Error fetching prices: {e}")
    
    if mongo:
        mongo.close()

async def test_portfolio_service():
    """Test portfolio service with a sample wallet"""
    print("\nTesting Portfolio Service...")
    
    # Use Vitalik's wallet as test (it should have some tokens)
    test_wallet = "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045"
    
    # Initialize MongoDB
    mongo = MongoUtil()
    try:
        mongo.connect()
        print("✓ MongoDB connected")
    except Exception as e:
        print(f"✗ MongoDB connection failed: {e}")
        print("  Continuing without MongoDB")
        mongo = None
    
    # Initialize portfolio service
    portfolio_service = PortfolioService(mongo)
    
    try:
        # Test portfolio summary
        result = portfolio_service.get_portfolio_summary(test_wallet)
        print(f"✓ Portfolio service working!")
        print(f"  Wallet: {result.get('wallet_address', 'Unknown')}")
        print(f"  Total Value: ${result.get('total_value_usd', 0):,.2f}")
        print(f"  Chains: {result.get('chains_count', 0)}")
        print(f"  Tokens: {result.get('tokens_count', 0)}")
        
        if result.get('holdings'):
            print("  Top holdings:")
            for holding in result['holdings'][:5]:  # Show top 5
                print(f"    {holding['symbol']}: {holding['balance']:.4f} (${holding['value_usd']:.2f})")
        
        if result.get('error'):
            print(f"  Warning: {result['error']}")
            
    except Exception as e:
        print(f"✗ Error testing portfolio service: {e}")
    
    if mongo:
        mongo.close()

async def main():
    """Run all tests"""
    print("=== Portfolio Service Test Suite ===\n")
    
    await test_coingecko_prices()
    await test_portfolio_service()
    
    print("\n=== Test completed ===")

if __name__ == "__main__":
    asyncio.run(main())