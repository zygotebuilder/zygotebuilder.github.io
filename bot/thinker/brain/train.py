from pathlib import Path
import json

from .model import ZybotRNN


# train.py is located at:
#
# repository/
# └── bot/
#     └── thinker/
#         └── brain/
#             └── train.py
#
# Therefore parents[3] is the repository root.

ROOT = Path(__file__).resolve().parents[3]

DATA_FILE = (
    ROOT
    / "bot"
    / "thinker"
    / "brain"
    / "training_data.json"
)

MODEL_FILE = (
    ROOT
    / "bot"
    / "thinker"
    / "brain"
    / "zybot-brain.json"
)


def load_training_data():

    with open(
        DATA_FILE,
        "r",
        encoding="utf-8"
    ) as file:

        return json.load(file)


def build_corpus(records):

    texts = []

    for record in records:

        texts.append(
            "INPUT: "
            + record["input"]
            + "\nOUTPUT: "
            + record["output"]
        )

    return "\n\n".join(texts)


def main():

    print("=" * 65)
    print("🧠 ZYBOT BRAIN — TRAINING")
    print("=" * 65)

    records = load_training_data()

    corpus = build_corpus(records)

    vocabulary = sorted(set(corpus))

    print(f"Training examples: {len(records)}")
    print(f"Corpus characters: {len(corpus)}")
    print(f"Vocabulary size: {len(vocabulary)}")

    model = ZybotRNN(
        vocab=vocabulary,
        hidden_size=64,
        learning_rate=0.03
    )

    epochs = 20

    for epoch in range(epochs):

        loss = model.train_example(
            corpus,
            epochs=1
        )

        print(
            f"Epoch {epoch + 1:02d}/{epochs} "
            f"| loss: {loss:.4f}"
        )

    model.save(MODEL_FILE)

    print()
    print("🟢 Zybot Brain trained.")
    print(f"🧠 Model saved to: {MODEL_FILE}")


if __name__ == "__main__":
    main()
