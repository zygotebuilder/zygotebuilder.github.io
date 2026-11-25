# Zybot Community Ideas

## What this adds

The Community Lab page lets visitors describe an idea and opens a prefilled GitHub Issue. A GitHub account is required to submit. The page has no API key, token, database, or third-party AI dependency.

When an issue titled `[Community idea] ...` is opened, `.github/workflows/community-ideas.yml` invokes `handle_idea.py`.

The handler:
1. Parses the fixed fields from the issue body and enforces size limits.
2. Runs a transparent, rule-based completeness triage.
3. Stores a structured proposal record.
4. For sufficiently complete submissions, generates a text-only concept scaffold.
5. Creates a branch and Pull Request against `projects` for maintainer review.

## What it does not do

- It does not independently verify sources or scientific claims.
- It does not infer scientific equations from prose.
- It does not execute, import, or run submitter-provided code.
- It does not generate a finished scientific simulation.
- It cannot approve, merge, or publish a Pull Request.

The scaffold is deliberately labelled as unvalidated. A human must implement and test the actual model before calling it an experiment.

## GitHub setup

1. Push this repository to GitHub on the `projects` branch.
2. In **Settings → Actions → General → Workflow permissions**, enable **Read and write permissions** for `GITHUB_TOKEN`. The workflow grants only the permissions it needs at job level.
3. Ensure Actions are enabled for the repository.
4. Open `programs/community-lab/` on the deployed site and submit a test idea.
5. Confirm that an issue, evaluation comment, branch, and PR are created.
6. Review the PR. Do not merge an unverified scaffold.

GitHub Pages is static hosting; the page itself cannot securely hold a GitHub token or run Python. GitHub Actions is the backend for this first version.

## Local tests

From the repository root:

```bash
python -m unittest bot.community.test_handle_idea -v
python bot/tester/test_projects.py
```

## Extending the compiler

A reliable natural-language-to-scientific-simulation coder is not present yet. The current local character RNN is a small experimental text model and is intentionally not trusted with code generation. The next responsible step is a typed experiment specification (variables, units, equations, assumptions, expected ranges, and test cases), with a library of reviewed simulation components. Zybot can then assemble code from validated components and submit it for review.
