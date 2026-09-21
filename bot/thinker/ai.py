from pathlib import Path
from llama_cpp import Llama
import json
import os
import re


ROOT = Path(__file__).resolve().parents[2]

MODEL_DIR = ROOT / "bot" / "thinker" / "model"
MODEL_FILE = MODEL_DIR / "Qwen3-0.6B-Q4_0.gguf"


SYSTEM_PROMPT = """
You are Zybot, the Resident Laboratory Assistant of Zygote Builder.

Zygote Builder is a collection of interactive experiments, simulations,
games, thought experiments and creative web projects.

Your role is to OBSERVE and THINK.

You do not own the repository.
You do not make final decisions.
You do not modify files.
You do not merge pull requests.

Analyze ONLY the information supplied in the repository context.

IMPORTANT:
- Do not invent files, commits, changes, statistics, or events.
- Do not assume that a number of changed lines equals a number of files.
- If the supplied evidence is insufficient, explicitly say so.
- Distinguish confirmed observations from hypotheses.
- Do not claim that something happened unless the context supports it.

Identify:

1. Interesting observations
2. Potential technical problems
3. Repeated patterns
4. Opportunities for improvement
5. Creative ideas for future experiments
6. Questions that should be brought to the human maintainer

Return ONLY valid JSON.

Do NOT use Markdown.
Do NOT use ```json.
Do NOT include <think> tags.
Do NOT include explanations before or after the JSON.

Use exactly this structure:

{
  "observations": [],
  "potential_problems": [],
  "patterns": [],
  "creative_ideas": [],
  "questions_for_human": []
}
"""


def load_model():

    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            f"Zybot AI model not found: {MODEL_FILE}"
        )

    print("🧠 Loading Zybot local AI model...")

    model = Llama(
        model_path=str(MODEL_FILE),
        n_ctx=4096,
        n_threads=max(
            1,
            (os.cpu_count() or 4) - 1
        ),
        verbose=False
    )

    print("🟢 Local AI model loaded.")

    return model


def clean_response(text):

    text = text.strip()

    # Remove model reasoning section.
    text = re.sub(
        r"<think>.*?</think>",
        "",
        text,
        flags=re.DOTALL | re.IGNORECASE
    ).strip()

    # Remove Markdown JSON fences.
    text = re.sub(
        r"^```json\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"\s*```$",
        "",
        text
    )

    return text.strip()


def extract_json(text):

    cleaned = clean_response(text)

    try:
        return json.loads(cleaned)

    except json.JSONDecodeError:
        pass

    # Try extracting the first complete JSON object.
    start = cleaned.find("{")
    end = cleaned.rfind("}")

    if start != -1 and end != -1 and end > start:

        candidate = cleaned[start:end + 1]

        try:
            return json.loads(candidate)

        except json.JSONDecodeError:
            pass

    return None


def analyze(context):

    model = load_model()

    prompt = f"""
<|im_start|>system
{SYSTEM_PROMPT}
<|im_end|>

<|im_start|>user
Here is the current Zygote Builder repository context:

{context}

Analyze this evidence carefully.
Remember: absence of evidence is not evidence of an event.
<|im_end|>

<|im_start|>assistant
"""

    print("\n🧠 Zybot is thinking...\n")

    result = model(
        prompt,
        max_tokens=900,
        temperature=0.2,
        stop=["<|im_end|>"]
    )

    raw_text = result["choices"][0]["text"].strip()

    print("Raw AI response:")
    print(raw_text)

    analysis = extract_json(raw_text)

    if analysis is None:

        print(
            "\n⚠️ AI response could not be parsed as JSON."
        )

        return {
            "observations": [
                "AI generated an unstructured response."
            ],
            "potential_problems": [],
            "patterns": [],
            "creative_ideas": [],
            "questions_for_human": []
        }

    return analysis
