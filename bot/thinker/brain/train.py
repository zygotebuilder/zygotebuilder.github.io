from pathlib import Path
import argparse
import json
import random

from .model import ZybotRNN


BRAIN_DIR = Path(__file__).resolve().parent

DATA_FILE = BRAIN_DIR / "training_data.json"
MODEL_FILE = BRAIN_DIR / "zybot-brain.json"


def load_training_data():
    with open(DATA_FILE, "r", encoding="utf-8") as file:
        records = json.load(file)

    if not isinstance(records, list) or not records:
        raise ValueError("Training data must be a non-empty JSON list.")

    for index, record in enumerate(records):
        if not isinstance(record, dict):
            raise ValueError(f"Record {index} must be a JSON object.")

        if not isinstance(record.get("input"), str):
            raise ValueError(f"Record {index} has no valid input string.")

        if not isinstance(record.get("output"), str):
            raise ValueError(f"Record {index} has no valid output string.")

        if not record["input"].strip() or not record["output"].strip():
            raise ValueError(f"Record {index} contains empty text.")

    return records


def build_vocabulary(records):
    characters = set(ZybotRNN.SEPARATOR)

    for record in records:
        characters.update(record["input"])
        characters.update(record["output"])

    return sorted(characters)


def main():
    parser = argparse.ArgumentParser(
        description="Train Zybot's small local character-level RNN."
    )
    parser.add_argument(
        "--epochs",
        type=int,
        default=100,
        help="Number of training epochs (default: 100).",
    )
    args = parser.parse_args()

    if args.epochs < 1:
        parser.error("--epochs must be at least 1.")

    print("=" * 65)
    print("ZYBOT BRAIN — LOCAL TRAINING")
    print("=" * 65)
    print(f"Brain directory: {BRAIN_DIR}")
    print(f"Training data:   {DATA_FILE}")
    print(f"Model output:    {MODEL_FILE}")

    records = load_training_data()
    vocabulary = build_vocabulary(records)

    print(f"Training pairs:  {len(records)}")
    print(f"Vocabulary size: {len(vocabulary)}")
    print(f"Hidden units:    24")
    print(f"Epochs:          {args.epochs}")
    print()

    model = ZybotRNN(
        vocab=vocabulary,
        hidden_size=24,
        learning_rate=0.03,
        seed=42,
    )

    rng = random.Random(42)

    for epoch in range(args.epochs):
        epoch_records = records[:]
        rng.shuffle(epoch_records)

        total_loss = 0.0

        for record in epoch_records:
            loss = model.train_example(
                record["input"],
                record["output"],
            )
            total_loss += loss

        average_loss = total_loss / len(epoch_records)

        if (
            epoch == 0
            or (epoch + 1) % 10 == 0
            or epoch + 1 == args.epochs
        ):
            print(
                f"Epoch {epoch + 1:03d}/{args.epochs} "
                f"| average output loss: {average_loss:.4f}"
            )

    MODEL_FILE.parent.mkdir(parents=True, exist_ok=True)
    model.save(MODEL_FILE)

    # Verify that the saved model can be loaded.
    reloaded = ZybotRNN.load(MODEL_FILE)

    print()
    print("Training completed.")
    print(f"Model saved: {MODEL_FILE}")
    print(f"Model size:  {MODEL_FILE.stat().st_size:,} bytes")
    print(f"Reload test: {reloaded.hidden_size} hidden units")
    print()
    print(
        "Note: falling training loss indicates learning on these examples; "
        "it does not prove general reasoning or reliable performance "
        "on unseen repository events."
    )


if __name__ == "__main__":
    main()
