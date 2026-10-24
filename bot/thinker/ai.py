import json
import re
from collections import Counter


MAX_CONTEXT_CHARS = 12000
MAX_ITEMS_PER_CATEGORY = 10
MAX_ITEM_CHARS = 500

CATEGORIES = (
    "observations",
    "potential_problems",
    "patterns",
    "creative_ideas",
    "questions_for_human",
)


def _section(context, title):
    """Extract one named section from build_context() output."""
    marker = f"{title}\n{'=' * len(title)}\n"
    start = context.find(marker)

    if start == -1:
        return ""

    start += len(marker)
    next_section = re.search(
        r"\n[A-Z][A-Z0-9 _—-]+\n={3,}\n",
        context[start:],
    )

    if next_section:
        return context[start:start + next_section.start()].strip()

    return context[start:].strip()


def _item(kind, text, evidence):
    return {
        "kind": kind,
        "text": text[:MAX_ITEM_CHARS],
        "evidence": evidence[:5],
    }


def _commit_facts(context):
    section = _section(context, "LATEST COMMIT")
    if not section or "unavailable" in section.lower():
        return []

    lines = [line.strip() for line in section.splitlines() if line.strip()]
    if not lines:
        return []

    commit_hash = next(
        (line for line in lines if re.fullmatch(r"[0-9a-fA-F]{7,64}", line)),
        "",
    )

    if not commit_hash:
        return []

    author = lines[1] if len(lines) > 1 else "Unknown author"
    date = lines[2] if len(lines) > 2 else "Unknown date"
    subject = lines[3] if len(lines) > 3 else "Unknown subject"

    evidence = [{
        "source": "git",
        "locator": f"commit:{commit_hash}",
        "detail": f"Author: {author}; date: {date}; subject: {subject}",
    }]

    return [
        _item(
            "fact",
            f"Latest commit: {subject} (author: {author}; date: {date}).",
            evidence,
        )
    ]


def _changed_files(context):
    section = _section(context, "MOST RECENT GIT CHANGE")
    if not section or "unavailable" in section.lower():
        return [], None

    files = []
    for line in section.splitlines():
        match = re.match(r"^\s*(.+?)\s+\|\s+\d+\s*(?:[+-]*)\s*$", line)
        if match:
            path = match.group(1).strip()
            if path and path.lower() != "file":
                files.append(path)

    summary = re.search(
        r"(\d+)\s+files? changed"
        r"(?:,\s*(\d+)\s+insertions?\(\+\))?"
        r"(?:,\s*(\d+)\s+deletions?\(-\))?",
        section,
    )

    stats = None
    if summary:
        stats = {
            "files_changed": int(summary.group(1)),
            "insertions": int(summary.group(2) or 0),
            "deletions": int(summary.group(3) or 0),
        }

    return files, stats


def _structure_facts(context):
    section = _section(context, "REPOSITORY STRUCTURE")
    if not section:
        return [], Counter(), False

    paths = []
    truncated = "[File listing truncated" in section

    for line in section.splitlines():
        path = line.strip()
        if (
            path
            and not path.startswith("[")
            and not path.endswith("=")
            and "/" in path or path.endswith((".html", ".css", ".js", ".py"))
        ):
            # Keep only path-looking entries, not section prose.
            if " " not in path:
                paths.append(path)

    extensions = Counter()
    for path in paths:
        match = re.search(r"\.([A-Za-z0-9]+)$", path)
        if match:
            extensions[match.group(1).lower()] += 1

    facts = []
    if paths:
        qualifier = "at least " if truncated else ""
        facts.append(
            _item(
                "fact",
                f"The supplied repository listing contains {qualifier}"
                f"{len(paths)} file paths.",
                [{
                    "source": "repository_structure",
                    "locator": "REPOSITORY STRUCTURE",
                    "detail": (
                        "The listing is truncated."
                        if truncated else
                        "Count derived from paths in the supplied listing."
                    ),
                }],
            )
        )

    return facts, extensions, truncated


def _history_facts(context):
    section = _section(context, "RECENT ARCHIVE HISTORY")
    if not section or "unavailable" in section.lower():
        return []

    try:
        records = json.loads(section)
    except (json.JSONDecodeError, TypeError):
        return []

    if not isinstance(records, list):
        return []

    valid = [
        record for record in records
        if isinstance(record, dict)
    ]

    if len(valid) < 2:
        return []

    commits = [
        str(record.get("commit", ""))
        for record in valid
        if record.get("commit")
    ]

    if len(commits) >= 2 and commits[-1] == commits[-2]:
        return [
            _item(
                "observation",
                "The two latest supplied history records reference the same commit.",
                [{
                    "source": "recent_archive_history",
                    "locator": "RECENT ARCHIVE HISTORY",
                    "detail": f"Commit: {commits[-1]}",
                }],
            )
        ]

    return []


def _test_context_present(context):
    lowered = context.lower()
    return any(
        marker in lowered
        for marker in (
            "test results:",
            "tester report:",
            "test summary:",
        )
    )


def analyze(context):
    """
    Produce evidence-linked findings from the supplied repository context.

    No generative model is trusted to create findings. The local RNN remains
    outside the evidence pipeline until it passes independent evaluations.
    """
    if not isinstance(context, str):
        context = str(context)

    context = context[:MAX_CONTEXT_CHARS]

    result = {category: [] for category in CATEGORIES}

    result["observations"].extend(_commit_facts(context))

    changed_files, stats = _changed_files(context)
    commit_section = _section(context, "LATEST COMMIT")
    commit_match = re.search(r"\b[0-9a-fA-F]{7,64}\b", commit_section)
    commit_hash = commit_match.group(0) if commit_match else "HEAD"

    for path in changed_files:
        result["observations"].append(
            _item(
                "fact",
                f"The latest change summary lists {path} as changed.",
                [{
                    "source": "git",
                    "locator": f"commit:{commit_hash}",
                    "detail": f"Path listed in MOST RECENT GIT CHANGE: {path}",
                }],
            )
        )

    if stats is not None:
        result["observations"].append(
            _item(
                "fact",
                f"The latest change summary reports {stats['files_changed']} "
                f"file(s) changed, {stats['insertions']} insertion(s), "
                f"and {stats['deletions']} deletion(s).",
                [{
                    "source": "git",
                    "locator": f"commit:{commit_hash}",
                    "detail": "Statistics reported by git show --stat.",
                }],
            )
        )

    structure_items, extensions, truncated = _structure_facts(context)
    result["observations"].extend(structure_items)

    if extensions:
        top_extensions = extensions.most_common(5)
        description = ", ".join(
            f".{extension}: {count}"
            for extension, count in top_extensions
        )
        qualifier = "At least " if truncated else ""
        result["patterns"].append(
            _item(
                "pattern",
                f"{qualifier}the supplied file listing has these common "
                f"extensions: {description}.",
                [{
                    "source": "repository_structure",
                    "locator": "REPOSITORY STRUCTURE",
                    "detail": (
                        "Extension counts are lower bounds because the "
                        "listing was truncated."
                        if truncated else
                        "Counts computed from the supplied file listing."
                    ),
                }],
            )
        )

    result["observations"].extend(_history_facts(context))

    if not _test_context_present(context):
        result["questions_for_human"].append(
            _item(
                "question",
                "Should Zybot ingest the tester's results so future reports "
                "can distinguish verified test failures from untested changes?",
                [{
                    "source": "context_limit",
                    "locator": "build_context",
                    "detail": "The supplied context contains no clearly labelled test-results section.",
                }],
            )
        )

    # Do not invent problems or community requests. Those categories remain
    # empty until relevant evidence is actually supplied.
    for category in CATEGORIES:
        result[category] = result[category][:MAX_ITEMS_PER_CATEGORY]

    return result


if __name__ == "__main__":
    from context import build_context

    print(json.dumps(analyze(build_context()), indent=2, ensure_ascii=False))
