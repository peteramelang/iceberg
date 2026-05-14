---
slug: prompting-for-code
title: Prompting for Code
phase: ai-assisted-development
order: 1
summary: >-
  Ask AI coding tools for code that compiles, runs, and matches your codebase
  conventions — through clear intent, examples, and constraints.
tldr: >-
  Be specific about what you want, show examples of your codebase style, and
  break complex requests into steps. Better prompts yield better code.
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
  Prompting for code is not a soft skill that autocomplete power users stumble
  into — it's a structured practice with real leverage, and the difference
  between developers who get consistent value from AI coding tools and those who
  find them unreliable often comes down to how precisely they specify what they
  want. The model responds to the intent you express, not the intent you have in
  your head. A vague request produces a reasonable interpretation of what you
  might have meant, which is a different thing from what you actually needed.
  Developing the habit of specifying the output format, the constraints, the
  patterns to follow, and the scope of change turns AI coding tools from
  hit-or-miss to reliable.


  The 80/20 of effective code prompting is specificity and constraints.
  Specificity means stating what you want in terms of the concrete artifact — a
  function with this signature, an interface with these fields, a test that
  covers this edge case — rather than describing the goal at an abstract level.
  Constraints mean telling the model what not to do as explicitly as what to do:
  don't add new dependencies, don't refactor unrelated code, don't introduce
  abstractions that aren't already in this codebase. The 'do not' constraints
  are often more important than the positive instructions because they prevent
  the model from doing something technically correct but unwanted. Few-shot
  examples — showing the model one or two instances of the pattern you want —
  are the highest-leverage single technique for matching codebase conventions.


  The dominant failure mode for experienced developers is underspecifying
  because they know what they mean. The model doesn't share your context, your
  mental model of the architecture, or your opinions about what good code looks
  like in this codebase. What feels like obvious context to you — 'add error
  handling' — is genuinely ambiguous to a model that has seen error handling
  implemented hundreds of different ways. Being explicit feels pedantic until
  you've spent time debugging AI output that was plausibly correct but didn't
  match your system. The pedantry pays off.


  The meta-skill is distinguishing between a prompting problem and a capability
  problem. When the model produces plausible-but-wrong output, the question is:
  would a better-specified prompt fix this, or is this a domain where the model
  genuinely lacks reliable capability? Prompting problems respond to iteration —
  more specific constraints, examples, a different framing. Capability limits
  don't: even with excellent prompts, the model will produce confidently wrong
  output for things it's not reliable on. Learning to make that distinction
  quickly — and knowing when to break a complex task into smaller, more
  precisely specified sub-prompts — is what separates professional use of AI
  coding tools from the amateur version.


  Prompting for code sits as the foundational layer of everything else in
  AI-assisted development. Context engineering determines what the model can
  see; prompting determines how precisely you direct what it does with what it
  sees. Good prompts make agent loops reliable, make AI review actionable, and
  make hallucination mitigation easier because the model has less reason to fill
  gaps with invented content when you've specified exactly what you need. It's
  also the skill with the lowest barrier to start improving — you don't need to
  change your tooling, you just need to be more explicit in the next
  conversation.
pitfalls:
  - title: 'Vague prompts produce generic, unshippable code'
    explanation: >-
      Prompts like 'add error handling' or 'refactor this function' leave the
      model to invent conventions, types, and patterns that don't match your
      codebase. Include the function signature, the error type to use, and an
      example of the pattern you expect.
  - title: Omitting what the model should NOT do
    explanation: >-
      AI models default to being helpful in ways you didn't ask for —
      refactoring unrelated code, adding logging you don't want, or importing
      new dependencies. Explicitly state out-of-scope actions to prevent them.
  - title: Confusing 'model at its capability limit' with 'bad prompt'
    explanation: >-
      Some failures are caused by an underconstrained prompt; others happen
      because the task genuinely exceeds what the model can do reliably in one
      shot. Diagnosing which is which prevents wasted iteration — break hard
      tasks into smaller sub-prompts rather than rephrasing indefinitely.
  - title: No examples means no pattern to match
    explanation: >-
      Describing a coding convention in prose is less reliable than showing the
      model an existing function that exemplifies it. Few-shot examples of the
      exact style — including file imports, error handling shape, and return
      type — dramatically reduce style drift.
  - title: Accepting first output without iterative refinement
    explanation: >-
      First-pass AI code is a draft, not a final answer. The discipline of
      treating it as a starting point — running it, checking edge cases, and
      asking targeted follow-up questions — is where most of the value is
      captured.
codeExamples:
  - language: bash
    title: Structured Prompt Template for Code Tasks
    code: >-
      #!/usr/bin/env bash

      # A reusable prompt template that produces consistent, on-convention code.

      # Pass GOAL, LANG, PATTERN_FILE, and CONSTRAINT as env vars or args.


      GOAL="${1:-Add rate limiting to the /api/login endpoint}"

      LANG="${2:-typescript}"

      PATTERN_FILE="${3:-src/middleware/auth.ts}"

      CONSTRAINT="${4:-Use our existing RateLimiter class. No new npm
      packages.}"


      read -r -d '' PROMPT << ENDOFPROMPT

      You are a ${LANG} expert. Implement the following:


      Goal: ${GOAL}


      Constraints:

      - ${CONSTRAINT}

      - Match the style and patterns in the reference file exactly.

      - Do NOT refactor unrelated code.

      - Do NOT add comments unless they explain non-obvious logic.

      - Output ONLY the changed file contents, no explanation.


      Reference file (${PATTERN_FILE}):

      $(cat "${PATTERN_FILE}" 2>/dev/null || echo "(file not found)")

      ENDOFPROMPT


      echo "$PROMPT" | claude --print
    reasoning: >-
      A bash template demonstrating the key structural elements of an effective
      code prompt: goal, explicit constraints, a negative example of what NOT to
      do, and a reference pattern file.
difficulty: beginner
estimatedHours: 3
lastUpdatedAt: '2026-05-14T12:31:47.537Z'
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
