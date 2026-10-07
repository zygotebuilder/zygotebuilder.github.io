"""Merge words exported from the site ("Copy my words as JSON") into data/community.json.
Usage: python tools/merge_community.py submission.json
Skips duplicates (same word, case-insensitive) and anything that isn't a clean 3-24 letter word."""
import json, re, sys
tgt = "data/community.json"
cur = json.load(open(tgt, encoding="utf-8"))
seen = {c["word"].lower() for c in cur}
added = 0
for c in json.load(open(sys.argv[1], encoding="utf-8")):
    w = str(c.get("word", "")).lower().strip()
    m = str(c.get("meaning", "")).strip()[:140]
    if re.fullmatch(r"[a-z]{3,24}", w) and len(m) >= 8 and w not in seen:
        cur.append({"word": w, "meaning": m, "parts": c.get("parts", []), "by": c.get("by", "anon"), "t": c.get("t", 0)})
        seen.add(w); added += 1
json.dump(cur, open(tgt, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print(f"{added} new word(s); {len(cur)} total")
