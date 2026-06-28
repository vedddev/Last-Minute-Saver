import json

from ai.client import client, MODEL
from ai.prompts import COACH_PROMPT


def generate_coach(tasks):

    task_text = ""

    for t in tasks:

        task_text += f"""
Title: {t.title}
Deadline: {t.deadline}
Priority: {t.priority}
Estimated: {t.estimated_time} minutes
Status: {t.status}

"""

    response = client.chat.completions.create(

        model=MODEL,

        messages=[

            {
                "role":"system",
                "content":COACH_PROMPT
            },

            {
                "role":"user",
                "content":task_text
            }

        ],

        temperature=0.4

    )

    return json.loads(
        response.choices[0].message.content
    )