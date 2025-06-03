from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from assistant import run_chatbot
from eth_account.messages import encode_defunct
from web3 import Web3
from typing import Optional
from config import logger

app = FastAPI()

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

    # Run the chatbot with the user's message and include wallet address
    response = run_chatbot(request.message, chat_id=request.wallet_address)
    return {"response": response}

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=5050, reload=True)