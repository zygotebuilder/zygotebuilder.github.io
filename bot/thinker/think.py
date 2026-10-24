
from pathlib import Path
from datetime import datetime, timezone
import json
import os
import subprocess

from context import build_context
from ai import analyze


ROOT = Path(__file__).resolve().parents[2]

THOUGHTS_FILE = ROOT / "bot" / "archive" / "zybot-thoughts.json"

MAX_THOUGHTS = 100
MAX_ARCHIVE_BYTES = 5 * 1024 * 1024
MAX_ITEMS_PER_CATEGORY = 10
MAX_ITEM_CHARS = 500
MAX_EVIDENCE_ITEMS = 5
MAX_EVIDENCE_CHARS = 300

CATEGORIES = (
    "observations",
    "potential_problems",
    "patterns",
    "creative_ideas",
    "questions_for_human",
)

ENGINE = "Zybot deterministic evidence analyzer"


def load_json(path, default):
    if not path.exists():
        return default

    try:
        if path.stat().st_size > MAX_ARCHIVE_BYTES:
            print(f"⚠️ Skipping oversized file: {path.name}")
            return default

        return json.loads(path.read_text(encoding="utf-8"))

    except (OSError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        print(f"⚠️ Could not load {path.name}: {exc}")
        return default


def clean_evidence(values):
    if not isinstance(values, list):
        return []

    cleaned = []

    for value in values[:MAX_EVIDENCE_ITEMS]:
        if not isinstance(value, dict):
            continue

        source = str(value.get("source", "unknown"))[:80]
        locator = str(value.get("locator", ""))[:120]
        detail = str(value.get("detail", ""))[:MAX_EVIDENCE_CHARS]

        cleaned.append({
            "source": source,
            "locator": locator,
            "detail": detail,
        })

    return cleaned


def clean_item(value):
    """
    Normalize both legacy string entries and evidence-linked objects.
    """

    if isinstance(value, str):
        text = value.strip()

        if not text:
            return None

        return {
            "kind": "legacy",
            "text": text[:MAX_ITEM_CHARS],
            "evidence": [],
        }

    if not isinstance(value, dict):
        return None

    text = value.get("text")
    if not isinstance(text, str) or not text.strip():
        return None

    return {
        "kind": str(value.get("kind", "observation"))[:40],
        "text": text.strip()[:MAX_ITEM_CHARS],
        "evidence": clean_evidence(value.get("evidence", [])),
    }


def clean_items(values):
    if values is None:
        return []

    if isinstance(values, (str, dict)):
        values = [values]

    if not isinstance(values, (list, tuple)):
        return []

    cleaned = []

    for value in values[:MAX_ITEMS_PER_CATEGORY]:
        item = clean_item(value)

        if item is not None:
            cleaned.append(item)

    return cleaned


def save_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)

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
            "engine": str(record.get("engine", ""))[:100],
        }

        for category in CATEGORIES:
            cleaned_record[category] = clean_items(
                record.get(category, [])
            )

        bounded_records.append(cleaned_record)

    archive = {
        "version": 3,
        "thoughts": bounded_records,
    }

    while True:
        serialized = json.dumps(
            archive,
            indent=2,
            ensure_ascii=False,
        )

        if len(serialized.encode("utf-8")) <= MAX_ARCHIVE_BYTES:
            break

        if not archive["thoughts"]:
            raise ValueError(
                "Could not fit the thoughts archive within 5 MB."
            )

        archive["thoughts"].pop(0)
        print("⚠️ Removed the oldest thought record to enforce the size limit.")

    temp_path = path.with_name(path.name + ".tmp")

    try:
        temp_path.write_text(serialized, encoding="utf-8")
        os.replace(temp_path, path)
    finally:
        if temp_path.exists():
            temp_path.unlink()


def current_commit():
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=False,
        )

        if result.returncode == 0:
            commit = result.stdout.strip()

            if commit:
                return commit[:100]

    except (OSError, subprocess.TimeoutExpired):
        pass

    return "unknown"


def print_item(item):
    print(f"• [{item['kind'].upper()}] {item['text']}")

    if not item["evidence"]:
        print("  Evidence: none attached")
        return

    for evidence in item["evidence"]:
        source = evidence["source"]
        locator = evidence["locator"]
        detail = evidence["detail"]

        print(f"  Evidence: {source} | {locator}")

        if detail:
            print(f"    {detail}")


def main():
    print("=" * 65, flush=True)
    print("ZYBOT — EVIDENCE-BASED THINKER", flush=True)
    print("=" * 65, flush=True)

    print("\n🔎 Building repository context...", flush=True)
    context = build_context()
    print("🟢 Context prepared.", flush=True)

    print("\n🔬 Analyzing available evidence...", flush=True)
    analysis = analyze(context)

    if not isinstance(analysis, dict):
        analysis = {}

    record = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "commit": current_commit(),
        "engine": ENGINE,
    }

    for category in CATEGORIES:
        record[category] = clean_items(
            analysis.get(category, [])
        )

    archive = load_json(
        THOUGHTS_FILE,
        {"version": 3, "thoughts": []},
    )

    if not isinstance(archive, dict):
        archive = {"version": 3, "thoughts": []}

    records = archive.get("thoughts", [])
    if not isinstance(records, list):
        records = []

    archive["thoughts"] = (
        records[-(MAX_THOUGHTS - 1):] + [record]
    )

    print("\n💾 Saving bounded thoughts archive...", flush=True)
    save_json(THOUGHTS_FILE, archive)

    # Read back the saved archive to verify the write and final size.
    saved_archive = load_json(
        THOUGHTS_FILE,
        {"version": 3, "thoughts": []},
    )

    saved_records = (
        saved_archive.get("thoughts", [])
        if isinstance(saved_archive, dict)
        else []
    )

    if not isinstance(saved_records, list) or not saved_records:
        raise RuntimeError("The saved thoughts archive could not be verified.")

    saved_record = saved_records[-1]

    print("\n" + "-" * 65, flush=True)
    print("ZYBOT ANALYSIS", flush=True)
    print("-" * 65, flush=True)

    titles = {
        "observations": "OBSERVATIONS",
        "potential_problems": "POTENTIAL PROBLEMS",
        "patterns": "PATTERNS",
        "creative_ideas": "CREATIVE IDEAS",
        "questions_for_human": "QUESTIONS FOR HUMAN",
    }

    for category in CATEGORIES:
        print(f"\n{titles[category]}", flush=True)
        print("-" * 40, flush=True)

        items = clean_items(saved_record.get(category, []))

        if not items:
            print("No evidence-backed findings.", flush=True)
            continue

        for item in items:
            print_item(item)

    archive_size = THOUGHTS_FILE.stat().st_size

    print("\n" + "-" * 65, flush=True)
    print(f"Engine: {ENGINE}", flush=True)
    print(
        f"Archive size: {archive_size / 1024:.1f} KB "
        f"(maximum 5 MB)",
        flush=True,
    )
    print(
        f"Stored records: {len(saved_records)}/{MAX_THOUGHTS}",
        flush=True,
    )
    print(f"Commit: {record['commit']}", flush=True)
    print("\n🟢 Analysis and archive verification finished.", flush=True)


if __name__ == "__main__":
    main()
