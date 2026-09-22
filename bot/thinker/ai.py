from pathlib import Path
import json
import re

from brain.inference import think


ROOT = Path(__file__).resolve().parents[2]


def extract_json(text):

    text = text.strip()

    text = re.sub(
        r"```json\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"```",
        "",
        text
    )

    start = text.find("{")
    end = text.rfind("}")

    if start != -1 and end != -1:

        candidate = text[start:end + 1]

        try:
            return json.loads(candidate)
        except json.JSONDecodeError:
            pass

    return None


def analyze(context):

    prompt = (
        "INPUT:\n"
        + context
        + "\n\n"
        + "OUTPUT:\n"
    )

    print("\n🧠 Zybot Brain is thinking...\n")

    raw = think(prompt)

    print("Raw Zybot response:")
    print(raw)

    result = extract_json(raw)

    if result is None:

        print(
            "\n⚠️ Zybot Brain produced "
            "unstructured output."
        )

        return {
            "observations": [
                raw
            ],
            "potential_problems": [],
            "patterns": [],
            "creative_ideas": [],
            "questions_for_human": []
        }

    return result
