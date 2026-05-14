---
slug: hallucination-mitigation
title: Hallucination Mitigation
phase: ai-assisted-development
order: 7
summary: >-
  Detect and reduce fabricated APIs, made-up types, and false claims from AI
  output — grounding, verification, and skepticism patterns.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Hallucination mitigation is the practice of detecting and reducing false or
  fabricated outputs from AI coding tools — invented function signatures,
  nonexistent package versions, made-up API endpoints, or plausible-looking but
  incorrect algorithms. Language models generate text that is statistically
  likely given their training, which means they will confidently produce wrong
  answers when asked about details outside their training distribution or when
  context is ambiguous. For coding specifically, this manifests as importing
  libraries that don't exist, calling methods with wrong argument counts, or
  implementing algorithms that look correct but have subtle logical errors.


  The core mitigation strategies are grounding and verification. Grounding means
  giving the model authoritative source material — actual type definitions,
  official API docs, your codebase's existing function signatures — rather than
  relying on its parametric memory. Retrieval-augmented generation (RAG) is the
  systematic version of this: before asking the model to write code, retrieve
  the relevant documentation and include it in context. Verification means
  treating AI output as a draft to be tested, not a final answer: always compile
  the code, always run the tests, always cross-check API calls against official
  docs before shipping. CI enforcement (type checking, linting, test suites)
  catches most hallucinations before they reach production.


  Beyond grounding and verification, skepticism patterns include asking the
  model to cite its sources, asking it to identify its own uncertainty ('What
  parts of this are you unsure about?'), cross-checking critical API usages
  against official documentation, and using deterministic code linters rather
  than AI judgment for syntax and type correctness. The meta-skill is calibrated
  trust: AI coding tools are highly reliable for patterns well-represented in
  their training (common CRUD operations, standard library usage) and much less
  reliable for obscure library internals, recent API changes, or novel
  architectural decisions.
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
lastUpdatedAt: '2026-05-14T12:26:04.497Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=mwl6QmM7gio'
      title: 'LLM Hallucinations — Causes, Types, and Mitigations'
      author: IBM Technology
      durationMinutes: 10
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        IBM Technology's clear, technical explanation of why hallucinations
        occur and the main mitigation strategies — authoritative and accessible.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=T-D1OfcDW1M'
      title: 'Reducing LLM Hallucinations: RAG, Grounding, and Verification Techniques'
      author: Weights & Biases
      durationMinutes: 55
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Comprehensive technical treatment of hallucination reduction covering
        RAG, self-consistency sampling, and verification pipelines with code
        examples.
      source: ai-researcher
  articles:
    - url: >-
        https://docs.anthropic.com/en/docs/test-and-evaluate/strengthen-guardrails/reduce-hallucinations
      title: Reduce Hallucinations — Anthropic Documentation
      kind: canonical-doc
      reasoning: >-
        Anthropic's official guidance on reducing hallucinations — covers
        grounding techniques, system prompt patterns, and when to request
        citations.
      publisher: Anthropic
      source: ai-researcher
    - url: 'https://simonwillison.net/2023/Dec/31/ai-in-2023/'
      title: Things we learned about LLMs in 2023
      kind: engineering-blog
      reasoning: >-
        Simon Willison's authoritative year-in-review covering hallucination
        patterns, grounding failures, and practical mitigation lessons from
        production deployments.
      author: Simon Willison
      source: ai-researcher
    - url: 'https://cookbook.openai.com/articles/techniques_to_improve_reliability'
      title: Techniques to Improve Reliability
      kind: canonical-doc
      reasoning: >-
        OpenAI's practical cookbook covering chain-of-thought, self-consistency,
        and verification techniques that reduce hallucination in coding
        contexts.
      publisher: OpenAI
      source: ai-researcher
  services:
    - name: LlamaIndex
      url: 'https://www.llamaindex.ai'
      category: RAG framework for grounding
      reasoning: >-
        Leading framework for grounding LLM outputs in verified source material
        — the primary technical tool for systematic hallucination mitigation
        through RAG.
      vendor: LlamaIndex
      source: ai-researcher
    - name: Langfuse
      url: 'https://langfuse.com'
      category: LLM observability with hallucination scoring
      reasoning: >-
        Provides hallucination scoring templates and human annotation workflows
        to track hallucination rates over time in production AI coding tools.
      vendor: Langfuse
      source: ai-researcher
    - name: Promptfoo
      url: 'https://promptfoo.dev'
      category: Prompt testing with factual grounding checks
      reasoning: >-
        Open-source eval tool with built-in factual grounding and hallucination
        detection checks — integrates into CI to catch hallucination
        regressions.
      vendor: Promptfoo
      source: ai-researcher
    - name: Guardrails AI
      url: 'https://guardrailsai.com'
      category: LLM output validation
      reasoning: >-
        Framework for adding structural and factual validation to LLM outputs —
        can enforce that generated code references only known functions and
        types.
      vendor: Guardrails AI
      source: ai-researcher
    - name: Greptile
      url: 'https://greptile.com'
      category: Codebase-grounded AI assistant
      reasoning: >-
        Grounds AI responses in your actual codebase — dramatically reduces
        hallucinated function signatures and type errors by indexing real source
        of truth.
      vendor: Greptile
      source: ai-researcher
  courses:
    - url: 'https://learn.deeplearning.ai/courses/building-evaluating-advanced-rag'
      title: Building and Evaluating Advanced RAG
      provider: DeepLearning.AI
      paid: false
      reasoning: >-
        The best course on using RAG to ground LLM outputs — directly addresses
        hallucination through retrieval, relevance checking, and faithfulness
        evaluation.
      instructor: Jerry Liu
      source: ai-researcher
    - url: 'https://learn.deeplearning.ai/courses/quality-safety-llm-applications'
      title: Quality and Safety for LLM Applications
      provider: DeepLearning.AI
      paid: false
      reasoning: >-
        Covers hallucination detection, output quality measurement, and
        guardrail implementation — directly applicable to AI coding tools in
        production.
      instructor: Whylabs
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.497Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
