from __future__ import annotations
import html
import json
import os
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MAX_BODY = 12000
MAX_FIELD = 3000
REQUIRED = ("Category", "Idea description", "Learning objective")


def parse_issue_body(body):
    if not isinstance(body, str) or len(body) > MAX_BODY:
        raise ValueError("Issue body is missing or exceeds the allowed size.")
    headings = ("Category", "Related program", "Idea description",
                "Learning objective", "Possible mechanics", "Sources and references")
    result = {}
    for heading in headings:
        match = re.search(rf"(?m)^### {re.escape(heading)}\s*\n", body)
        if not match:
            result[heading] = ""
            continue
        start = match.end()
        nxt = re.search(r"(?m)^### ", body[start:])
        end = start + nxt.start() if nxt else len(body)
        value = body[start:end].strip()
        value = re.split(r"\n---\s*\n", value, maxsplit=1)[0].strip()
        result[heading] = value[:MAX_FIELD]
    return result


def evaluate(fields):
    missing = [name for name in REQUIRED if not fields.get(name, "").strip()]
    desc, learning = fields.get("Idea description", ""), fields.get("Learning objective", "")
    mechanics, refs = fields.get("Possible mechanics", ""), fields.get("Sources and references", "")
    score = (2 if len(desc) >= 120 else 1 if len(desc) >= 40 else 0)
    score += (2 if len(learning) >= 60 else 1 if len(learning) >= 20 else 0)
    score += (2 if len(mechanics) >= 60 else 1 if len(mechanics) >= 20 else 0)
    score += 1 if refs and refs.lower() != "not supplied" else 0
    score += 1 if fields.get("Category") else 0
    score += 1 if fields.get("Related program", "").lower() not in ("", "not specified") else 0
    status = "needs-clarification" if missing else (
        "eligible-for-prototype-scaffold" if score >= 6 else "needs-human-review")
    return {"score": score, "maximum": 9, "status": status, "missing": missing,
            "limits": ["Rule-based completeness triage, not scientific peer review.",
                       "References are not independently verified.",
                       "A high score is not proof of correctness or acceptance."]}


def run(args, check=True):
    return subprocess.run(args, cwd=ROOT, text=True, capture_output=True, check=check)


def safe(value):
    return html.escape(value or "Not supplied", quote=True)


def build_draft(issue_number, title, fields):
    base = ROOT / "programs" / "community-lab" / "drafts" / f"idea-{issue_number}"
    base.mkdir(parents=True, exist_ok=True)
    sections = [("Idea description", fields.get("Idea description", "")),
                ("Learning objective", fields.get("Learning objective", "")),
                ("Possible mechanics", fields.get("Possible mechanics", "")),
                ("Sources and references", fields.get("Sources and references", ""))]
    cards = "\n".join(f'<section><h2>{safe(h)}</h2><p>{safe(v)}</p></section>' for h, v in sections)
    page = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Draft concept: {safe(title)} · Zygote Builder</title><link rel="stylesheet" href="./style.css"></head>
<body><main><a class="back" href="../../index.html">← Community Lab</a>
<p class="eyebrow">ZYBOT-GENERATED CONCEPT DRAFT · ISSUE #{issue_number}</p><h1>{safe(title)}</h1>
<p class="warning">CONCEPT SCAFFOLD — NOT A SCIENTIFICALLY VALIDATED SIMULATION</p>
<p class="meta">Category: {safe(fields.get("Category", ""))} · Target: {safe(fields.get("Related program", "Not specified"))}</p>
{cards}
<section class="review"><h2>Before this becomes an experiment</h2><ol>
<li>Verify the scientific model and cite primary sources.</li><li>Define variables, units, assumptions, and boundary conditions.</li>
<li>Implement the actual mechanics; this scaffold intentionally does not invent them.</li>
<li>Test numerical behaviour, accessibility, and browser performance.</li><li>Obtain maintainer approval before merging or publishing.</li>
</ol></section><footer>Prepared by Zybot from public issue #{issue_number}. Submitted text is displayed as text, never executed.</footer></main></body></html>'''
    css = '''*{box-sizing:border-box}body{margin:0;background:#07111d;color:#edf5ff;font:16px/1.7 system-ui,sans-serif}main{width:min(820px,90vw);margin:7vh auto 12vh}.back{color:#8ddfff;text-decoration:none}.eyebrow{font:12px monospace;letter-spacing:.16em;color:#8ddfff;margin-top:48px}h1{font-size:clamp(2.5rem,8vw,5rem);line-height:1.02;letter-spacing:-.05em;margin:14px 0}.warning{display:inline-block;background:#4a351b;color:#ffd58d;padding:7px 12px;border-radius:6px;font:11px monospace;letter-spacing:.08em}.meta{color:#9aadc0;font-size:13px}section{background:#0e1d2c;border:1px solid #233c52;border-radius:14px;padding:22px;margin:18px 0}h2{font-size:1.1rem;margin:0 0 8px;color:#8ddfff}p,li{overflow-wrap:anywhere}section p{white-space:pre-wrap;color:#c5d4e3;margin:0}.review li{margin:8px 0}footer{color:#8296aa;font-size:12px;margin-top:28px}'''
    (base / "index.html").write_text(page, encoding="utf-8")
    (base / "style.css").write_text(css, encoding="utf-8")
    return base


def main():
    event_path = os.environ.get("GITHUB_EVENT_PATH")
    if not event_path:
        raise RuntimeError("GITHUB_EVENT_PATH is unavailable.")
    event = json.loads(Path(event_path).read_text(encoding="utf-8"))
    issue = event.get("issue", {})
    number, title, body = int(issue.get("number", 0)), str(issue.get("title", ""))[:120], str(issue.get("body", ""))
    if not number or not title.startswith("[Community idea]"):
        print("Not a Community Lab idea; no action.")
        return 0
    fields = parse_issue_body(body)
    evaluation = evaluate(fields)
    branch = f"zybot/community-idea-{number}"

    existing = run(["gh", "pr", "list", "--head", branch, "--state", "all", "--json", "url", "--jq", ".[0].url"], check=False)
    if existing.returncode == 0 and existing.stdout.strip():
        print(f"Proposal PR already exists: {existing.stdout.strip()}")
        return 0

    proposal_dir = ROOT / "bot" / "community" / "proposals"
    proposal_dir.mkdir(parents=True, exist_ok=True)
    proposal_path = proposal_dir / f"idea-{number}.json"
    proposal_path.write_text(json.dumps({"issue": number, "title": title, "fields": fields,
        "evaluation": evaluation, "generated_by": "Zybot rule-based Community Evaluator",
        "human_review_required": True}, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    draft = None
    if evaluation["status"] == "eligible-for-prototype-scaffold":
        draft = build_draft(number, title.removeprefix("[Community idea] ").strip(), fields)

    summary = (f"## Zybot community evaluation\n\n- **Triage:** `{evaluation['status']}`\n"
        f"- **Completeness score:** {evaluation['score']}/{evaluation['maximum']}\n"
        f"- **Missing required fields:** {', '.join(evaluation['missing']) if evaluation['missing'] else 'None'}\n\n"
        "This is rule-based completeness triage only. It does not establish scientific accuracy, feasibility, originality, or acceptance. References have not been independently verified.\n\n"
        "### Safety and control\n- Submission text was treated as untrusted data and was not executed.\n"
        "- No external AI service or pretrained model was used.\n"
        "- A maintainer must review every change. Zybot cannot merge or publish.\n")
    if draft:
        summary += f"\nA text-only concept scaffold was prepared in `{draft.relative_to(ROOT).as_posix()}`. It deliberately does not invent scientific equations or claim to be a working simulation.\n"
    else:
        summary += "\nNo prototype scaffold was generated; the proposal needs clarification or human review. A structured proposal record is included.\n"

    # Labels are created idempotently; failure to create them must not erase the proposal.
    run(["gh", "label", "create", "community-idea", "--description", "Ideas submitted through the Zygote Builder Community Lab", "--color", "1D76DB", "--force"], check=False)
    run(["gh", "label", "create", "zybot", "--description", "Automated Zybot activity; requires human review", "--color", "6F42C1", "--force"], check=False)
    run(["gh", "issue", "edit", str(number), "--add-label", "community-idea"], check=False)
    run(["gh", "issue", "comment", str(number), "--body", summary], check=False)
    if evaluation["status"] != "eligible-for-prototype-scaffold":
        print("Triage complete. No Pull Request was created; the idea needs clarification or human review.")
        return 0
    run(["git", "config", "user.name", "Zybot"])
    run(["git", "config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"])
    remote_branch = run(["git", "ls-remote", "--heads", "origin", f"refs/heads/{branch}"], check=False)
    if remote_branch.stdout.strip():
        run(["git", "fetch", "origin", branch])
        run(["git", "checkout", "-B", branch, f"origin/{branch}"])
    else:
        run(["git", "checkout", "-b", branch])
    run(["git", "add", proposal_path.relative_to(ROOT).as_posix()])
    if draft:
        run(["git", "add", draft.relative_to(ROOT).as_posix()])
    staged = run(["git", "diff", "--cached", "--quiet"], check=False)
    if staged.returncode != 0:
        run(["git", "commit", "-m", f"🤖 Zybot: evaluate community idea #{number}"])
        run(["git", "push", "--set-upstream", "origin", branch])
    pr_body = ("## Community idea #" + str(number) + "\n\n" + summary +
        "\n### Maintainer checklist\n- [ ] Review the original public issue and evaluation.\n"
        "- [ ] Verify scientific claims and references independently.\n"
        "- [ ] Decide whether to implement, revise, or close the proposal.\n"
        "- [ ] Replace any scaffold with a tested experiment before presenting it as complete.\n\n"
        "**This PR is not approved for publication by Zybot. Merge only after human review.**")
    pr_result = run(["gh", "pr", "create", "--draft", "--base", "projects", "--head", branch,
         "--title", f"🤖 Zybot: community idea #{number} — {evaluation['status']}",
         "--body", pr_body, "--label", "zybot,community-idea"], check=False)
    if pr_result.returncode != 0:
        raise RuntimeError("The proposal branch was pushed, but GitHub could not create the Pull Request: " + pr_result.stderr[-1200:])
    print(json.dumps({"issue": number, "evaluation": evaluation, "draft": str(draft) if draft else None}, indent=2))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        print(f"Zybot community handler failed: {exc}", file=sys.stderr)
        raise
