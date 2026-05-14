---
slug: ai-code-review
title: AI Code Review
phase: ai-assisted-development
order: 4
summary: >-
  Use AI as a reviewer and as a reviewee — second-opinion workflows, regression
  checks, and review prompts that catch what tests miss.
tldr: >-
  Use AI to review code before human reviewers see it, catching bugs and missed
  tests automatically. Also get AI feedback on your own code to improve quality
  before shipping.
definition: >-
  AI code review encompasses two complementary workflows: using AI as a reviewer
  to catch bugs, style issues, and missing tests before human review; and using
  AI as a more receptive reviewee when you want a second opinion on your own
  code before you ship it. As a reviewer, AI tools can be configured to run
  automatically on pull requests, flagging potential null dereferences, security
  anti-patterns, and places where the implementation diverges from the spec —
  consistently and without reviewer fatigue. The key skill is writing review
  prompts that go beyond syntax to ask the right questions: 'Does this code
  handle the edge case where X is empty?', 'Are there missing error paths?',
  'What would break if this input changed?'


  Using AI as a reviewee — asking 'review my own code' — surfaces a different
  class of value. AI can explain why a reviewer might push back, suggest
  idiomatic rewrites, identify missing test coverage, and check that the
  implementation matches the original requirement. This self-review step, run
  before opening a PR, compresses review cycles by removing the most mechanical
  objections before a human ever sees the code.


  Effective teams combine both directions: automated AI pre-review bots (like
  CodeRabbit or Greptile) run on every PR and post inline comments, while
  developers also run manual AI review sessions for complex changes they're
  uncertain about. The discipline is in calibrating trust — AI reviewers miss
  semantic bugs that require business context, so human review remains essential
  for anything that crosses service boundaries, changes security-sensitive code,
  or alters public APIs. AI review adds the most value on boilerplate-heavy
  changes, large diffs, and regressions against known patterns.
shortExplainerVideo: null
narrative: >-
  Code review is one of those engineering rituals that everyone agrees is
  valuable and most teams systematically underinvest in. Reviewers get fatigued,
  PRs pile up, and the pressure to merge accumulates. AI code review doesn't fix
  the cultural problem, but it does handle the mechanical layer — the null
  checks, the error path gaps, the places where the implementation quietly
  diverges from the spec — before a human ever sees the diff. That's the actual
  value: not replacing human judgment, but arriving at human review with the
  cheap, high-volume catches already resolved so reviewers can spend their
  attention on the things that actually require it.


  The 80/20 of AI review in practice comes from running it in both directions.
  Using AI as a reviewer on incoming PRs — automated bots that post inline
  comments on every push — catches consistency issues and patterns you can
  enumerate in a prompt. But the direction teams underutilize is running AI
  review on your own code before you open a PR. Asking 'what would a reviewer
  push back on here?' before you put your code in front of colleagues is both
  more effective (you can fix things without the social friction of a review
  comment) and faster (you compress the cycle). These two directions are
  complementary, not redundant.


  The dominant failure mode is miscalibrated trust, and it cuts both ways. Teams
  that trust AI review too much stop reading the comments critically, which
  means the AI's systematic blind spots become the team's blind spots. AI review
  misses bugs that require business context: it doesn't know that this enum
  value is only valid in a specific workflow state, or that this API call will
  fail during the maintenance window your ops team runs on Tuesdays. Teams that
  trust AI review too little leave the tools running but don't act on the
  output, which is waste in a different direction. The right posture is to treat
  AI review output the way you'd treat a linter: act on it by default, override
  it when you have a reason, never ignore it completely.


  The effective mental model is to think of AI review as a first-pass triage
  layer that operates on enumerable patterns, not a second engineer with full
  context. It's reliable on things you can write rules about — and increasingly,
  AI-powered rules are more expressive than regex-based lint — but unreliable on
  anything requiring end-to-end business understanding. What AI review adds to
  the ecosystem is coverage and consistency: it reviews every PR with the same
  thoroughness on commit one as on commit one thousand, which no human reviewer
  team actually achieves at scale.


  In the wider AI-assisted development landscape, AI code review is probably the
  lowest-friction entry point for teams adopting AI tooling in their workflow.
  You don't need to change how developers write code; you just add a bot to the
  PR process. The tooling has matured enough — CodeRabbit, Greptile, GitHub's
  own Copilot review features — that setup is measured in hours, not weeks.
  Start there, instrument which comment categories are actionable versus noise,
  and tune from there. It's the rare AI feature that pays for itself in reviewer
  time saved within the first month.
pitfalls:
  - title: Rubber-stamping AI review output without reading it
    explanation: >-
      When an AI pre-review bot posts many inline comments, developers often
      dismiss them in bulk to get back to coding, missing the one comment that
      flags a real security bug. Treat AI review output as a triage list — scan
      every comment before dismissing any.
  - title: AI reviewer misses semantic and business-logic bugs
    explanation: >-
      AI reviewers excel at pattern-matching known anti-patterns but cannot
      reason about whether the code meets the actual product requirement or
      domain invariant. Human review remains mandatory for anything touching
      business rules, access control, or cross-service contracts.
  - title: Generic review prompts produce generic feedback
    explanation: >-
      Asking 'review this code' returns surface-level style notes. Asking 'does
      this handle the case where the user's subscription expires mid-request?'
      focuses the model on the specific risk. Invest in task-specific review
      prompts for high-stakes changes.
  - title: AI-generated code reviewed less skeptically than human code
    explanation: >-
      There is a psychological tendency to over-trust AI output because it looks
      polished and confident. AI code should receive at least the same scrutiny
      as code from a junior engineer — it can be subtly wrong in exactly the
      ways that look right on first read.
  - title: No calibration of AI review noise-to-signal ratio
    explanation: >-
      An AI bot that comments on every PR, including trivial nits, trains
      engineers to ignore it. Tune the review prompt and threshold so only
      actionable issues are surfaced, or reviewer fatigue will neutralize the
      benefit.
codeExamples:
  - language: typescript
    title: AI Pre-Review Pull Request Changes
    code: |-
      import Anthropic from "@anthropic-ai/sdk";
      import { execSync } from "node:child_process";

      const client = new Anthropic();

      async function reviewDiff(baseBranch = "main"): Promise<void> {
        const diff = execSync(`git diff ${baseBranch}...HEAD`, { encoding: "utf8" });

        if (!diff.trim()) {
          console.log("No changes to review.");
          return;
        }

        const response = await client.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 2048,
          system: [
            "You are a senior engineer performing a pre-merge code review.",
            "Focus on: correctness bugs, missing error handling, security issues, and N+1 queries.",
            "Label each finding: [BLOCKER], [WARNING], or [NIT].",
            "Skip style nits unless they cause bugs. Be concise."
          ].join(" "),
          messages: [
            {
              role: "user",
              content: `Review this diff:\n\n\`\`\`diff\n${diff.slice(0, 8000)}\n\`\`\``
            }
          ]
        });

        const text = response.content.find(b => b.type === "text");
        console.log("=== AI Pre-Review ===");
        console.log(text?.text ?? "(no output)");
      }

      reviewDiff().catch(console.error);
    reasoning: >-
      A runnable pre-review script that sends the actual git diff to Claude with
      a focused review prompt, producing labeled findings before a human
      reviewer opens the PR.
difficulty: beginner
estimatedHours: 3
lastUpdatedAt: '2026-05-14T12:31:47.525Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=3lFGkVRggSs'
      title: AI Code Review with CodeRabbit — Full Walkthrough
      author: CodeRabbit
      durationMinutes: 12
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Official CodeRabbit walkthrough showing AI-as-reviewer in a real PR
        workflow — practical and beginner-friendly with concrete before/after
        examples.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=EkzgPRqneyA'
      title: Building an AI Code Review System
      author: Anthropic
      durationMinutes: 45
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Deeper dive into designing AI code review workflows with tool use —
        covers prompt design, context feeding, and integrating with CI
        pipelines.
      source: ai-researcher
  articles:
    - url: 'https://coderabbit.ai/blog/ai-code-review-best-practices'
      title: AI Code Review Best Practices
      kind: engineering-blog
      reasoning: >-
        Practical guide from the leading AI code review platform covering prompt
        design, configuration, and how to calibrate AI review trust.
      publisher: CodeRabbit
      source: ai-researcher
    - url: >-
        https://github.blog/developer-skills/github-education/how-to-use-github-copilot-in-your-ide-tips-tricks-and-best-practices/
      title: 'How to Use GitHub Copilot in Your IDE: Tips, Tricks, and Best Practices'
      kind: engineering-blog
      reasoning: >-
        GitHub's official tips including using Copilot Chat for self-review —
        using AI as a reviewee before opening PRs.
      publisher: GitHub
      source: ai-researcher
    - url: 'https://www.greptile.com/blog/ai-code-review'
      title: 'AI Code Review: What Works, What Doesn''t'
      kind: engineering-blog
      reasoning: >-
        Greptile's honest analysis of where AI code review adds value and where
        it still falls short — important calibration for practitioners.
      publisher: Greptile
      source: ai-researcher
  services:
    - name: CodeRabbit
      url: 'https://coderabbit.ai'
      category: AI code review
      reasoning: >-
        Purpose-built AI PR reviewer that integrates with GitHub/GitLab, posts
        inline comments, and learns from dismissals — the market leader for
        automated AI review.
      vendor: CodeRabbit
      source: ai-researcher
    - name: Greptile
      url: 'https://greptile.com'
      category: AI code review
      reasoning: >-
        Codebase-aware AI reviewer that understands your entire repo's context —
        catches issues that require knowledge of how components interact.
      vendor: Greptile
      source: ai-researcher
    - name: GitHub Copilot
      url: 'https://github.com/features/copilot'
      category: AI coding assistant with review
      reasoning: >-
        Copilot Code Review feature brings inline AI suggestions directly into
        the GitHub PR review interface.
      vendor: GitHub / Microsoft
      source: ai-researcher
    - name: Sourcegraph Cody
      url: 'https://sourcegraph.com/cody'
      category: AI coding assistant
      reasoning: >-
        Codebase-aware AI assistant useful for self-review sessions —
        understands cross-file dependencies to give more accurate feedback.
      vendor: Sourcegraph
      source: ai-researcher
    - name: Cursor
      url: 'https://cursor.com'
      category: AI coding IDE
      reasoning: >-
        Cursor's inline review mode allows asking 'what's wrong with this code?'
        in context, making it effective for pre-PR self-review workflows.
      vendor: Anysphere
      source: ai-researcher
  courses:
    - url: 'https://learn.deeplearning.ai/courses/pair-programming-llm'
      title: Pair Programming with a Large Language Model
      provider: DeepLearning.AI
      paid: false
      reasoning: >-
        Covers using LLMs for code review, debugging, and improvement — directly
        applicable to both AI-as-reviewer and AI-as-reviewee workflows.
      instructor: Laurence Moroney
      source: ai-researcher
    - url: 'https://www.pluralsight.com/courses/github-copilot-getting-started'
      title: 'GitHub Copilot: Getting Started'
      provider: Pluralsight
      paid: true
      reasoning: >-
        Includes modules on using Copilot Chat for code review and improvement
        suggestions — practical for teams adopting AI review workflows.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.489Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
