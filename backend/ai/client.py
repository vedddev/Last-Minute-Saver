from groq import Groq
from config import Config

client = Groq(
    api_key=Config.GROQ_API_KEY
)

MODEL = "openai/gpt-oss-20b"