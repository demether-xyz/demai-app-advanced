import os
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from dotenv import load_dotenv
from utils.mongo_util import MongoUtil
from utils.prompt_utils import get_prompt
from utils.json_parser import extract_json_content
from config import logger
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

def run_chatbot(message: str, chat_id: str, available_windows: list = None) -> str:
    """Run chatbot with window opening capabilities"""
    mongo = MongoUtil()
    try:
        mongo.connect()
        
        # Save the user message first
        mongo.save_message(chat_id, "User", message)
        
        chat_history = mongo.fetch_chat_history(chat_id)
        
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
            "available_windows": windows_to_use,
            "context": {
                "system": "demAI - DeFi yield optimization assistant",
                "capabilities": "portfolio analysis, yield optimization, risk assessment, strategy recommendations",
                "chat_history": format_chat_history_structured(chat_history)
            },
            "output_format": output_format,
        }

        # Create structured system prompt
        system_prompt_data = get_system_prompt_data()
        system_prompt = get_prompt(system_prompt_data, "system_instructions")
        
        # Create messages for the conversation
        messages = [
            SystemMessage(content=system_prompt),
        ]
        
        # Add structured chat history if available
        structured_history = format_chat_history_structured(chat_history)
        if structured_history:
            conversation_context = {
                "chat_id": chat_id,
                "total_messages": len(structured_history),
                "conversation_history": structured_history
            }
            history_prompt = get_prompt(conversation_context, "previous_conversation")
            messages.append(HumanMessage(content=history_prompt))
        
        # Add current message with structure including window capabilities
        current_query_prompt = get_prompt(prompt_data, "defi_query_with_windows")
        messages.append(HumanMessage(content=current_query_prompt))
        
        # Get LLM and response
        llm = get_llm()
        response = llm(messages)
        
        # Use the robust JSON parser utility
        parsed_response = extract_json_content(response.content)
        
        if parsed_response and "text" in parsed_response:
            # Valid JSON response with expected structure
            ai_text = parsed_response.get("text", response.content)
            mongo.save_message(chat_id, "Assistant", ai_text)
            return json.dumps(parsed_response)  # Return the parsed JSON
        else:
            # Fallback: wrap response in expected JSON format
            mongo.save_message(chat_id, "Assistant", response.content)
            return json.dumps({"text": response.content})
        
    except Exception as e:
        print(f"Error in chatbot: {e}")
        error_response = "Sorry, I'm having trouble processing your request right now."
        return json.dumps({"text": error_response})
    finally:
        mongo.close() 