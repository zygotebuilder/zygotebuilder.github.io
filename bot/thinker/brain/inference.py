from pathlib import Path

from .model import ZybotRNN


# inference.py and zybot-brain.json are in the same directory.

BRAIN_DIR = Path(__file__).resolve().parent

MODEL_FILE = BRAIN_DIR / "zybot-brain.json"


def load_brain():

    print(f"🧠 Looking for Zybot Brain at:")
    print(f"   {MODEL_FILE}")

    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            f"Zybot Brain has not been trained yet.\n"
            f"Expected model file: {MODEL_FILE}"
        )

    print("🧠 Loading Zybot Brain...")

    model = ZybotRNN.load(MODEL_FILE)

    print("🟢 Zybot Brain loaded.")

    return model


def think(prompt):

    model = load_brain()

    return model.generate(
        prompt,
        max_length=300,
        temperature=0.7
    )
