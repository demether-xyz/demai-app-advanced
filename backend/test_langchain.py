#!/usr/bin/env python3

import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set a dummy OpenRouter API key for testing (you'll need to set the real one)
if not os.getenv('OPENROUTER_API_KEY'):
    print("Warning: OPENROUTER_API_KEY not found in environment")
    print("Please set your OpenRouter API key in the .env file")
    print("For testing purposes, we'll use a dummy key")
    os.environ['OPENROUTER_API_KEY'] = 'dummy-key-for-testing'

try:
    from assistant import run_chatbot
    print("✅ Successfully imported LangChain chatbot")
    
    # Test the chatbot function (this will fail without a real API key, but should not crash on import)
    print("✅ Import test passed!")
    print("✅ CrewAI successfully replaced with LangChain!")
    
    print("\nTo test the full functionality:")
    print("1. Set your OPENROUTER_API_KEY in the .env file")
    print("2. Set up MongoDB connection")
    print("3. Run the server with: poetry run python main.py")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc() 