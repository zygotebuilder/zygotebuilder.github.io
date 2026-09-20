import os
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

LABEL = "zybot"
ISSUE_TITLE = "🧬 Zybot detected project problems"


def run_tests():
    result = subprocess.run(
        ["python", "bot/tester/test_projects.py"],
        cwd=ROOT,
        capture_output=True,
        text=True
    )

    return result.stdout, result.returncode


def ensure_label_exists():
    result = subprocess.run(
        [
            "gh",
            "label",
            "create",
            LABEL,
            "--description",
            "Issues automatically detected by Zybot",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True
    )

    # If it already exists, GitHub CLI returns an error.
    # That's fine — we don't need to do anything.
    if result.returncode == 0:
        print("🏷️ Created Zybot label.")
    else:
        print("🏷️ Zybot label already exists or could not be created.")


def get_existing_issues():
    result = subprocess.run(
        [
            "gh",
            "issue",
            "list",
            "--state",
            "open",
            "--label",
            LABEL,
            "--json",
            "number,title",
        ],
        cwd=ROOT,
        capture_output=True,
        text=True
    )

    if result.returncode != 0:
        return []

    return result.stdout


def create_issue(body):
    result = subprocess.run(
        [
            "gh",
            "issue",
            "create",
            "--title",
            ISSUE_TITLE,
            "--body",
            body,
            "--label",
            LABEL,
        ],
        cwd=ROOT,
        capture_output=True,
        text=True
    )

    if result.returncode == 0:
        print("✅ Zybot created an Issue:")
        print(result.stdout)
    else:
        print("❌ Zybot could not create the Issue:")
        print(result.stderr)


def main():
    print("=" * 60)
    print("🧬 ZYBOT — REPORTER")
    print("=" * 60)

    output, return_code = run_tests()

    print("\nTESTER OUTPUT")
    print("-" * 60)
    print(output)

    if return_code != 0:
        print("\n❌ Tester itself failed to execute.")
        return

    failed_projects = []

    for line in output.splitlines():
        if line.startswith("❌"):
            failed_projects.append(line)

    if not failed_projects:
        print("\n🟢 No failed projects detected.")
        print("Nothing to report.")
        return

    print(f"\n🔎 Problems detected: {len(failed_projects)}")

    ensure_label_exists()

    existing_issues = get_existing_issues()

    if ISSUE_TITLE in existing_issues:
        print("\n📋 An existing Zybot Issue is already open.")
        print("Zybot will not create a duplicate.")

        return

    body = """## 🧬 Zybot automated report

Zybot's Tester detected the following project(s) requiring attention:

"""

    for project in failed_projects:
        body += f"- {project}\n"

    body += """
---

### What happened?

Zybot automatically detected these failures during repository testing.

### Important

Zybot has **not modified `main`**.

No files were changed by this report.

A human should review the affected project before making any changes.

---

*Generated automatically by Zybot.*
"""

    create_issue(body)

    print("\n" + "=" * 60)
    print("Reporter finished.")
    print("=" * 60)


if __name__ == "__main__":
    main()
