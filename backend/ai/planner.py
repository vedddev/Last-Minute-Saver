import json

from groq import Groq

from config import Config
from ai.prompts import TASK_PLANNER_PROMPT

client = Groq(
    api_key=Config.GROQ_API_KEY
)


def generate_plan(user_prompt):

    prompt = f"""
{TASK_PLANNER_PROMPT}

User:

{user_prompt}
"""

    response = client.chat.completions.create(

        model="openai/gpt-oss-20b",

        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],

        temperature=0.2
    )

    output = response.choices[0].message.content

    try:

        return json.loads(output)

    except Exception:

        return {
            "tasks": [],
            "raw_output": output
        }