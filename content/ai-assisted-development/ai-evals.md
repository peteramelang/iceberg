---
slug: ai-evals
title: AI Evals
phase: ai-assisted-development
order: 6
summary: >-
  Measure whether AI features (or AI-assisted workflows) actually work — offline
  test sets, online metrics, golden examples, regression catches.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  AI evals are systematic tests that measure whether an AI feature or
  AI-assisted workflow produces outputs that meet defined quality standards —
  the analog of unit and integration tests for AI behavior. An eval typically
  consists of a set of input examples (prompts, user queries, or code tasks),
  expected outputs or grading criteria, and an automated judge (often another
  model, a heuristic, or a human rubric) that scores each response. The goal is
  to detect regressions when you change a prompt, switch models, or update
  context — catching quality drops before they reach users.


  Evals come in several flavors: offline evals run against a fixed 'golden set'
  of examples (fast and deterministic — good for CI), online evals sample live
  production traffic and use delayed human or model judgments (catches
  distribution shift), and pairwise evals compare two versions head-to-head on
  the same inputs (the most sensitive way to detect subtle quality changes). For
  AI coding tools specifically, evals often measure task completion rate (did
  the agent successfully implement the feature?), code correctness (do the tests
  pass?), and stylistic fidelity (does the generated code match your codebase
  conventions?).


  Building an eval culture requires three things: a growing golden set of
  examples that represent real usage, a grading rubric that can be applied
  consistently, and a CI integration that runs evals on every prompt or model
  change. The hardest part is the grading rubric — 'good code' is subjective, so
  teams typically start with functional correctness (tests pass), add
  deterministic checks (TypeScript compiles, no linter errors), and layer in
  model-as-judge for harder qualities (readability, idiomatic style). Hamel
  Husain's writing and the Braintrust/LangSmith ecosystems are the leading
  practitioner sources for eval methodology.
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
lastUpdatedAt: '2026-05-14T12:26:04.493Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=r-NMdxkFWJ4'
      title: LLM Evals Explained — How to Test Your AI Applications
      author: Hamel Husain
      durationMinutes: 15
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Hamel Husain is the canonical practitioner voice on LLM evals — this
        talk distills his framework for building practical eval systems.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=MT3a4R8cRk0'
      title: Building LLM Evaluation Systems — Braintrust Deep Dive
      author: Braintrust
      durationMinutes: 60
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Comprehensive walkthrough of offline, online, and pairwise eval patterns
        using Braintrust — covers CI integration and model-as-judge techniques.
      source: ai-researcher
  articles:
    - url: 'https://hamel.dev/blog/posts/evals/'
      title: Your AI Product Needs Evals
      kind: engineering-blog
      reasoning: >-
        Hamel Husain's seminal post on eval methodology — the most cited
        practitioner piece on building practical LLM evaluation systems.
      author: Hamel Husain
      source: ai-researcher
    - url: 'https://docs.anthropic.com/en/docs/test-and-evaluate/eval-process'
      title: The Eval Process — Anthropic Documentation
      kind: canonical-doc
      reasoning: >-
        Anthropic's canonical guide to building evals for Claude-based
        applications — covers golden sets, grading, and CI integration patterns.
      publisher: Anthropic
      source: ai-researcher
    - url: >-
        https://cookbook.openai.com/examples/evaluation/getting_started_with_openai_evals
      title: Getting Started with OpenAI Evals
      kind: canonical-doc
      reasoning: >-
        OpenAI's practical cookbook entry on running evals — model-agnostic
        patterns applicable to any LLM-based coding tool.
      publisher: OpenAI
      source: ai-researcher
  services:
    - name: Braintrust
      url: 'https://braintrust.dev'
      category: LLM evaluation platform
      reasoning: >-
        Purpose-built eval platform with golden set management, model-as-judge
        grading, CI integration, and experiment tracking — the leading dedicated
        eval tool.
      vendor: Braintrust
      source: ai-researcher
    - name: LangSmith
      url: 'https://smith.langchain.com'
      category: LLM observability and evals
      reasoning: >-
        Provides dataset management, eval runners, and online sampling from
        production traces — tightly integrated with LangChain-based
        applications.
      vendor: LangChain
      source: ai-researcher
    - name: Promptfoo
      url: 'https://promptfoo.dev'
      category: Prompt testing and evaluation
      reasoning: >-
        Open-source CLI tool for running evals against prompts — easy to add to
        CI pipelines and supports multiple model providers and graders.
      vendor: Promptfoo
      source: ai-researcher
    - name: Langfuse
      url: 'https://langfuse.com'
      category: LLM observability and evals
      reasoning: >-
        Open-source observability platform with eval scoring, human annotation,
        and dataset management — self-hostable for privacy-sensitive workloads.
      vendor: Langfuse
      source: ai-researcher
    - name: Phoenix (Arize)
      url: 'https://phoenix.arize.com'
      category: LLM observability and evals
      reasoning: >-
        Arize's open-source LLM observability tool with built-in eval templates
        including hallucination detection, relevance, and code quality scoring.
      vendor: Arize AI
      source: ai-researcher
  courses:
    - url: 'https://learn.deeplearning.ai/courses/evaluating-debugging-generative-ai'
      title: Evaluating and Debugging Generative AI Models Using Weights & Biases
      provider: DeepLearning.AI
      paid: false
      reasoning: >-
        Covers building eval pipelines, tracking experiments, and debugging
        quality regressions — practical hands-on coverage of the full eval
        workflow.
      instructor: Carey Phelps
      source: ai-researcher
    - url: 'https://hamel.dev/blog/posts/course/'
      title: LLM Evaluation Masterclass
      provider: Hamel Husain (independent)
      paid: true
      reasoning: >-
        Hamel Husain's practitioner course on eval methodology — the most
        domain-expert coverage available, from the author of the canonical eval
        posts.
      instructor: Hamel Husain
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.493Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
