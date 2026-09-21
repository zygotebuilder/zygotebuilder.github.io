from pathlib import Path
from datetime import datetime, timezone
import json

from context import build_context
from ai import analyze


ROOT = Path(__file__).resolve().parents[2]

THOUGHTS_FILE = ROOT / "bot" / "archive" / "zybot-thoughts.json"


def load_json(path, default):
    if not path.exists():
        return default

    try:
        return json.loads(
            path.read_text(encoding="utf-8")
        )
    except Exception:
        return default


def save_json(path, data):
    path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    path.write_text(
        json.dumps(
            data,
            indent=2,
            ensure_ascii=False
        ),
        encoding="utf-8"
    )


def latest_commit():
    history_file = ROOT / "bot" / "archive" / "zybot-history.json"

    history = load_json(
        history_file,
        {"runs": []}
    )

    runs = history.get("runs", [])

    if not runs:
        return "unknown"

    return runs[-1].get(
        "commit",
        "unknown"
    )


def main():

    print("=" * 65)
    print("🧬 ZYBOT — AI THINKER")
    print("=" * 65)

    print("\n🔎 Building repository context...")

    context = build_context()

    print("🟢 Context prepared.")

    analysis = analyze(context)

    thoughts_history = load_json(
        THOUGHTS_FILE,
        {
            "version": 2,
            "thoughts": []
        }
    )

    record = {
        "timestamp": datetime.now(
            timezone.utc
        ).isoformat(),

        "commit": latest_commit(),

        "engine": "Qwen3-0.6B",

        "observations":
            analysis.get("observations", []),

        "potential_problems":
            analysis.get("potential_problems", []),

        "patterns":
            analysis.get("patterns", []),

        "creative_ideas":
            analysis.get("creative_ideas", []),

        "questions_for_human":
            analysis.get("questions_for_human", [])
    }

    thoughts_history["thoughts"].append(record)

    thoughts_history["thoughts"] = (
        thoughts_history["thoughts"][-100:]
    )

    save_json(
        THOUGHTS_FILE,
        thoughts_history
    )

    print("\n" + "-" * 65)
    print("🧠 ZYBOT AI ANALYSIS")
    print("-" * 65)

    sections = [
        ("OBSERVATIONS", "observations"),
        ("POTENTIAL PROBLEMS", "potential_problems"),
        ("PATTERNS", "patterns"),
        ("CREATIVE IDEAS", "creative_ideas"),
        ("QUESTIONS FOR HUMAN", "questions_for_human")
    ]

    for title, key in sections:

        print(f"\n{title}")
        print("-" * 40)

        values = analysis.get(key, [])

        if not values:
            print("None.")

        for value in values:
            print(f"• {value}")

    print("\n" + "=" * 65)
    print("🟢 AI Thinker finished.")
    print("=" * 65)


if __name__ == "__main__":
    main()
