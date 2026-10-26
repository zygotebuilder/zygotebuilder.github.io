from pathlib import Path
from urllib.parse import urlsplit
import json
import re
import sys
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]
REPORT_FILE = ROOT / "bot" / "tester" / "test-results.json"

IGNORED_DIRS = {
    ".git",
    ".github",
    "node_modules",
    "__pycache__",
}

EXTERNAL_SCHEMES = {"http", "https", "data", "mailto", "tel", "javascript"}


def get_html_files():
    files = []

    for path in ROOT.rglob("*.html"):
        if not path.is_file():
            continue

        if any(part in IGNORED_DIRS for part in path.relative_to(ROOT).parts):
            continue

        files.append(path)

    return sorted(files)


def resolve_local_reference(path, reference):
    """Resolve a local HTML resource while ignoring query strings and fragments."""
    parsed = urlsplit(reference.strip())

    if parsed.scheme.lower() in EXTERNAL_SCHEMES or parsed.netloc:
        return None

    if not parsed.path:
        return None

    resource = Path(parsed.path)

    if resource.is_absolute():
        return (ROOT / resource.as_posix().lstrip("/")).resolve()

    return (path.parent / resource).resolve()


def test_html_file(path):
    problems = []

    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
    except Exception as error:
        return [f"Could not read file: {error}"]

    lower_content = content.lower()

    if "<html" not in lower_content:
        problems.append("Missing <html> element")

    if "<head" not in lower_content:
        problems.append("Missing <head> element")

    if "<body" not in lower_content:
        problems.append("Missing <body> element")

    if not re.search(r"<title\b[^>]*>.*?</title>", content, re.I | re.S):
        problems.append("Missing <title>")

    # Check local script references.
    for src in re.findall(
        r'<script\b[^>]*\bsrc\s*=\s*["\']([^"\']+)["\']',
        content,
        re.I,
    ):
        referenced = resolve_local_reference(path, src)

        if referenced is None:
            continue

        if not referenced.is_file():
            problems.append(f"Missing script: {src}")

    # Check local stylesheet references.
    for href in re.findall(
        r'<link\b[^>]*\bhref\s*=\s*["\']([^"\']+)["\']',
        content,
        re.I,
    ):
        if href.strip().startswith("#"):
            continue

        referenced = resolve_local_reference(path, href)

        if referenced is None:
            continue

        if not referenced.is_file():
            problems.append(f"Missing stylesheet: {href}")

    return problems


def run_tests():
    html_files = get_html_files()
    results = []

    for file in html_files:
        relative = file.relative_to(ROOT).as_posix()
        problems = test_html_file(file)

        results.append({
            "file": relative,
            "status": "failed" if problems else "passed",
            "problems": problems,
        })

    total = len(results)
    failed = sum(item["status"] == "failed" for item in results)
    passed = total - failed

    report = {
        "schema_version": 1,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "tester": "Zybot HTML Project Tester",
        "scope": "Basic HTML structure and local script/stylesheet references",
        "status": "failed" if failed else "passed",
        "total": total,
        "passed": passed,
        "failed": failed,
        "results": results,
        "limitations": [
            "These checks do not execute JavaScript.",
            "These checks do not verify simulation behaviour or scientific accuracy.",
            "These checks do not constitute comprehensive HTML validation.",
        ],
    }

    REPORT_FILE.parent.mkdir(parents=True, exist_ok=True)
    temporary_file = REPORT_FILE.with_suffix(".tmp")

    temporary_file.write_text(
        json.dumps(report, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    temporary_file.replace(REPORT_FILE)

    print("=" * 55)
    print("🧬 ZYBOT — ZYGOTE BUILDER TESTER")
    print("=" * 55)
    print(f"\nHTML projects discovered: {total}")

    for item in results:
        if item["status"] == "passed":
            print(f"✅ {item['file']}")
        else:
            print(f"\n❌ {item['file']}")
            for problem in item["problems"]:
                print(f"   • {problem}")

    print("\n" + "-" * 55)
    print("TEST SUMMARY")
    print("-" * 55)
    print(f"Passed: {passed}")
    print(f"Failed: {failed}")
    print(f"Report: {REPORT_FILE.relative_to(ROOT)}")

    if failed == 0:
        print("\n🟢 All basic tests passed.")
    else:
        print(f"\n🔴 {failed} project(s) need attention.")

    print("=" * 55)

    # Expose the result to GitHub Actions even when tests fail.
    github_output = __import__("os").environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a", encoding="utf-8") as output:
            output.write(f"tests_passed={'true' if failed == 0 else 'false'}\n")
            output.write(f"failed_count={failed}\n")
            output.write(f"passed_count={passed}\n")

    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(run_tests())
