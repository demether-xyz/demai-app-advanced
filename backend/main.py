from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from assistant import run_chatbot
from eth_account.messages import encode_defunct
from web3 import Web3
from typing import Optional
from config import logger
from portfolio_service import PortfolioService
from setup import setup
from contextlib import asynccontextmanager
from pancaik.core.config import get_config

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup logic here
    await setup(app)
    yield
    # Shutdown logic here
    db = get_config("db")
    if db is not None:
        # Get the client instance from the database
        client = db.client
        client.close()

app = FastAPI(lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Actual frontend port
        "http://localhost:3001",  # Backup port
        "http://localhost:3010",  # Original expected port
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str
    wallet_address: str
    signature: str
    auth_message: str

class PortfolioRequest(BaseModel):
    vault_address: str
    signature: str
    auth_message: str

def verify_signature(message: str, signature: str, address: str) -> bool:
    try:
        w3 = Web3()
        message_hash = encode_defunct(text=message)
        recovered_address = w3.eth.account.recover_message(message_hash, signature=signature)
        return recovered_address.lower() == address.lower()
    except Exception:
        return False

@app.get("/")
async def read_root():
    return {"Hello": "World"}

@app.post("/chat/")
async def chat_endpoint(request: ChatRequest):
    # TODO: Re-enable authentication for production
    # Verify the signature
    # is_valid = verify_signature(
    #     message=request.auth_message,
    #     signature=request.signature,
    #     address=request.wallet_address
    # )
    # 
    # if not is_valid:
    #     raise HTTPException(status_code=401, detail="Invalid signature or wallet address")

    # Run the chatbot with the user's message and wallet address
    # The assistant.py has hardcoded window list, no need to pass from frontend
    response = await run_chatbot(
        message=request.message, 
        chat_id=request.wallet_address
    )
    return {"response": response}

@app.post("/portfolio/")
async def portfolio_endpoint(request: PortfolioRequest):
    """Get portfolio summary for a vault address"""
    # TODO: Re-enable authentication for production
    # Verify the signature
    # is_valid = verify_signature(
    #     message=request.auth_message,
    #     signature=request.signature,
    #     address=request.vault_address
    # )
    # 
    # if not is_valid:
    #     raise HTTPException(status_code=401, detail="Invalid signature or vault address")
    
    try:
        # Get database from pancaik config
        db = get_config("db")
        if db is None:
            raise HTTPException(status_code=500, detail="Database not initialized")
        
        # Initialize portfolio service with pancaik database
        portfolio_service = PortfolioService(db)
        
        # Get portfolio summary for the vault address
        portfolio_data = await portfolio_service.get_portfolio_summary(request.vault_address)
        
        return portfolio_data
        
    except Exception as e:
        logger.error(f"Error getting portfolio for vault {request.vault_address}: {e}")
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=5050, reload=True)