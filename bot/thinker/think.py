from pathlib import Path
import json
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parents[2]

ARCHIVE_FILE = ROOT / "bot" / "archive" / "zybot-history.json"
THOUGHTS_FILE = ROOT / "bot" / "archive" / "zybot-thoughts.json"


def load_json(path, default):
    if not path.exists():
        return default

    try:
        return json.loads(
            path.read_text(encoding="utf-8")
        )
    except Exception:
        return default


def save_json(path, data):
    path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    path.write_text(
        json.dumps(
            data,
            indent=2,
            ensure_ascii=False
        ),
        encoding="utf-8"
    )


def compare_runs(previous, current):
    observations = []

    old_repo = previous.get("repository", {})
    new_repo = current.get("repository", {})

    old_files = old_repo.get("total_files", 0)
    new_files = new_repo.get("total_files", 0)

    difference = new_files - old_files

    if difference > 0:
        observations.append(
            f"Repository grew by {difference} file(s) "
            f"since the previous archived run."
        )

    elif difference < 0:
        observations.append(
            f"Repository decreased by {abs(difference)} "
            f"file(s) since the previous archived run."
        )

    else:
        observations.append(
            "Repository file count is unchanged "
            "since the previous archived run."
        )

    old_html = old_repo.get("html", 0)
    new_html = new_repo.get("html", 0)

    if new_html != old_html:
        observations.append(
            f"HTML file count changed from "
            f"{old_html} to {new_html}."
        )

    old_js = old_repo.get("javascript", 0)
    new_js = new_repo.get("javascript", 0)

    if new_js != old_js:
        observations.append(
            f"JavaScript file count changed from "
            f"{old_js} to {new_js}."
        )

    return observations


def generate_thoughts(history):
    runs = history.get("runs", [])

    thoughts = []

    if not runs:
        thoughts.append(
            "No historical data exists yet. "
            "Zybot needs more observations before identifying trends."
        )
        return thoughts

    latest = runs[-1]

    if len(runs) >= 2:
        previous = runs[-2]

        thoughts.extend(
            compare_runs(previous, latest)
        )

    else:
        thoughts.append(
            "This is the first archived run. "
            "Future runs will allow Zybot to identify changes."
        )

    repository = latest.get("repository", {})

    total = repository.get("total_files", 0)
    html = repository.get("html", 0)
    javascript = repository.get("javascript", 0)

    if total > 0:
        html_ratio = html / total

        if html_ratio > 0.60:
            thoughts.append(
                "HTML represents more than 60% of the "
                "repository's tracked files. "
                "Zybot may investigate whether project "
                "structure could be standardized."
            )

    if javascript >= 20:
        thoughts.append(
            "The repository contains a substantial number "
            "of JavaScript files. Zybot may eventually "
            "inspect repeated JavaScript patterns."
        )

    if len(runs) >= 5:
        thoughts.append(
            "Enough historical runs now exist for "
            "basic trend analysis."
        )

    return thoughts


def main():
    print("=" * 60)
    print("🧬 ZYBOT — THINKER")
    print("=" * 60)

    history = load_json(
        ARCHIVE_FILE,
        {"version": 1, "runs": []}
    )

    thoughts_history = load_json(
        THOUGHTS_FILE,
        {
            "version": 1,
            "thoughts": []
        }
    )

    thoughts = generate_thoughts(history)

    timestamp = datetime.now(
        timezone.utc
    ).isoformat()

    record = {
        "timestamp": timestamp,
        "commit": latest_commit(history),
        "observations": thoughts
    }

    thoughts_history["thoughts"].append(record)

    thoughts_history["thoughts"] = (
        thoughts_history["thoughts"][-100:]
    )

    save_json(
        THOUGHTS_FILE,
        thoughts_history
    )

    print("\n🧠 CURRENT THOUGHTS")
    print("-" * 60)

    for thought in thoughts:
        print(f"• {thought}")

    print("\n📚 Thoughts archived.")

    print("=" * 60)


def latest_commit(history):
    runs = history.get("runs", [])

    if not runs:
        return "unknown"

    return runs[-1].get(
        "commit",
        "unknown"
    )


if __name__ == "__main__":
    main()
