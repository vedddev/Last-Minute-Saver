from ai.client import client, MODEL
from ai.prompts import CHAT_PROMPT


def ask_chat(tasks, message):

    context = ""

    for t in tasks:

        context += f"""

Title: {t.title}

Deadline: {t.deadline}

Priority: {t.priority}

Status: {t.status}

"""

    prompt = f"""

Tasks

{context}

User Question

{message}

"""

    response = client.chat.completions.create(

        model=MODEL,

        messages=[

            {

                "role":"system",

                "content":CHAT_PROMPT

            },

            {

                "role":"user",

                "content":prompt

            }

        ]

    )

    return response.choices[0].message.content