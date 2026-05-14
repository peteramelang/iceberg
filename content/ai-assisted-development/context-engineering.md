---
slug: context-engineering
title: Context Engineering
phase: ai-assisted-development
order: 2
summary: >-
  Curate what an AI tool sees — files, docs, examples, schemas — so it has
  enough signal to be accurate and not so much that it gets confused.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Context engineering is the practice of deliberately selecting, structuring,
  and curating the information you give an AI coding tool so it can produce
  accurate, idiomatic, and complete responses. A model can only work with what
  it sees — so giving it the right files, type definitions, API schemas,
  relevant examples, and codebase conventions dramatically improves output
  quality, while giving it too much irrelevant context degrades it. The craft is
  analogous to how a senior developer would brief a contractor: you don't hand
  them the entire codebase, you explain the relevant architecture, show the
  patterns to follow, and clarify the constraints.


  In practice, context engineering means: identifying the minimal set of files
  and types the AI needs for a given task (rather than sending the whole
  project), including examples of the idiomatic patterns you want it to match,
  adding negative examples of anti-patterns to avoid, and writing CLAUDE.md or
  similar project-level instruction files that persist conventions across
  sessions. For RAG-based coding assistants, it also means chunking and indexing
  the codebase effectively so that retrieval returns the most useful context
  rather than the most textually similar one.


  Context engineering matters more as tasks get harder: single-line autocomplete
  works without much context, but architectural changes require the AI to
  understand your data model, your service boundaries, and your team's
  conventions. The field is evolving rapidly — techniques like speculative
  context loading, context compression, and multi-agent context partitioning are
  emerging as teams push AI tools into more complex workflows. Simon Willison
  and the Anthropic engineering team are the leading public voices on practical
  context engineering for coding.
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
lastUpdatedAt: '2026-05-14T12:26:04.496Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=qWWvFa1Qa_Y'
      title: Context Engineering for LLMs — What It Is and Why It Matters
      author: AI Explained
      durationMinutes: 12
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Clear introduction to context engineering concepts — covers context
        window mechanics, retrieval, and why curating context beats dumping
        everything in.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=sVkrMhEkIZo'
      title: Building Production RAG Systems — Context Engineering Deep Dive
      author: LlamaIndex
      durationMinutes: 65
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Deep dive into context curation for RAG systems — covers chunking
        strategies, metadata filtering, and query-context alignment directly
        applicable to coding assistants.
      source: ai-researcher
  articles:
    - url: 'https://www.anthropic.com/engineering/claude-code-best-practices'
      title: Claude Code Best Practices
      kind: canonical-doc
      reasoning: >-
        Anthropic's official guide to structuring context for Claude Code
        including CLAUDE.md patterns, file selection, and codebase conventions.
      publisher: Anthropic
      source: ai-researcher
    - url: 'https://simonwillison.net/2025/Jun/27/context-engineering/'
      title: Context Engineering
      kind: engineering-blog
      reasoning: >-
        Simon Willison's definitive post coining and explaining context
        engineering — the canonical reference that popularized the term in the
        LLM tooling community.
      author: Simon Willison
      source: ai-researcher
    - url: 'https://docs.cursor.com/context/codebase-indexing'
      title: Codebase Indexing — Cursor Documentation
      kind: canonical-doc
      reasoning: >-
        Cursor's official guide to how codebase indexing works and how to
        configure it for better context retrieval — practical for teams using
        Cursor in production.
      publisher: Cursor / Anysphere
      source: ai-researcher
  services:
    - name: Cursor
      url: 'https://cursor.com'
      category: AI coding IDE
      reasoning: >-
        Best-in-class codebase indexing and context retrieval for AI coding —
        allows @-mentioning specific files, docs, and web pages to precisely
        control context.
      vendor: Anysphere
      source: ai-researcher
    - name: Claude Code
      url: 'https://claude.ai/code'
      category: AI coding agent
      reasoning: >-
        Supports CLAUDE.md project-level context files and explicit file
        inclusion — the primary tool for practicing persistent context
        engineering.
      vendor: Anthropic
      source: ai-researcher
    - name: LlamaIndex
      url: 'https://www.llamaindex.ai'
      category: RAG and context management framework
      reasoning: >-
        Leading framework for building context pipelines — chunking, indexing,
        retrieval, and re-ranking for codebases and documentation.
      vendor: LlamaIndex
      source: ai-researcher
    - name: Sourcegraph Cody
      url: 'https://sourcegraph.com/cody'
      category: AI coding assistant
      reasoning: >-
        Uses Sourcegraph's code intelligence graph for precise context retrieval
        — cross-file and cross-repo awareness for accurate context engineering.
      vendor: Sourcegraph
      source: ai-researcher
    - name: Continue
      url: 'https://continue.dev'
      category: AI coding assistant (open-source)
      reasoning: >-
        Open-source VS Code/JetBrains assistant with configurable context
        providers — allows precise control over what context is included for
        each completion.
      vendor: Continue
      source: ai-researcher
  courses:
    - url: 'https://learn.deeplearning.ai/courses/building-evaluating-advanced-rag'
      title: Building and Evaluating Advanced RAG
      provider: DeepLearning.AI
      paid: false
      reasoning: >-
        Covers advanced context retrieval patterns including query routing,
        re-ranking, and context fusion — directly applicable to coding assistant
        context engineering.
      instructor: Jerry Liu
      source: ai-researcher
    - url: >-
        https://www.deeplearning.ai/short-courses/prompt-engineering-for-developers/
      title: ChatGPT Prompt Engineering for Developers
      provider: DeepLearning.AI
      paid: false
      reasoning: >-
        The foundational course on structuring prompts and context — covers
        few-shot examples, system message design, and iterative refinement.
      instructor: 'Isa Fulford, Andrew Ng'
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.496Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
