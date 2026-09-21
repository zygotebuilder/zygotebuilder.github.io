from pathlib import Path
from llama_cpp import Llama
import json
import os


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

Analyze the supplied repository context.

Identify:

1. Interesting observations
2. Potential technical problems
3. Repeated patterns
4. Opportunities for improvement
5. Creative ideas for future experiments
6. Questions that should be brought to the human maintainer

Do not invent facts that are not present in the supplied context.

Separate observations from hypotheses and creative suggestions.

Return ONLY valid JSON using this structure:

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
        n_threads=max(1, (os.cpu_count() or 4) - 1),
        verbose=False
    )

    print("🟢 Local AI model loaded.")

    return model


def analyze(context):
    model = load_model()

    prompt = f"""
<|im_start|>system
{SYSTEM_PROMPT}
<|im_end|>

<|im_start|>user
Here is the current Zygote Builder repository context:

{context}
<|im_end|>

<|im_start|>assistant
"""

    print("\n🧠 Zybot is thinking...\n")

    result = model(
        prompt,
        max_tokens=700,
        temperature=0.3,
        stop=["<|im_end|>"]
    )

    text = result["choices"][0]["text"].strip()

    print("Raw AI response:")
    print(text)

    try:
        return json.loads(text)

    except json.JSONDecodeError:
        print("\n⚠️ AI did not return valid JSON.")
        return {
            "observations": [text],
            "potential_problems": [],
            "patterns": [],
            "creative_ideas": [],
            "questions_for_human": []
        }
