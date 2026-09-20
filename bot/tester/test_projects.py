from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]

IGNORED_DIRS = {
    ".git",
    ".github",
    "node_modules",
    "__pycache__"
}


def get_html_files():
    files = []

    for path in ROOT.rglob("*.html"):
        if not path.is_file():
            continue

        if any(part in IGNORED_DIRS for part in path.parts):
            continue

        files.append(path)

    return files


def test_html_file(path):
    problems = []

    try:
        content = path.read_text(encoding="utf-8", errors="ignore")
    except Exception as error:
        return [f"Could not read file: {error}"]

    # Basic HTML structure
    if "<html" not in content.lower():
        problems.append("Missing <html> element")

    if "<head" not in content.lower():
        problems.append("Missing <head> element")

    if "<body" not in content.lower():
        problems.append("Missing <body> element")

    # Check title
    if not re.search(r"<title[^>]*>.*?</title>", content, re.I | re.S):
        problems.append("Missing <title>")

    # Check script references
    for src in re.findall(r'<script[^>]+src=["\']([^"\']+)["\']', content, re.I):
        if src.startswith(("http://", "https://", "//")):
            continue

        referenced = (path.parent / src).resolve()

        if not referenced.exists():
            problems.append(f"Missing script: {src}")

    # Check stylesheet references
    for href in re.findall(r'<link[^>]+href=["\']([^"\']+)["\']', content, re.I):
        if href.startswith(("http://", "https://", "//", "#")):
            continue

        referenced = (path.parent / href).resolve()

        if not referenced.exists():
            problems.append(f"Missing stylesheet: {href}")

    return problems


def run_tests():
    html_files = get_html_files()

    total = len(html_files)
    passed = 0
    failed = 0

    print("=" * 55)
    print("🧬 ZYBOT — ZYGOTE BUILDER TESTER")
    print("=" * 55)

    print(f"\nHTML projects discovered: {total}")

    for file in sorted(html_files):
        relative = file.relative_to(ROOT)
        problems = test_html_file(file)

        if problems:
            failed += 1

            print(f"\n❌ {relative}")

            for problem in problems:
                print(f"   • {problem}")

        else:
            passed += 1
            print(f"✅ {relative}")

    print("\n" + "-" * 55)
    print("TEST SUMMARY")
    print("-" * 55)

    print(f"Passed: {passed}")
    print(f"Failed: {failed}")

    if failed == 0:
        print("\n🟢 All basic tests passed.")
    else:
        print(f"\n🟡 {failed} project(s) need attention.")

    print("\n" + "=" * 55)


if __name__ == "__main__":
    run_tests()
