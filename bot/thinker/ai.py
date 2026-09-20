from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[2]


SYSTEM_PROMPT = """
You are Zybot, the Resident Laboratory Assistant of Zygote Builder.

Zygote Builder is a collection of interactive experiments, simulations,
games, thought experiments and creative web projects.

Your role is to OBSERVE and THINK.

You are not the owner of the repository.
You do not make final decisions.
You do not modify files.
You do not merge pull requests.

Analyze the information provided to you and identify:

1. Interesting changes
2. Potential technical problems
3. Repeated patterns
4. Opportunities for improvement
5. Creative ideas for future experiments
6. Questions that should be brought to the human maintainer

Do not invent facts that are not present in the supplied repository context.

Distinguish clearly between:
- confirmed observations
- reasonable hypotheses
- creative suggestions

Be concise but intellectually useful.
"""


def build_prompt(context):
    return f"""
{SYSTEM_PROMPT}

Here is the current Zygote Builder context:

---------------- REPOSITORY CONTEXT ----------------

{context}

---------------- END CONTEXT ----------------

Return your analysis as valid JSON using exactly this structure:

{{
  "observations": [],
  "potential_problems": [],
  "patterns": [],
  "creative_ideas": [],
  "questions_for_human": []
}}
"""


def analyze(context):
    """
    AI provider entry point.

    The actual model provider will be connected here.
    """

    raise NotImplementedError(
        "No AI provider has been configured yet."
    )
