import os
from langchain_openai import ChatOpenAI
from langchain.schema import HumanMessage, SystemMessage, AIMessage
from langchain.memory import ConversationBufferWindowMemory
from langchain.chains import ConversationChain
from dotenv import load_dotenv
from utils.mongo_util import MongoUtil
from utils.prompt_utils import get_prompt
from config import logger

load_dotenv()

def get_system_prompt_data():
    """Get structured system prompt data"""
    return {
        "role": "demAI",
        "description": "Your DeFi co-pilot",
        "primary_function": "Help users find and analyze yield farming opportunities across different protocols",
        "objectives": [
            "Provide clear, actionable advice",
            "Keep investments safe and profitable",
            "Analyze DeFi protocols and opportunities"
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
        model="google/gemini-2.5-flash-preview-05-20",
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

def run_chatbot(message: str, chat_id: str) -> str:
    mongo = MongoUtil()
    try:
        mongo.connect()
        
        # Save the user message first
        mongo.save_message(chat_id, "User", message)
        
        chat_history = mongo.fetch_chat_history(chat_id)
        
        # Create structured system prompt
        system_prompt_data = get_system_prompt_data()
        system_prompt = get_prompt(system_prompt_data, "system_instructions")
        
        # Create messages for the conversation
        messages = [
            SystemMessage(content=system_prompt),
        ]
        
        # Add structured chat history if available
        logger.info(f"Chat history: {chat_history}")
        structured_history = format_chat_history_structured(chat_history)
        if structured_history:
            conversation_context = {
                "chat_id": chat_id,
                "total_messages": len(structured_history),
                "conversation_history": structured_history
            }
            history_prompt = get_prompt(conversation_context, "previous_conversation")
            messages.append(HumanMessage(content=history_prompt))
        
        # Add current message with structure
        current_query = {
            "type": "DeFi_query",
            "user_message": message,
            "chat_context": "active_conversation"
        }
        query_prompt = get_prompt(current_query, "current_query")
        messages.append(HumanMessage(content=query_prompt))
        
        # Get LLM and response
        llm = get_llm()
        response = llm(messages)
        
        # Save the AI response
        mongo.save_message(chat_id, "Assistant", response.content)
        
        return response.content
        
    except Exception as e:
        print(f"Error in chatbot: {e}")
        return "Sorry, I'm having trouble processing your request right now."
    finally:
        mongo.close() 