from pathlib import Path

from model import ZybotRNN


ROOT = Path(__file__).resolve().parents[2]

MODEL_FILE = (
    ROOT
    / "bot"
    / "thinker"
    / "brain"
    / "zybot-brain.json"
)


def load_brain():

    if not MODEL_FILE.exists():

        raise FileNotFoundError(
            "Zybot Brain has not been trained yet."
        )

    print("🧠 Loading Zybot Brain...")

    model = ZybotRNN.load(
        MODEL_FILE
    )

    print("🟢 Zybot Brain loaded.")

    return model


def think(prompt):

    model = load_brain()

    return model.generate(
        prompt,
        max_length=300,
        temperature=0.7
    )
