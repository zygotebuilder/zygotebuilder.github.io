
import json
import re

from brain.inference import think


MAX_PROMPT_CHARS = 12000
MAX_RAW_PREVIEW_CHARS = 1000
MAX_ITEMS_PER_CATEGORY = 10
MAX_ITEM_CHARS = 500

CATEGORIES = (
    "observations",
    "potential_problems",
    "patterns",
    "creative_ideas",
    "questions_for_human"
)


def extract_json(text):
    """Extract a JSON object from the model's output."""

    if not isinstance(text, str):
        return None

    cleaned = text.strip()

    cleaned = re.sub(
        r"```(?:json)?\s*",
        "",
        cleaned,
        flags=re.IGNORECASE
    )

    cleaned = cleaned.replace("```", "").strip()

    decoder = json.JSONDecoder()

    # Try each opening brace so that a stray earlier brace
    # does not automatically invalidate the whole response.
    for match in re.finditer(r"\{", cleaned):
        try:
            candidate, _ = decoder.raw_decode(cleaned[match.start():])

            if isinstance(candidate, dict):
                return candidate

        except json.JSONDecodeError:
            continue

    return None


def clean_category(values):
    """Keep only a small, bounded amount of readable text."""

    if values is None:
        return []

    if isinstance(values, str):
        values = [values]
    elif not isinstance(values, (list, tuple)):
        values = [values]

    cleaned = []

    for value in values[:MAX_ITEMS_PER_CATEGORY]:
        if value is None:
            continue

        if isinstance(value, str):
            item = value
        else:
            try:
                item = json.dumps(value, ensure_ascii=False)
            except (TypeError, ValueError):
                item = str(value)

        item = item.strip()

        if not item:
            continue

        if len(item) > MAX_ITEM_CHARS:
            item = item[:MAX_ITEM_CHARS] + "... [truncated]"

        cleaned.append(item)

    return cleaned


def analyze(context):
    if not isinstance(context, str):
        context = str(context)

    # A final safety limit, even if the context builder changes later.
    context = context[:MAX_PROMPT_CHARS]

    prompt = (
        "You are Zybot, a repository laboratory assistant.\n"
        "Analyze the repository information below.\n"
        "Return one valid JSON object only, with these five keys:\n"
        "observations, potential_problems, patterns, creative_ideas, "
        "questions_for_human.\n"
        "Each value must be a short list of strings.\n"
        "Do not reproduce the input or previous AI responses.\n"
        "Keep each item concise.\n\n"
        "REPOSITORY CONTEXT:\n"
        f"{context}\n\n"
        "JSON OUTPUT:\n"
    )

    print("\n🧠 Zybot Brain is thinking...", flush=True)
    print(
        f"📏 Prompt length: {len(prompt)} characters.",
        flush=True
    )

    raw = think(prompt)

    if not isinstance(raw, str):
        raw = str(raw)

    print("\nRaw Zybot response preview:", flush=True)
    print(raw[:MAX_RAW_PREVIEW_CHARS], flush=True)

    if len(raw) > MAX_RAW_PREVIEW_CHARS:
        print(
            "\n[Response preview truncated for logging.]",
            flush=True
        )

    result = extract_json(raw)

    if result is None:
        print(
            "\n⚠️ Zybot returned unstructured output. "
            "It will not be saved as a full observation.",
            flush=True
        )

        return {
            "observations": [
                "The model returned unstructured output; "
                "no full response was archived."
            ],
            "potential_problems": [],
            "patterns": [],
            "creative_ideas": [],
            "questions_for_human": []
        }

    # Return only the five supported categories.
    # Unexpected keys and oversized values are discarded.
    cleaned_result = {}

    for category in CATEGORIES:
        cleaned_result[category] = clean_category(
            result.get(category, [])
        )

    return cleaned_result
