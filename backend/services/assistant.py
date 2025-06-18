import os
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from dotenv import load_dotenv
from utils.prompt_utils import get_prompt
from utils.json_parser import extract_json_content
from config import logger
from pancaik.core.config import get_config
from pancaik.utils.ai_router import get_agent_completion, create_langchain_tool, get_completion
import json

load_dotenv()

# Available window IDs from the frontend WireframeOverlay component
AVAILABLE_WINDOW_IDS = [
    'high-yield',
    'compound-eth', 
    'curve-3pool',
    'uniswap-v4',
    'portfolio',
    'staking-rewards',
    'yearn-vault',
    'balancer-pool',
    'convex-crv',
    'market-data',
    'sushiswap-farm',
    'maker-dai',
    'rocket-pool',
    'frax-share',
    'lido-steth',
    'gmx-glp',
    'pendle-yield',
    'tokemak-reactor',
    'olympus-ohm',
    'ribbon-vault',
    'risk-analysis',
    'alerts',
    'ai-strategy',
    'smart-contract-risk',
    'liquidation-alert',
    'impermanent-loss',
    'protocol-governance',
    'bridge-security',
    'oracle-manipulation',
    'regulatory-risk',
    'flash-loan-attack',
    'slippage-alert',
    'rug-pull-detector',
    'mev-protection',
    'whale-movement',
    'correlation-risk',
    'gas-optimization',
    'depegging-risk',
    'validator-risk',
    'insurance-coverage'
]

def get_system_prompt_data():
    """Get structured system prompt data"""
    return {
        "role": "demAI",
        "description": "Your DeFi co-pilot",
        "primary_function": "Help users find and analyze yield farming opportunities across different protocols",
        "objectives": [
            "Provide clear, actionable advice",
            "Keep investments safe and profitable",
            "Analyze DeFi protocols and opportunities",
            "Show the user the windows relevant to the user's query (if any), But don't open unless it's really relevant"
        ],
        "communication_style": {
            "format": "Chat interface responses",
            "tone": "Very short and concise like degen tweet",
            "style": "Monosyllabic, short sentences, few words",
            "exceptions": "Unless sharing detailed results",
            "formatting": "No link references or citations (e.g. don't add [1])",
            "focus": "Brief and actionable for DeFi needs"
        }
    }

def get_llm():
    """Initialize LLM with proper error handling"""
    openrouter_key = os.getenv('OPENROUTER_API_KEY')
    if not openrouter_key:
        raise ValueError("OPENROUTER_API_KEY environment variable not set")
    
    # Set up environment variable for OpenRouter
    os.environ["OPENAI_API_KEY"] = openrouter_key
    
    return ChatOpenAI(
        model="google/gemini-2.5-flash-preview-05-20:thinking",
        base_url="https://openrouter.ai/api/v1",
        temperature=0.7
    )

async def _fetch_chat_history(db, chat_id: str):
    """Fetch chat history for a given chat_id from database"""
    if db is None:
        logger.error("Database connection not established.")
        return []
    
    logger.info(f"Fetching history for chat_id: {chat_id}")
    try:
        # Database is async Motor, use await for database operations
        cursor = db.messages.find({"chat_id": chat_id}).sort("timestamp").limit(10)
        history = await cursor.to_list(length=10)
        return history
    except Exception as e:
        logger.error(f"Error fetching chat history: {e}")
        return []

async def _save_message(db, chat_id: str, sender: str, content: str):
    """Save a message to the chat history in database"""
    if db is None:
        logger.error("Database connection not established.")
        return False
    
    try:
        from datetime import datetime
        message_doc = {
            "chat_id": chat_id,
            "sender": sender,
            "content": content,
            "timestamp": datetime.utcnow()
        }
        # Database is async Motor, use await for database operations
        result = await db.messages.insert_one(message_doc)
        logger.info(f"Message saved with ID: {result.inserted_id}")
        return True
    except Exception as e:
        logger.error(f"Error saving message: {e}")
        return False

async def _save_conversation_pair(db, chat_id: str, user_message: str, ai_response: str):
    """Save both user message and AI response in one database operation"""
    if db is None:
        logger.error("Database connection not established.")
        return False
    
    try:
        from datetime import datetime
        now = datetime.utcnow()
        
        # Create both message documents
        messages = [
            {
                "chat_id": chat_id,
                "sender": "User",
                "content": user_message,
                "timestamp": now
            },
            {
                "chat_id": chat_id,
                "sender": "Assistant", 
                "content": ai_response,
                "timestamp": now
            }
        ]
        
        # Insert both messages in one operation
        result = await db.messages.insert_many(messages)
        logger.info(f"Conversation pair saved with IDs: {result.inserted_ids}")
        return True
    except Exception as e:
        logger.error(f"Error saving conversation pair: {e}")
        return False

def format_chat_history_structured(chat_history):
    """Format MongoDB chat history as structured data"""
    if not chat_history:
        return None
    
    formatted_messages = []
    for i, msg in enumerate(chat_history, 1):
        formatted_messages.append({
            "message_number": i,
            "sender": msg.get('sender', 'User'),
            "content": msg.get('content', ''),
            "timestamp": msg.get('timestamp', 'N/A')
        })
    
    return formatted_messages

def get_aave_usdc_yield(network: str = "ethereum") -> str:
    """Get current AAVE lending yield for USDC. This is a dummy implementation.
    
    Args:
        network: The network to check (ethereum, polygon, arbitrum, etc.)
        
    Returns:
        A string describing the current AAVE USDC yield
    """
    # Dummy yield data - in real implementation this would call AAVE API
    yield_data = {
        "ethereum": "3.42% APY",
        "polygon": "4.18% APY", 
        "arbitrum": "3.95% APY",
        "avalanche": "3.78% APY",
        "optimism": "3.63% APY"
    }
    
    # Get yield for network or default
    apy = yield_data.get(network.lower(), "3.50% APY")
    result = f"AAVE USDC lending yield on {network}: {apy}"
    
    logger.info(f"AAVE USDC yield requested for {network}: {apy}")
    return result

# Create LangChain tool from the AAVE yield function
aave_yield_tool = create_langchain_tool(
    get_aave_usdc_yield,
    description="Get current AAVE lending yield for USDC on various networks"
)

async def run_chatbot(message: str, chat_id: str, available_windows: list = None, vault_address: str = None) -> str:
    """Run chatbot with window opening capabilities using AI router agent mode"""
    try:
        # Get database from pancaik config
        db = get_config("db")
        if db is None:
            logger.error("Database not initialized")
            return json.dumps({"text": "Sorry, I'm having trouble accessing the database right now."})
        
        # Initialize portfolio service if vault address is provided
        portfolio_llm_data = None
        formatted_portfolio = None
        if vault_address and db is not None:
            try:
                from services.portfolio_service import PortfolioService
                portfolio_service = PortfolioService(db)
                portfolio_llm_data = await portfolio_service.get_portfolio_for_llm(vault_address)
                logger.info(f"Retrieved portfolio data for vault {vault_address}: {portfolio_llm_data.get('total_value_usd', 0)} USD")
            except Exception as e:
                logger.error(f"Error getting portfolio data for vault {vault_address}: {e}")
                portfolio_llm_data = None
                formatted_portfolio = None
        
        # Fetch chat history (we'll save messages at the end)
        chat_history = await _fetch_chat_history(db, chat_id)
        
        # Use hardcoded windows or fallback to provided ones
        windows_to_use = AVAILABLE_WINDOW_IDS
        
        # Create output format with available windows
        output_format = """
OUTPUT IN JSON: Strict JSON format, no additional text.
  "text": "Your response text here",
  "windows": ["window_id_1", "window_id_2"]

Available window IDs to open: """ + ", ".join(windows_to_use) + """
Include "windows" field as an array of window IDs if you want to open specific windows from the available list.
You can open multiple windows at once to show related information.
"""

        # Create structured prompt data
        prompt_data = {
            "task": "Respond to user query about DeFi yield optimization and decide if any window should be opened",
            "user_message": message,
            "portfolio_summary": portfolio_llm_data,
            "context": {
                "available_windows": windows_to_use,
                "system": "demAI - DeFi yield optimization assistant",
                "capabilities": "portfolio analysis, yield optimization, risk assessment, strategy recommendations",
                "chat_history": format_chat_history_structured(chat_history),
            },
            "output_format": output_format,
        }

        # Create structured system prompt
        system_prompt_data = get_system_prompt_data()
        system_prompt = get_prompt(system_prompt_data, "system_instructions")
        
        # Create the main prompt using get_prompt with structured data
        prompt = get_prompt(prompt_data, "defi_query_with_windows")
        
        # Add chat history context to the prompt if available
        structured_history = format_chat_history_structured(chat_history)
        if structured_history:
            conversation_context = {
                "chat_id": chat_id,
                "total_messages": len(structured_history),
                "conversation_history": structured_history
            }
            history_context = get_prompt(conversation_context, "previous_conversation")
            prompt = f"{history_context}\n\n{prompt}"
        
        # Create system message with tool instructions (following pipedrive_agent pattern)
        system_message = f"""{system_prompt}

AVAILABLE TOOLS:
- get_aave_usdc_yield: Get current AAVE lending yield for USDC on various networks (ethereum, polygon, arbitrum, avalanche, optimism)

Use the available tools to help answer user questions about DeFi yields when relevant."""
        
        # Use agent mode with tools (following pipedrive_agent pattern)
        response = await get_completion(
            prompt=prompt,
            model_id="google/gemini-2.5-flash-preview-05-20:thinking",
            agent_mode=True,
            tools=[aave_yield_tool],
            system_message=system_message,
            use_openrouter=True,
            temperature=0.7,
            verbose=True
        )
        
        # Extract final output from agent response (following pipedrive_agent pattern)
        final_output = response.get("final_output", "Sorry, I couldn't process your request.")
        
        # Try to parse as JSON for DeFi queries, otherwise return as plain text
        parsed_response = extract_json_content(final_output)
        
        if parsed_response and "text" in parsed_response:
            # Valid JSON response with expected structure
            ai_text = parsed_response.get("text", final_output)
            # Save both user message and AI response in one operation
            await _save_conversation_pair(db, chat_id, message, ai_text)
            return json.dumps(parsed_response)
        else:
            # Fallback: wrap response in expected JSON format
            # Save both user message and AI response in one operation
            await _save_conversation_pair(db, chat_id, message, final_output)
            return json.dumps({"text": final_output})
        
    except Exception as e:
        logger.error(f"Error in chatbot: {e}")
        error_response = "Sorry, I'm having trouble processing your request right now."
        return json.dumps({"text": error_response}) 