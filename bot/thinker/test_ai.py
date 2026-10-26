import json
import unittest

from ai import CATEGORIES, analyze


def make_context(
    commit=None,
    changes=None,
    structure=None,
    history=None,
):
    sections = {
        "REPOSITORY STRUCTURE": structure or "",
        "RECENT ARCHIVE HISTORY": history or "[]",
        "PREVIOUS THOUGHT METADATA — NO PREVIOUS AI TEXT": "[]",
        "LATEST COMMIT": commit or "Git commit information unavailable.",
        "MOST RECENT GIT CHANGE": changes or "Git change information unavailable.",
    }

    parts = []

    for title, content in sections.items():
        parts.append(
            f"{title}\n{'=' * len(title)}\n{content}\n"
        )

    return "\n".join(parts)


class TestZybotAnalyzer(unittest.TestCase):

    def test_all_five_categories_are_present(self):
        result = analyze(make_context())

        self.assertEqual(set(result.keys()), set(CATEGORIES))

    def test_every_category_contains_a_list(self):
        result = analyze(make_context())

        for category in CATEGORIES:
            with self.subTest(category=category):
                self.assertIsInstance(result[category], list)

    def test_verified_commit_is_reported_with_evidence(self):
        context = make_context(
            commit=(
                "a" * 40
                + "\nZybot\n"
                + "Sat Oct 24 12:00:00 2026 +0530\n"
                + "Add a new astronomy simulation"
            )
        )

        result = analyze(context)
        observations = result["observations"]

        self.assertTrue(observations)

        matching = [
            item for item in observations
            if "astronomy simulation" in item["text"]
        ]

        self.assertTrue(matching)
        self.assertTrue(matching[0]["evidence"])
        self.assertEqual(matching[0]["evidence"][0]["source"], "git")

    def test_changed_file_is_reported(self):
        context = make_context(
            commit=(
                "b" * 40
                + "\nDeveloper\n"
                + "Sat Oct 24 12:00:00 2026 +0530\n"
                + "Update simulation"
            ),
            changes=(
                "bbbbbbb Update simulation\n\n"
                " simulation.html | 12 +++++++++---\n"
                " 1 file changed, 9 insertions(+), 3 deletions(-)"
            ),
        )

        result = analyze(context)

        matching = [
            item for item in result["observations"]
            if "simulation.html" in item["text"]
        ]

        self.assertTrue(matching)
        self.assertTrue(matching[0]["evidence"])

    def test_file_structure_produces_extension_pattern(self):
        context = make_context(
            structure=(
                "index.html\n"
                "projects/orbit.html\n"
                "styles/main.css\n"
                "scripts/main.js\n"
            )
        )

        result = analyze(context)

        self.assertTrue(result["patterns"])
        self.assertTrue(
            any(".html" in item["text"] for item in result["patterns"])
        )

    def test_missing_evidence_does_not_create_a_problem(self):
        result = analyze(make_context())

        self.assertEqual(result["potential_problems"], [])
        self.assertEqual(result["creative_ideas"], [])

    def test_output_is_valid_json(self):
        result = analyze(
            make_context(
                commit=(
                    "c" * 40
                    + "\nZybot\n"
                    + "Sat Oct 24 12:00:00 2026 +0530\n"
                    + "Test JSON output"
                )
            )
        )

        serialized = json.dumps(result, ensure_ascii=False)
        restored = json.loads(serialized)

        self.assertEqual(set(restored.keys()), set(CATEGORIES))

    def test_findings_have_bounded_text_and_evidence(self):
        context = make_context(
            commit=(
                "d" * 40
                + "\nZybot\n"
                + "Sat Oct 24 12:00:00 2026 +0530\n"
                + "Inspect project"
            ),
            changes=(
                "project.html | 10 +++++-----\n"
                " 1 file changed, 5 insertions(+), 5 deletions(-)"
            ),
            structure="project.html\nstyle.css\nscript.js\n",
        )

        result = analyze(context)

        for category in CATEGORIES:
            self.assertLessEqual(len(result[category]), 10)

            for item in result[category]:
                self.assertLessEqual(len(item["text"]), 500)
                self.assertIsInstance(item["evidence"], list)
                self.assertLessEqual(len(item["evidence"]), 5)

    def test_history_pattern_requires_multiple_records(self):
        one_record = json.dumps([
            {"commit": "abc123", "timestamp": "2026-10-24"}
        ])

        result = analyze(make_context(history=one_record))

        self.assertFalse(
            any(
                "history records reference the same commit" in item["text"]
                for item in result["observations"]
            )
        )


if __name__ == "__main__":
    unittest.main(verbosity=2)
