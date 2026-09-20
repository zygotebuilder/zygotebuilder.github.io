from pathlib import Path
from datetime import datetime, timezone
import json
import os

ROOT = Path(__file__).resolve().parents[2]

ARCHIVE_DIR = ROOT / "bot" / "archive"
ARCHIVE_FILE = ARCHIVE_DIR / "zybot-history.json"


def load_history():
    if not ARCHIVE_FILE.exists():
        return {
            "version": 1,
            "runs": []
        }

    try:
        return json.loads(
            ARCHIVE_FILE.read_text(
                encoding="utf-8"
            )
        )
    except Exception:
        return {
            "version": 1,
            "runs": []
        }


def collect_repository_stats():
    ignored = {
        ".git",
        ".github",
        "node_modules",
        "__pycache__"
    }

    files = []

    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue

        if any(part in ignored for part in path.parts):
            continue

        files.append(path)

    html = sum(
        1 for path in files
        if path.suffix.lower() == ".html"
    )

    css = sum(
        1 for path in files
        if path.suffix.lower() == ".css"
    )

    javascript = sum(
        1 for path in files
        if path.suffix.lower() == ".js"
    )

    python = sum(
        1 for path in files
        if path.suffix.lower() == ".py"
    )

    return {
        "total_files": len(files),
        "html": html,
        "css": css,
        "javascript": javascript,
        "python": python
    }


def create_run_record():
    now = datetime.now(timezone.utc).isoformat()

    return {
        "timestamp": now,
        "commit": os.environ.get(
            "GITHUB_SHA",
            "local"
        ),
        "event": os.environ.get(
            "GITHUB_EVENT_NAME",
            "manual"
        ),
        "branch": os.environ.get(
            "GITHUB_REF_NAME",
            "unknown"
        ),
        "repository": collect_repository_stats()
    }


def save_history(history):
    ARCHIVE_DIR.mkdir(
        parents=True,
        exist_ok=True
    )

    ARCHIVE_FILE.write_text(
        json.dumps(
            history,
            indent=2
        ),
        encoding="utf-8"
    )


def main():
    print("=" * 60)
    print("🧬 ZYBOT — ARCHIVIST")
    print("=" * 60)

    history = load_history()

    record = create_run_record()

    history["runs"].append(record)

    # Keep the archive from growing forever.
    history["runs"] = history["runs"][-100:]

    save_history(history)

    print("\n📚 Archive updated.")

    print(
        f"Recorded run #{len(history['runs'])}"
    )

    print(
        f"Files currently observed: "
        f"{record['repository']['total_files']}"
    )

    print(
        f"HTML: {record['repository']['html']}"
    )

    print(
        f"JavaScript: "
        f"{record['repository']['javascript']}"
    )

    print(
        f"Python: "
        f"{record['repository']['python']}"
    )

    print("\n🟢 Archivist finished.")


if __name__ == "__main__":
    main()
