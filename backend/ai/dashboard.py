import json

from ai.client import client, MODEL
from ai.prompts import DASHBOARD_PROMPT
from utils.json_parser import parse_llm_json


def generate_dashboard(tasks):

    context = ""

    completed = 0
    pending = 0

    for t in tasks:

        if t.status == "Completed":
            completed += 1
        else:
            pending += 1

        context += f"""
Title: {t.title}
Deadline: {t.deadline}
Priority: {t.priority}
Status: {t.status}
Estimated Time: {t.estimated_time}
"""

    prompt = f"""
Completed Tasks: {completed}

Pending Tasks: {pending}

Task List:

{context}
"""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": DASHBOARD_PROMPT
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.3
    )

    content = response.choices[0].message.content

    print("=" * 60)
    print("RAW GROQ RESPONSE")
    print(content)
    print("=" * 60)

    try:
        result = parse_llm_json(content)

    except Exception as e:

        print("JSON ERROR:", e)

        return {
            "productivity_score": 0,
            "today_focus": "Unknown",
            "motivation": "Unable to generate dashboard.",
            "high_risk": [],
            "summary": content,      # show raw model output
            "completed": completed,
            "pending": pending
        }

    result["completed"] = completed
    result["pending"] = pending

    return result