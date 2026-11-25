import unittest
from .handle_idea import parse_issue_body, evaluate, build_draft, ROOT
import shutil


SAMPLE = """## Community idea

### Category
New simulation

### Related program
Dreamscape Panchabhuta

### Idea description
Create a simulation where visitors can explore how planetary atmosphere changes under different conditions. Let people change the variables and observe the outcomes.

### Learning objective
Understand that climate outcomes depend on interacting physical variables and assumptions.

### Possible mechanics
Allow users to adjust solar input, atmospheric composition, and rotation, then compare outputs across scenarios.

### Sources and references
A suitable textbook and peer-reviewed climate science references will be selected during implementation.

---
_Submitted through the Community Lab._
"""


class CommunityIdeaTests(unittest.TestCase):
    def test_issue_parser_reads_fields(self):
        fields = parse_issue_body(SAMPLE)
        self.assertEqual(fields["Category"], "New simulation")
        self.assertIn("planetary atmosphere", fields["Idea description"])
        self.assertIn("rotation", fields["Possible mechanics"])

    def test_evaluation_does_not_claim_scientific_validity(self):
        result = evaluate(parse_issue_body(SAMPLE))
        self.assertEqual(result["status"], "eligible-for-prototype-scaffold")
        self.assertIn("not scientific peer review", result["limits"][0])

    def test_missing_learning_objective_needs_clarification(self):
        fields = parse_issue_body(SAMPLE.replace(
            "### Learning objective\nUnderstand that climate outcomes depend on interacting physical variables and assumptions.\n\n", ""
        ))
        result = evaluate(fields)
        self.assertEqual(result["status"], "needs-clarification")
        self.assertIn("Learning objective", result["missing"])

    def test_body_size_is_bounded(self):
        with self.assertRaises(ValueError):
            parse_issue_body("x" * 12001)

    def test_generated_page_escapes_untrusted_html(self):
        number = 999999
        base = ROOT / "programs" / "community-lab" / "drafts" / f"idea-{number}"
        try:
            build_draft(number, "<script>alert(1)</script>", {
                "Category": "New simulation",
                "Related program": "None",
                "Idea description": "<img src=x onerror=alert(1)>",
                "Learning objective": "Learn safely",
                "Possible mechanics": "Use sliders",
                "Sources and references": "None",
            })
            page = (base / "index.html").read_text(encoding="utf-8")
            self.assertNotIn("<script>alert(1)</script>", page)
            self.assertIn("&lt;script&gt;", page)
            self.assertIn("&lt;img", page)
        finally:
            shutil.rmtree(base, ignore_errors=True)


if __name__ == "__main__":
    unittest.main(verbosity=2)
