"""Build data/words.json from the public-domain Webster's 1913 dictionary.
Usage: python tools/build_dictionary.py [path/to/dictionary_compact.json]
Source: github.com/matthewreagan/WebstersEnglishDictionary (download the file first)."""
import json, re, sys
src = sys.argv[1] if len(sys.argv) > 1 else "dictionary_compact.json"
raw = json.load(open(src, encoding="utf-8"))
out = {}
for w, d in raw.items():
    w = w.strip().lower()
    if not re.fullmatch(r"[a-z]{3,10}", w): continue
    d = re.sub(r"\s+", " ", re.sub(r"\([^)]*\)|\[[^\]]*\]", "", d)).strip()
    d = re.split(r"(?<=[a-z])[.;] ", d)[0].strip(" .;")
    if len(d) < 12 or re.match(r"(see|of or|pl\b|imp\b|p\. ?p)", d, re.I): continue
    if len(d) > 105: d = d[:102].rsplit(" ", 1)[0] + "…"
    out[w] = d[0].upper() + d[1:] + ("" if d.endswith("…") else ".")
words = sorted(out.items())
json.dump(words, open("data/words.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(words), "words written")


