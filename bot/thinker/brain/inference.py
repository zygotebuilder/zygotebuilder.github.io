from pathlib import Path

from .model import ZybotRNN


BRAIN_DIR = Path(__file__).resolve().parent
MODEL_FILE = BRAIN_DIR / "zybot-brain.json"


def load_brain():
    if not MODEL_FILE.exists():
        raise FileNotFoundError(
            "Zybot's brain has not been trained yet.\n"
            f"Expected model file: {MODEL_FILE}\n"
            "Run the training module first."
        )

    return ZybotRNN.load(MODEL_FILE)


def think(prompt):
    """
    Return a generated continuation for the supplied prompt.

    This function uses the local character-level RNN. It does not
    call an external model or API.
    """

    if not isinstance(prompt, str) or not prompt.strip():
        return ""

    model = load_brain()

    return model.generate(
        prompt=prompt.strip(),
        max_length=300,
        temperature=0.25,
        seed=42,
    )


if __name__ == "__main__":
    example = (
        "The evidence is insufficient to determine the cause."
    )
    print(think(example))
