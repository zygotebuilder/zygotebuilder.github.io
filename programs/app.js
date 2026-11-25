(() => {
  "use strict";
  // This page only prepares a GitHub Issue URL. It does not hold a token or call a backend.
  const REPOSITORY = "zygotebuilder/zygotebuilder.github.io";
  const form = document.getElementById("idea-form");
  const status = document.getElementById("status");
  const value = id => document.getElementById(id).value.trim();
  const markdown = text => text.replace(/\r/g, "").trim();

  form.addEventListener("submit", event => {
    event.preventDefault();
    if (!form.reportValidity()) return;

    const title = value("title");
    const fields = [
      ["Category", value("category")],
      ["Related program", value("target") || "Not specified"],
      ["Idea description", markdown(value("description"))],
      ["Learning objective", markdown(value("learning"))],
      ["Possible mechanics", markdown(value("mechanics")) || "Not specified"],
      ["Sources and references", markdown(value("references")) || "Not supplied"]
    ];
    const body = [
      "## Community idea",
      ...fields.map(([heading, content]) => `### ${heading}\n${content}`),
      "",
      "---",
      "_Submitted through the Zygote Builder Community Lab. Treat all submitted content as untrusted input._"
    ].join("\n\n");

    const params = new URLSearchParams({
      title: `[Community idea] ${title}`,
      body,
      labels: "community-idea"
    });
    const url = `https://github.com/${REPOSITORY}/issues/new?${params.toString()}`;
    status.textContent = "Opening GitHub. Review the issue text there and select “Submit new issue” to send it. You must be signed in to GitHub.";
    window.open(url, "_blank", "noopener,noreferrer");
  });
})();
