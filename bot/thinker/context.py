from pathlib import Path
import json
import subprocess

ROOT = Path(__file__).resolve().parents[2]

ARCHIVE_FILE = ROOT / "bot" / "archive" / "zybot-history.json"
THOUGHTS_FILE = ROOT / "bot" / "archive" / "zybot-thoughts.json"


def load_json(path, default):
    if not path.exists():
        return default

    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return default


def repository_structure():
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

        files.append(str(path.relative_to(ROOT)))

    return "\n".join(sorted(files))


def recent_history():
    history = load_json(
        ARCHIVE_FILE,
        {"version": 1, "runs": []}
    )

    runs = history.get("runs", [])

    return json.dumps(
        runs[-10:],
        indent=2,
        ensure_ascii=False
    )


def previous_thoughts():
    thoughts = load_json(
        THOUGHTS_FILE,
        {"version": 1, "thoughts": []}
    )

    records = thoughts.get("thoughts", [])

    return json.dumps(
        records[-5:],
        indent=2,
        ensure_ascii=False
    )


def git_changes():
    try:
        result = subprocess.run(
            [
                "git",
                "diff",
                "HEAD~1",
                "HEAD",
                "--stat"
            ],
            cwd=ROOT,
            capture_output=True,
            text=True
        )

        return result.stdout.strip()

    except Exception:
        return ""


def build_context():
    return f"""
REPOSITORY STRUCTURE
====================
{repository_structure()}


RECENT ARCHIVE HISTORY
=====================
{recent_history()}


PREVIOUS ZYBOT THOUGHTS
======================
{previous_thoughts()}


MOST RECENT GIT CHANGE
======================
{git_changes()}
"""


if __name__ == "__main__":
    print(build_context())
