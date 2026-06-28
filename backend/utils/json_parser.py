import json
import re


def parse_llm_json(text):

    if not text:
        raise ValueError("LLM returned empty response.")

    text = text.strip()

    # Remove ```json
    text = re.sub(r"^```json", "", text)

    # Remove ```
    text = re.sub(r"```$", "", text)

    text = text.strip()

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1:
        text = text[start:end + 1]

    return json.loads(text)