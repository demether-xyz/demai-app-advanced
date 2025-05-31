import os
from crewai import Agent, Task, Crew, Process, LLM
from dotenv import load_dotenv
from utils.mongo_util import MongoUtil

load_dotenv()

# Define your agents with roles and goals
chatbot_agent = Agent(
    role='demAI',
    goal='',
    verbose=True,
    memory=True,
    backstory=(
        "I am demAI, your DeFi co-pilot. I help you find and analyze yield farming opportunities "
        "across different protocols. I provide clear, actionable advice while keeping your "
        "investments safe and profitable. You are on chat, use very short and concise responses, like on degen tweet, monosyllabic, short sentences, few words unless sharing a result"
        "don't provide link references, just provide the text as you are in chat, e.g. don't add the [1]"
    ),
    llm=LLM(
        model="openrouter/google/gemini-2.5-flash-preview-05-20",
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv('OPENROUTER_API_KEY')
    ),
    # You can add tools here if your chatbot needs to interact with external services
    # tools=[]
)

# Define tasks for your agents
chat_task = Task(
    description=(
        "Respond to DeFi query: {message}\n"
        "Previous conversation: {chat_history}\n"
        "Keep responses brief and actionable."
    ),
    expected_output='A concise, practical response addressing the user\'s DeFi needs.',
    agent=chatbot_agent,
)

# Instantiate your crew
chatbot_crew = Crew(
    agents=[chatbot_agent],
    tasks=[chat_task],
    process=Process.sequential,
)

def run_chatbot(message: str, chat_id: str) -> str:
    mongo = MongoUtil()
    try:
        mongo.connect()
        chat_history = mongo.fetch_chat_history(chat_id)

        inputs = {
            "message": message,
            "chat_history": chat_history
        }
        result = chatbot_crew.kickoff(inputs=inputs)
        return str(result)
    finally:
        mongo.close() 