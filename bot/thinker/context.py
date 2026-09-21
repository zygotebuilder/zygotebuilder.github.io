from pathlib import Path
import json
import subprocess


ROOT = Path(__file__).resolve().parents[2]

ARCHIVE_FILE = ROOT / "bot" / "archive" / "zybot-history.json"
THOUGHTS_FILE = ROOT / "bot" / "archive" / "zybot-thoughts.json"


def repository_structure():
    """
    Describe the current repository structure.

    Excludes Git internals, Python cache files, and the AI model itself
    so the Thinker receives useful repository information without
    unnecessarily filling its context window.
    """

    lines = []

    ignored_directories = {
        ".git",
        "__pycache__",
        ".pytest_cache",
        "node_modules",
    }

    ignored_files = {
        ".DS_Store",
    }

    try:
        for path in sorted(ROOT.rglob("*")):

            if not path.is_file():
                continue

            relative = path.relative_to(ROOT)

            if any(
                part in ignored_directories
                for part in relative.parts
            ):
                continue

            if path.name in ignored_files:
                continue

            # Do not include the downloaded AI model in repository structure.
            if (
                "bot" in relative.parts
                and "thinker" in relative.parts
                and "model" in relative.parts
            ):
                continue

            lines.append(str(relative))

        if not lines:
            return "No repository files detected."

        return "\n".join(lines)

    except Exception as
