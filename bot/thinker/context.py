
from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[2]

ARCHIVE_FILE = ROOT / "bot" / "archive" / "zybot-history.json"
THOUGHTS_FILE = ROOT / "bot" / "archive" / "zybot-thoughts.json"

IGNORED_DIRECTORIES = {
    ".git",
    ".github",
    "node_modules",
    "__pycache__",
    ".venv",
    "venv"
}

MAX_CONTEXT_CHARS = 12000
MAX_STRUCTURE_FILES = 500
MAX_HISTORY_CHARS = 2500


def load_json(path, default):
    if not path.exists():
        return default

    try:
        # Avoid loading an unexpectedly huge archive into memory.
        if path.stat().st_size > 2 * 1024 * 1024:
            print(f"⚠️ Skipping oversized context file: {path.name}")
            return default

        return json.loads(path.read_text(encoding="utf-8"))

    except (OSError, json.JSONDecodeError, UnicodeDecodeError) as exc:
        print(f"⚠️ Could not read {path.name}: {exc}")
        return default


def repository_structure():
    files = []

    try:
        for path in ROOT.rglob("*"):
            if not path.is_file():
                continue

            relative = path.relative_to(ROOT)

            if any(part in IGNORED_DIRECTORIES for part in relative.parts):
                continue

            files.append(relative.as_posix())

            if len(files) >= MAX_STRUCTURE_FILES:
                break

    except OSError as exc:
        print(f"⚠️ Could not scan the full repository: {exc}")

    result = "\n".join(sorted(files))

    if len(files) >= MAX_STRUCTURE_FILES:
        result += "\n[File listing truncated at the configured limit.]"

    return result


def recent_history():
    history = load_json(
        ARCHIVE_FILE,
        {"version": 1, "runs": []}
    )

    if not isinstance(history, dict):
        return "No usable archive history."

    runs = history.get("runs", [])

    if not isinstance(runs, list):
        return "No usable archive history."

    # Keep metadata only. Do not include large or arbitrary nested payloads.
    compact_runs = []

    for run in runs[-5:]:
        if not isinstance(run, dict):
            continue

        repository = run.get("repository", {})

        if not isinstance(repository, dict):
            repository = {}

        compact_runs.append({
            "timestamp": str(run.get("timestamp", ""))[:40],
            "event": str(run.get("event", ""))[:40],
            "branch": str(run.get("branch", ""))[:80],
            "commit": str(run.get("commit", ""))[:80],
            "repository": {
                "total_files": repository.get("total_files"),
                "html": repository.get("html"),
                "css": repository.get("css"),
                "javascript": repository.get("javascript"),
                "python": repository.get("python")
            }
        })

    return json.dumps(
        compact_runs,
        indent=2,
        ensure_ascii=False
    )[:MAX_HISTORY_CHARS]


def previous_thoughts():
    """
    Return thought metadata only.

    Never feed previous model-generated text into a new model prompt.
    This prevents recursive prompt growth across runs.
    """

    thoughts = load_json(
        THOUGHTS_FILE,
        {"version": 2, "thoughts": []}
    )

    if not isinstance(thoughts, dict):
        return "Previous thought metadata unavailable."

    records = thoughts.get("thoughts", [])

    if not isinstance(records, list):
        return "Previous thought metadata unavailable."

    metadata = []

    for record in records[-3:]:
        if not isinstance(record, dict):
            continue

        metadata.append({
            "timestamp": str(record.get("timestamp", ""))[:40],
            "commit": str(record.get("commit", ""))[:80],
            "observation_count": len(
                record.get("observations", [])
                if isinstance(record.get("observations", []), list)
                else []
            ),
            "problem_count": len(
                record.get("potential_problems", [])
                if isinstance(record.get("potential_problems", []), list)
                else []
            ),
            "pattern_count": len(
                record.get("patterns", [])
                if isinstance(record.get("patterns", []), list)
                else []
            ),
            "idea_count": len(
                record.get("creative_ideas", [])
                if isinstance(record.get("creative_ideas", []), list)
                else []
            )
        })

    return json.dumps(metadata, indent=2, ensure_ascii=False)


def latest_commit():
    try:
        result = subprocess.run(
            [
                "git",
                "log",
                "-1",
                "--pretty=format:%H%n%an%n%ad%n%s"
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=False
        )

        if result.returncode != 0:
            return "Git commit information unavailable."

        return result.stdout.strip()[:1000]

    except (OSError, subprocess.TimeoutExpired):
        return "Git commit information unavailable."


def git_changes():
    try:
        result = subprocess.run(
            [
                "git",
                "show",
                "--stat",
                "--oneline",
                "--no-renames",
                "HEAD"
            ],
            cwd=ROOT,
            capture_output=True,
            text=True,
            timeout=5,
            check=False
        )

        if result.returncode != 0:
            return "Git change information unavailable."

        return result.stdout.strip()[:2000]

    except (OSError, subprocess.TimeoutExpired):
        return "Git change information unavailable."


def build_context():
    sections = [
        (
            "REPOSITORY STRUCTURE",
            repository_structure()
        ),
        (
            "RECENT ARCHIVE HISTORY",
            recent_history()
        ),
        (
            "PREVIOUS THOUGHT METADATA — NO PREVIOUS AI TEXT",
            previous_thoughts()
        ),
        (
            "LATEST COMMIT",
            latest_commit()
        ),
        (
            "MOST RECENT GIT CHANGE",
            git_changes()
        )
    ]

    parts = []

    for title, content in sections:
        section = f"{title}\n{'=' * len(title)}\n{content}\n"
        parts.append(section)

    context = "\n".join(parts)

    if len(context) > MAX_CONTEXT_CHARS:
        context = (
            context[:MAX_CONTEXT_CHARS]
            + "\n[Context truncated to the configured character limit.]"
        )

    print(f"📏 Context length: {len(context)} characters.")

    return context


if __name__ == "__main__":
    print(build_context())
