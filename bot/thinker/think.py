
from pathlib import Path
from datetime import datetime, timezone
import json
import os

from context import build_context
from ai import analyze


ROOT = Path(__file__).resolve().parents[2]

THOUGHTS_FILE = ROOT / "bot" / "archive" / "zybot-thoughts.json"
HISTORY_FILE = ROOT / "bot" / "archive" / "zybot-history.json"

# Archive safety limits
MAX_THOUGHTS = 100
MAX_ITEMS_PER_CATEGORY = 10
MAX_ITEM_CHARS = 500
MAX_ARCHIVE_BYTES = 5 * 1024 * 1024  # 5 MB


SECTIONS = [
    ("OBSERVATIONS", "observations"),
    ("POTENTIAL PROBLEMS", "potential_problems"),
    ("PATTERNS", "patterns"),
    ("CREATIVE IDEAS", "creative_ideas"),
    ("QUESTIONS FOR HUMAN", "questions_for_human"),
]


def load_json(path, default):
    """Load JSON safely, avoiding unexpectedly oversized archive files."""

    if not path.exists():
        return default

    try:
        file_size = path.stat().st_size

        if path == THOUGHTS_FILE and file_size > MAX_ARCHIVE_BYTES:
            print(
                f"⚠️ Existing thoughts archive is {file_size / (1024 * 1024):.2f} MB."
            )
            print("⚠️ Starting a fresh bounded archive to prevent another oversized push.")
            return default

        return json.loads(path.read_text(encoding="utf-8"))

    except (OSError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        print(f"⚠️ Could not load {path.name}: {exc}")
        print("⚠️ Using the default data instead.")
        return default


def save_json(path, data):
    """Write JSON atomically and enforce the archive size limit."""

    path.parent.mkdir(parents=True, exist_ok=True)

    if path == THOUGHTS_FILE:
        thoughts = data.get("thoughts", [])

        # Keep the newest records first when reducing the archive.
        while True:
            serialized = json.dumps(
                data,
                indent=2,
                ensure_ascii=False
            )

            encoded = serialized.encode("utf-8")

            if len(encoded) <= MAX_ARCHIVE_BYTES:
                break

            if not thoughts:
                raise ValueError(
                    "Unable to save thoughts archive within the size limit."
                )

            thoughts = thoughts[1:]
            data["thoughts"] = thoughts

            print("⚠️ Removed an older thought record to stay within the archive limit.")

    else:
        serialized = json.dumps(
            data,
            indent=2,
            ensure_ascii=False
        )

    temp_path = path.with_name(path.name + ".tmp")

    try:
        temp_path.write_text(serialized, encoding="utf-8")
        os.replace(temp_path, path)
    finally:
        if temp_path.exists():
            temp_path.unlink()


def latest_commit():
    history = load_json(
        HISTORY_FILE,
        {"runs": []}
    )

    if not isinstance(history, dict):
        return "unknown"

    runs = history.get("runs", [])

    if not isinstance(runs, list) or not runs:
        return "unknown"

    latest = runs[-1]

    if not isinstance(latest, dict):
        return "unknown"

    return latest.get("commit", "unknown")


def clean_category(values):
    """Normalize AI output and bound every stored text item."""

    if values is None:
        return []

    if isinstance(values, (str, int, float, bool)):
        values = [values]

    if not isinstance(values, (list, tuple)):
        values = [values]

    cleaned = []

    for value in values[:MAX_ITEMS_PER_CATEGORY]:
        if value is None:
            continue

        if isinstance(value, str):
            text = value
        else:
            try:
                text = json.dumps(
                    value,
                    ensure_ascii=False
                )
            except (TypeError, ValueError):
                text = str(value)

        text = text.strip()

        if not text:
            continue

        if len(text) > MAX_ITEM_CHARS:
            text = text[:MAX_ITEM_CHARS] + "... [truncated]"

        cleaned.append(text)

    return cleaned


def main():
    print("=" * 65)
    print("🧬 ZYBOT — AI THINKER")
    print("=" * 65)

    print("\n🔎 Building repository context...")

    context = build_context()

    print("🟢 Context prepared.")
    print("\n🧠 Analyzing repository context...")

    analysis = analyze(context)

    if not isinstance(analysis, dict):
        print("⚠️ AI analysis did not return a dictionary.")
        analysis = {
            "observations": [str(analysis)]
        }

    # Normalize every category before saving or printing it.
    cleaned_analysis = {}

    for _, key in SECTIONS:
        cleaned_analysis[key] = clean_category(
            analysis.get(key, [])
        )

    thoughts_history = load_json(
        THOUGHTS_FILE,
        {
            "version": 2,
            "thoughts": []
        }
    )

    if not isinstance(thoughts_history, dict):
        thoughts_history = {
            "version": 2,
            "thoughts": []
        }

    existing_thoughts = thoughts_history.get("thoughts", [])

    if not isinstance(existing_thoughts, list):
        existing_thoughts = []

    record = {
        "timestamp": datetime.now(
            timezone.utc
        ).isoformat(),

        "commit": latest_commit(),

        "engine": "Qwen3-0.6B",

        "observations": cleaned_analysis["observations"],

        "potential_problems": cleaned_analysis["potential_problems"],

        "patterns": cleaned_analysis["patterns"],

        "creative_ideas": cleaned_analysis["creative_ideas"],

        "questions_for_human": cleaned_analysis["questions_for_human"]
    }

    thoughts_history["version"] = 2
    thoughts_history["thoughts"] = (
        existing_thoughts + [record]
    )[-MAX_THOUGHTS:]

    print("\n💾 Saving bounded AI thoughts archive...")

    save_json(
        THOUGHTS_FILE,
        thoughts_history
    )

    print("\n" + "-" * 65)
    print("🧠 ZYBOT AI ANALYSIS")
    print("-" * 65)

    for title, key in SECTIONS:
        print(f"\n{title}")
        print("-" * 40)

        values = cleaned_analysis[key]

        if not values:
            print("None.")
            continue

        for value in values:
            print(f"• {value}")

    archive_size = THOUGHTS_FILE.stat().st_size

    print("\n" + "-" * 65)
    print(
        f"📦 Archive size: {archive_size / 1024:.1f} KB "
        f"(limit: {MAX_ARCHIVE_BYTES / (1024 * 1024):.0f} MB)"
    )
    print(
        f"📚 Stored thought records: "
        f"{len(thoughts_history['thoughts'])}/{MAX_THOUGHTS}"
    )

    print("\n" + "=" * 65)
    print("🟢 AI Thinker finished.")
    print("=" * 65)


if __name__ == "__main__":
    main()
