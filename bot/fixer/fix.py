import subprocess
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]

BRANCH_NAME = "zybot/fix/html-metadata"


def run_command(command, check=True):
    print(f"\n$ {' '.join(command)}")

    result = subprocess.run(
        command,
        cwd=ROOT,
        capture_output=True,
        text=True
    )

    if result.stdout:
        print(result.stdout)

    if result.stderr:
        print(result.stderr)

    if check and result.returncode != 0:
        print(f"❌ Command failed with exit code {result.returncode}")
        sys.exit(result.returncode)

    return result


def get_html_files():
    ignored = {
        ".git",
        ".github",
        "node_modules",
        "__pycache__",
        "bot"
    }

    files = []

    for path in ROOT.rglob("*.html"):
        if not path.is_file():
            continue

        if any(part in ignored for part in path.parts):
            continue

        files.append(path)

    return files


def find_missing_titles():
    missing = []

    for path in get_html_files():
        try:
            content = path.read_text(
                encoding="utf-8",
                errors="ignore"
            )
        except Exception:
            continue

        if not re.search(
            r"<title\b[^>]*>.*?</title>",
            content,
            re.IGNORECASE | re.DOTALL
        ):
            missing.append(path)

    return missing


def make_title(path):
    name = path.stem

    name = re.sub(r"[-_]+", " ", name)
    name = re.sub(r"\s+", " ", name).strip()

    if not name:
        name = "Zygote Builder"

    return name.title()


def fix_title(path):
    content = path.read_text(
        encoding="utf-8",
        errors="ignore"
    )

    title = make_title(path)

    title_tag = f"    <title>{title}</title>\n"

    head_match = re.search(
        r"<head\b[^>]*>",
        content,
        re.IGNORECASE
    )

    if not head_match:
        print(f"⚠️ Skipping {path}: no <head> element.")
        return False

    insertion_point = head_match.end()

    new_content = (
        content[:insertion_point]
        + "\n"
        + title_tag
        + content[insertion_point:]
    )

    path.write_text(
        new_content,
        encoding="utf-8"
    )

    print(f"🔧 Fixed title: {path}")
    return True


def run_tests():
    print("\n🧪 Running Zybot Tester after modifications...\n")

    result = subprocess.run(
        ["python", "bot/tester/test_projects.py"],
        cwd=ROOT,
        text=True
    )

    return result.returncode


def create_branch():
    run_command(["git", "config", "user.name", "Zybot"])

    run_command([
        "git",
        "config",
        "user.email",
        "41898282+github-actions[bot]@users.noreply.github.com"
    ])

    run_command([
        "git",
        "checkout",
        "-b",
        BRANCH_NAME
    ])


def commit_and_push():
    run_command(["git", "add", "."])

    status = run_command(
        ["git", "status", "--short"],
        check=False
    )

    if not status.stdout.strip():
        print("\n🟢 No changes were made.")
        return False

    run_command([
        "git",
        "commit",
        "-m",
        "🤖 Zybot: fix missing HTML titles"
    ])

    run_command([
        "git",
        "push",
        "origin",
        BRANCH_NAME
    ])

    return True


def create_pull_request():
    body = """## 🧬 Zybot automated fix

Zybot detected HTML files without a `<title>` element and applied a
small deterministic repair.

### What Zybot changed

- Added missing `<title>` elements.
- Generated titles from the affected filenames.
- Ran the Zybot Tester after modification.

### Safety

- Zybot did not modify `main`.
- This Pull Request requires human review.
- Zybot does not merge Pull Requests.
"""

    result = run_command(
        [
            "gh",
            "pr",
            "create",
            "--title",
            "🤖 Zybot: fix missing HTML titles",
            "--body",
            body,
            "--base",
            "main",
            "--head",
            BRANCH_NAME
        ],
        check=False
    )

    if result.returncode == 0:
        print("\n🚀 Pull Request created successfully.")
    else:
        print("\n❌ Could not create Pull Request.")
        sys.exit(result.returncode)


def main():
    print("=" * 60)
    print("🧬 ZYBOT — FIXER")
    print("=" * 60)

    print("\n🔎 Looking for safe, known repair opportunities...")

    missing_titles = find_missing_titles()

    if not missing_titles:
        print("\n🟢 No supported fixes found.")
        print("Zybot will not modify anything.")
        return

    print(
        f"\n🔎 Found {len(missing_titles)} HTML file(s) "
        "without a <title>."
    )

    create_branch()

    changed = 0

    for path in missing_titles:
        if fix_title(path):
            changed += 1

    if changed == 0:
        print("\n🟢 Nothing was changed.")
        return

    test_result = run_tests()

    if test_result != 0:
        print(
            "\n❌ Zybot's changes did not pass the Tester."
        )
        print("The branch will NOT be pushed.")
        sys.exit(1)

    print("\n🟢 All tests passed after Zybot's changes.")

    if not commit_and_push():
        return

    create_pull_request()

    print("\n" + "=" * 60)
    print("Fixer finished.")
    print("=" * 60)


if __name__ == "__main__":
    main()
