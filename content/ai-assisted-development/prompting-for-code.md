---
slug: prompting-for-code
title: Prompting for Code
phase: ai-assisted-development
order: 1
summary: >-
  Ask AI coding tools for code that compiles, runs, and matches your codebase
  conventions — through clear intent, examples, and constraints.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Prompting for code is the skill of communicating with AI coding tools in ways
  that produce code that compiles, runs correctly, and matches your codebase's
  conventions — rather than generic, subtly wrong, or stylistically inconsistent
  output. The core insight is that AI coding tools are not search engines or
  autocomplete; they reason about the intent you express, so specificity and
  structure in your prompts directly improve output quality. A vague prompt
  ('add error handling') produces generic error handling; a precise prompt
  ('wrap this in a try/catch, log the error to our logger instance, and return a
  typed Result<T, AppError> matching our existing error pattern in
  src/lib/errors.ts') produces code you can actually ship.


  Effective prompting strategies for coding include: stating the desired output
  format explicitly (function signature, interface, test), providing examples of
  the pattern to follow (few-shot), listing constraints the code must satisfy
  (type safety, no new dependencies, must pass the existing test suite), and
  specifying what to NOT do (don't refactor unrelated code, don't add comments).
  Role prompting helps for complex tasks: 'You are a TypeScript expert reviewing
  for type safety edge cases' produces different, often better, review output
  than asking generically. Iterative refinement is legitimate — treat the first
  response as a draft and follow up with corrections.


  The meta-skill is recognizing when you've prompted poorly versus when the
  model is at the limit of its capability. Poor prompts produce
  plausible-but-wrong code; capability limits produce confidently wrong code
  even with excellent prompts. Calibrating this distinction — and knowing when
  to break a task into smaller, more precise sub-prompts — is the
  professional-level skill that separates developers who get consistent value
  from AI tools from those who find them unreliable.
shortExplainerVideo: null
narrative: >-
  Pending narrative — at least 400 characters of plain-English explanation of
  why this topic matters, what the dominant failure modes are, and how a learner
  should approach it. Replace this placeholder before publishing. Placeholder
  body. Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. 
pitfalls:
  - title: (pitfall 1 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
  - title: (pitfall 2 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
  - title: (pitfall 3 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
codeExamples:
  - language: typescript
    title: (pending)
    code: // pending code example with at least 20 chars of real code
    reasoning: pending
difficulty: intermediate
estimatedHours: 4
lastUpdatedAt: '2026-05-14T12:26:04.501Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=jC4v5AS4RIM'
      title: Prompt Engineering for Developers — Practical Techniques
      author: Fireship
      durationMinutes: 10
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Fireship's practical prompting techniques for developers — covers
        specificity, few-shot examples, and role prompting with coding-specific
        examples.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=dOxUroR57xs'
      title: Prompt Engineering Full Course — From Basics to Advanced Techniques
      author: freeCodeCamp.org
      durationMinutes: 75
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Comprehensive treatment of prompt engineering techniques including
        chain-of-thought, few-shot, and structured output — with extensive
        coding examples.
      source: ai-researcher
  articles:
    - url: >-
        https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineering/overview
      title: Prompt Engineering Overview — Anthropic Documentation
      kind: canonical-doc
      reasoning: >-
        Anthropic's comprehensive prompt engineering guide — the canonical
        reference for prompting Claude, including the specific techniques that
        work best for code generation.
      publisher: Anthropic
      source: ai-researcher
    - url: 'https://platform.openai.com/docs/guides/prompt-engineering'
      title: Prompt Engineering Guide — OpenAI Documentation
      kind: canonical-doc
      reasoning: >-
        OpenAI's official prompt engineering strategies including few-shot
        examples, role specification, and structured output for code generation.
      publisher: OpenAI
      source: ai-researcher
    - url: 'https://www.anthropic.com/engineering/claude-code-best-practices'
      title: Claude Code Best Practices
      kind: engineering-blog
      reasoning: >-
        Anthropic's practical guide to prompting Claude Code specifically —
        covers task decomposition, context structuring, and the coding-specific
        prompt patterns that work best.
      publisher: Anthropic
      source: ai-researcher
  services:
    - name: Claude Code
      url: 'https://claude.ai/code'
      category: AI coding agent
      reasoning: >-
        The primary tool for practicing coding-specific prompting — CLAUDE.md
        enables persistent prompt engineering that persists across sessions.
      vendor: Anthropic
      source: ai-researcher
    - name: Cursor
      url: 'https://cursor.com'
      category: AI coding IDE
      reasoning: >-
        Rich prompting features including .cursorrules for persistent prompt
        context, @-file references for precise context, and Composer for
        multi-step coded interactions.
      vendor: Anysphere
      source: ai-researcher
    - name: GitHub Copilot
      url: 'https://github.com/features/copilot'
      category: AI coding assistant
      reasoning: >-
        Copilot Chat supports custom instructions via
        .github/copilot-instructions.md — a concrete prompting-for-code artifact
        teams should learn to write well.
      vendor: GitHub / Microsoft
      source: ai-researcher
    - name: Aider
      url: 'https://aider.chat'
      category: AI coding agent
      reasoning: >-
        Terminal-based agent where prompt quality directly determines output
        quality — extensively documented conventions for effective coding
        prompts.
      vendor: Aider
      source: ai-researcher
    - name: Continue
      url: 'https://continue.dev'
      category: AI coding assistant (open-source)
      reasoning: >-
        Open-source VS Code/JetBrains assistant with configurable system prompts
        and slash commands — good for experimenting with prompting strategies.
      vendor: Continue
      source: ai-researcher
  courses:
    - url: >-
        https://www.deeplearning.ai/short-courses/prompt-engineering-for-developers/
      title: ChatGPT Prompt Engineering for Developers
      provider: DeepLearning.AI
      paid: false
      reasoning: >-
        The canonical introductory course on prompt engineering for developers —
        covers all the core techniques with code-generation examples throughout.
      instructor: 'Isa Fulford, Andrew Ng'
      source: ai-researcher
    - url: 'https://learn.deeplearning.ai/courses/pair-programming-llm'
      title: Pair Programming with a Large Language Model
      provider: DeepLearning.AI
      paid: false
      reasoning: >-
        Focused specifically on prompting patterns for coding tasks — code
        review, debugging, refactoring, and test generation with concrete prompt
        templates.
      instructor: Laurence Moroney
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.501Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
