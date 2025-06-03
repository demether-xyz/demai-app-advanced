import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

class MongoUtil:
    def __init__(self):
        # TODO: Load MongoDB connection string from environment variables
        self.client = None
        self.db = None

    def connect(self):
        mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/demether")
        if not mongo_uri:
            raise ValueError("MONGODB_URI environment variable not set")
        try:
            self.client = MongoClient(mongo_uri)
            # The database is typically specified in the connection URI
            self.db = self.client.get_database() # get_database() without a name gets the database specified in the URI
            print("MongoDB connected successfully!")
        except Exception as e:
            print(f"Error connecting to MongoDB: {e}")
            self.client = None
            self.db = None

    def close(self):
        if self.client:
            self.client.close()
            print("MongoDB connection closed.")

    def fetch_chat_history(self, chat_id: str):
        if self.db is None:
            print("MongoDB connection not established.")
            return []
        print(f"Fetching history for chat_id: {chat_id}")
        # Assuming a 'messages' collection with documents having a 'chat_id' field
        # and sorted by a 'timestamp' field.
        try:
            history = list(self.db.messages.find({"chat_id": chat_id}).sort("timestamp").limit(10))
            # You might want to format the history for the agent here
            # For example, joining messages into a single string:
            # formatted_history = "\n".join([f"{msg.get('sender', 'User')}: {msg.get('content', '')}" for msg in history])
            # return formatted_history
            return history # Returning raw documents for now
        except Exception as e:
            print(f"Error fetching chat history: {e}")
            return []

    def save_message(self, chat_id: str, sender: str, content: str):
        """Save a message to the chat history"""
        if self.db is None:
            print("MongoDB connection not established.")
            return False
        
        try:
            message_doc = {
                "chat_id": chat_id,
                "sender": sender,
                "content": content,
                "timestamp": datetime.utcnow()
            }
            result = self.db.messages.insert_one(message_doc)
            print(f"Message saved with ID: {result.inserted_id}")
            return True
        except Exception as e:
            print(f"Error saving message: {e}")
            return False

# Example usage (optional - can remove later)
# if __name__ == "__main__":
#     mongo = MongoUtil()
#     mongo.connect()
#     history = mongo.fetch_chat_history("test_chat_123")
#     print(history)
#     mongo.close() 