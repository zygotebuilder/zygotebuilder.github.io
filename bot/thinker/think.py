from pathlib import Path
from datetime import datetime, timezone
import json
import os

from context import build_context
from ai import analyze


ROOT = Path(__file__).resolve().parents[2]

THOUGHTS_FILE = ROOT / "bot" / "archive" / "zybot-thoughts.json"
HISTORY_FILE = ROOT / "bot" / "archive" / "zybot-history.json"

MAX_THOUGHTS = 100
MAX_ARCHIVE_BYTES = 5 * 1024 * 1024

MAX_ITEMS_PER_CATEGORY = 10
MAX_ITEM_CHARS = 500

CATEGORIES = (
    "observations",
    "potential_problems",
    "patterns",
    "creative_ideas",
    "questions_for_human"
)


def load_json(path, default):
    if not path.exists():
        return default

    try:
        size = path.stat().st_size

        if path == THOUGHTS_FILE and size > MAX_ARCHIVE_BYTES:
            print(
                f"⚠️ Existing thoughts archive is "
                f"{size / (1024 * 1024):.2f} MB."
            )
            print(
                "⚠️ Starting a fresh bounded archive. "
                "The oversized file will not be loaded."
            )
            return default

        if size > MAX_ARCHIVE_BYTES:
            print(f"⚠️ Skipping oversized file: {path.name}")
            return default

        return json.loads(path.read_text(encoding="utf-8"))

    except (OSError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        print(f"⚠️ Could not load {path.name}: {exc}")
        return default


def clean_items(values):
    if values is None:
        return []

    if isinstance(values, str):
        values = [values]
    elif not isinstance(values, (list, tuple)):
        values = [values]

    cleaned = []

    for value in values[:MAX_ITEMS_PER_CATEGORY]:
        if value is None:
            continue

        if isinstance(value, str):
            item = value
        else:
            try:
                item = json.dumps(value, ensure_ascii=False)
            except (TypeError, ValueError):
                item = str(value)

        item = item.strip()

        if not item:
            continue

        if len(item) > MAX_ITEM_CHARS:
            item = item[:MAX_ITEM_CHARS] + "... [truncated]"

        cleaned.append(item)

    return cleaned


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)

    if path == THOUGHTS_FILE:
        records = data.get("thoughts", [])

        if not isinstance(records, list):
            records = []

        bounded_records = []

        for record in records[-MAX_THOUGHTS:]:
            if not isinstance(record, dict):
                continue

            cleaned_record = {
                "timestamp": str(record.get("timestamp", ""))[:40],
                "commit": str(record.get("commit", ""))[:100],
                "engine": str(record.get("engine", ""))[:100]
            }

            for category in CATEGORIES:
                cleaned_record[category] = clean_items(
                    record.get(category, [])
                )

            bounded_records.append(cleaned_record)

        data = {
            "version": 2,
            "thoughts": bounded_records
        }

        # Remove the oldest records until the archive is small enough.
        while True:
            serialized = json.dumps(
                data,
                indent=2,
                ensure_ascii=False
            )

            if len(serialized.encode("utf-8")) <= MAX_ARCHIVE_BYTES:
                break

            if not data["thoughts"]:
                raise ValueError(
                    "Could not fit the thoughts archive within 5 MB."
                )

            data["thoughts"].pop(0)

            print(
                "⚠️ Removed an older thought record "
                "to enforce the archive size limit."
            )

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

    return str(latest.get("commit", "unknown"))[:100]


def main():
    print("=" * 65, flush=True)
    print("🧬 ZYBOT — AI THINKER", flush=True)
    print("=" * 65, flush=True)

    print("\n🔎 Building repository context...", flush=True)

    context = build_context()

    print("🟢 Context prepared.", flush=True)

    analysis = analyze(context)

    if not isinstance(analysis, dict):
        analysis = {}

    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "commit": latest_commit(),
        "engine": "ZybotRNN (local character-level model)"
    }

    for category in CATEGORIES:
        record[category] = clean_items(
            analysis.get(category, [])
        )

    thoughts_history = load_json(
        THOUGHTS_FILE,
        {"version": 2, "thoughts": []}
    )

    if not isinstance(thoughts_history, dict):
        thoughts_history = {"version": 2, "thoughts": []}

    records = thoughts_history.get("thoughts", [])

    if not isinstance(records, list):
        records = []

    thoughts_history["thoughts"] = (
        records[-(MAX_THOUGHTS - 1):] + [record]
    )

    print("\n💾 Saving bounded AI thoughts archive...", flush=True)

    save_json(THOUGHTS_FILE, thoughts_history)

    print("\n" + "-" * 65, flush=True)
    print("🧠 ZYBOT AI ANALYSIS", flush=True)
    print("-" * 65, flush=True)

    titles = {
        "observations": "OBSERVATIONS",
        "potential_problems": "POTENTIAL PROBLEMS",
        "patterns": "PATTERNS",
        "creative_ideas": "CREATIVE IDEAS",
        "questions_for_human": "QUESTIONS FOR HUMAN"
    }

    for category in CATEGORIES:
        print(f"\n{titles[category]}", flush=True)
        print("-" * 40, flush=True)

        values = record[category]

        if not values:
            print("None.", flush=True)
            continue

        for value in values:
            print(f"• {value}", flush=True)

    archive_size = THOUGHTS_FILE.stat().st_size

    print("\n" + "-" * 65, flush=True)
    print(
        f"📦 Archive size: {archive_size / 1024:.1f} KB "
        f"(maximum 5 MB)",
        flush=True
    )
    print(
        f"📚 Stored records: "
        f"{len(thoughts_history['thoughts'])}/{MAX_THOUGHTS}",
        flush=True
    )

    print("\n" + "=" * 65, flush=True)
    print("🟢 AI Thinker finished.", flush=True)
    print("=" * 65, flush=True)


if __name__ == "__main__":
    main()
