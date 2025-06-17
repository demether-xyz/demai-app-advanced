#!/usr/bin/env python3

import os
import asyncio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

async def test_rpc_connection():
    """Test RPC connection to Arbitrum"""
    try:
        from web3 import Web3
        from config import RPC_ENDPOINTS
        
        arbitrum_rpc = RPC_ENDPOINTS[42161]
        print(f"🌐 Testing RPC connection to: {arbitrum_rpc}")
        
        w3 = Web3(Web3.HTTPProvider(arbitrum_rpc))
        
        if w3.is_connected():
            print("✅ RPC connection successful!")
            latest_block = w3.eth.block_number
            print(f"📦 Latest block: {latest_block}")
            return True
        else:
            print("❌ RPC connection failed!")
            return False
            
    except Exception as e:
        print(f"❌ RPC connection error: {e}")
        return False

async def test_portfolio_summary():
    """Test portfolio service with a sample vault address"""
    try:
        from utils.portfolio_service import PortfolioService
        
        # Test RPC connection first
        rpc_ok = await test_rpc_connection()
        if not rpc_ok:
            print("⚠️ RPC connection failed, portfolio test may not work properly")
        
        # Initialize portfolio service
        portfolio_service = PortfolioService()
        
        # Test with the specific vault address provided
        test_addresses = [
            "0xc182792CC8E638224006Ef01E4995c27411Cf0E2",  # Specific vault address to test
        ]
        
        for test_vault_address in test_addresses:
            print(f"\n🔍 Testing portfolio summary for vault: {test_vault_address}")
            
            # Get portfolio summary
            result = await portfolio_service.get_portfolio_summary(test_vault_address)
            
            print(f"✅ Portfolio summary completed!")
            print(f"📊 Total value: ${result['total_value_usd']:.6f}")
            print(f"🏦 Chains: {result['chains_count']}")
            print(f"🪙 Tokens: {result['tokens_count']}")
            
            if result['holdings']:
                print("\n💰 Holdings:")
                for holding in result['holdings']:
                    print(f"  • {holding['symbol']}: {holding['balance']:.6f} (${holding['value_usd']:.6f})")
            else:
                print("📭 No holdings found")
                
            if 'error' in result:
                print(f"⚠️ Error: {result['error']}")
                
        return result
        
    except Exception as e:
        print(f"❌ Portfolio test error: {e}")
        import traceback
        traceback.print_exc()
        return None


if __name__ == "__main__":
    # Run the portfolio test
    asyncio.run(test_portfolio_summary()) 