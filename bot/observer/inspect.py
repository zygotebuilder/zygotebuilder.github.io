from pathlib import Path
from collections import Counter

ROOT = Path(__file__).resolve().parents[2]

IGNORED_DIRS = {
    ".git",
    ".github",
    "node_modules",
    "__pycache__",
}

EXTENSIONS = {
    ".html": "HTML",
    ".css": "CSS",
    ".js": "JavaScript",
    ".py": "Python",
    ".md": "Markdown",
    ".json": "JSON",
    ".svg": "SVG",
    ".png": "PNG",
    ".jpg": "JPEG",
    ".jpeg": "JPEG",
    ".webp": "WebP",
    ".gif": "GIF",
    ".mp3": "Audio",
    ".wav": "Audio",
    ".mp4": "Video",
}


def get_files():
    files = []

    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue

        if any(part in IGNORED_DIRS for part in path.parts):
            continue

        files.append(path)

    return files


def inspect_repository():
    files = get_files()

    categories = Counter()
    large_files = []
    projects = set()

    for file in files:
        category = EXTENSIONS.get(file.suffix.lower(), "Other")
        categories[category] += 1

        size_mb = file.stat().st_size / (1024 * 1024)

        if size_mb >= 5:
            large_files.append((file.relative_to(ROOT), size_mb))

        relative = file.relative_to(ROOT)

        if len(relative.parts) > 1:
            projects.add(relative.parts[0])

    print("=" * 50)
    print("🧬 ZYBOT — ZYGOTE BUILDER OBSERVER")
    print("=" * 50)

    print(f"\nFiles discovered: {len(files)}")

    print("\nFILE TYPES")
    print("-" * 30)

    for category, count in sorted(categories.items()):
        print(f"{category:<15} {count}")

    print("\nTOP-LEVEL PROJECT/DIRECTORY AREAS")
    print("-" * 30)

    for project in sorted(projects):
        print(f"• {project}")

    if large_files:
        print("\nLARGE FILES (>5 MB)")
        print("-" * 30)

        for file, size in sorted(large_files, key=lambda x: x[1], reverse=True):
            print(f"• {file} — {size:.2f} MB")
    else:
        print("\nLARGE FILES")
        print("-" * 30)
        print("None detected.")

    print("\n" + "=" * 50)
    print("Observation complete.")
    print("=" * 50)


if __name__ == "__main__":
    inspect_repository()
