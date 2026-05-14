---
slug: hallucination-mitigation
title: Hallucination Mitigation
phase: ai-assisted-development
order: 7
summary: >-
  Detect and reduce fabricated APIs, made-up types, and false claims from AI
  output — grounding, verification, and skepticism patterns.
tldr: >-
  AI invents plausible-looking but wrong code. Verify outputs against docs, test
  rigorously, and use retrieval or reference-based prompting to ground answers.
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
  Hallucination in AI coding tools is less like making things up at random and
  more like a very confident developer working from memory. The model has seen
  an enormous amount of code, documentation, and discussion about programming
  patterns — and it synthesizes from that training. Most of the time the
  synthesis is correct. But when a library changed its API between the model's
  training cutoff and today, or when a function signature exists in only one
  obscure project, or when the algorithm is in a domain thin in training data,
  the model will fill the gap with something plausible rather than admitting
  uncertainty. That confidently wrong output is what makes hallucination a
  production risk: the code compiles, looks right, passes a superficial review,
  and then fails in ways that take time to trace back to the root cause.


  The 80/20 of mitigation is grounding plus your existing toolchain. Grounding
  means you don't ask the model to recall API details from memory — you give it
  the actual type definitions, the actual function signatures, the actual
  documentation. The model's parametric memory is a starting point, not a source
  of truth for production code. Your existing toolchain — type checker, linter,
  test suite — is the other half of the equation. TypeScript's compiler will
  catch a hallucinated method call. A test suite will catch a subtly wrong
  algorithm. The mitigation strategy that works in practice is not primarily
  about prompting better; it's about treating AI output as a draft that must
  pass your existing quality gates before it's trusted.


  The failure mode teams fall into is treating AI output as reviewed once the
  model explains its reasoning. A model will happily justify wrong code with
  plausible-sounding explanations. The explanation is also generated text,
  subject to the same statistical-synthesis process as the code itself. The
  discipline is to verify the code, not the explanation: compile it, run the
  tests, check the API calls against official docs. If you find yourself nodding
  along to a model's explanation without running the code, you're in the
  hallucination trap.


  For libraries or APIs with significant post-training changes, or for
  domain-specific tools with limited training coverage, grounding becomes
  non-negotiable. Including the relevant section of the official documentation
  in your context window — even if it's verbose — is the single most reliable
  way to get correct API usage. This is technically context engineering, but the
  framing matters: you're not just improving quality, you're replacing uncertain
  memory with authoritative ground truth. Retrieval-augmented generation systems
  do this automatically, but even in manual workflows, the habit of 'include the
  docs' outperforms the habit of 'trust the model.'


  In the broader AI-assisted development ecosystem, hallucination mitigation is
  the practice that calibrates your relationship with AI tools correctly.
  Developers who skip it tend to oscillate between over-trust (shipping
  hallucinated code without verification) and under-trust (dismissing AI tools
  after a string of bad experiences). The calibrated posture is to use AI tools
  for what they're genuinely reliable at — common patterns, structural
  generation, boilerplate, code in well-represented domains — and to apply
  systematic verification for everything that goes to production. That
  calibration is what makes AI coding tools a durable productivity gain rather
  than a source of unpredictable noise.
pitfalls:
  - title: Treating confident AI output as ground truth
    explanation: >-
      Models produce wrong API signatures, nonexistent library methods, and
      plausible-but-incorrect algorithms with the same confident tone as correct
      output. The compiler, type checker, and test suite are the ground truth —
      AI output is always a draft to be verified.
  - title: No type definitions or API docs in context
    explanation: >-
      Asking a model to use a library without providing its actual type
      signatures or documentation forces it to rely on memorized training data,
      which may be outdated or incorrect. Ground the model in real, current
      source material for anything beyond standard library calls.
  - title: Skipping compile and test before trusting generated code
    explanation: >-
      The most common hallucination in AI-generated code is a function call with
      the wrong argument count or type, which a type checker or test suite
      catches instantly. Never commit AI-generated code without running the full
      type-check and test pipeline locally.
  - title: Hallucination risk highest for recent or obscure APIs
    explanation: >-
      AI coding tools are reliable for patterns well-represented in training
      data and much less reliable for libraries released or substantially
      changed after the training cutoff. For any dependency added in the last
      year, verify method signatures directly against the official docs.
  - title: Not asking the model to flag its own uncertainty
    explanation: >-
      Models asked 'write this function' will produce something, even when they
      should say 'I'm not sure about this API.' Explicitly prompting 'if you're
      uncertain about any part, say so' surfaces hedges that tell you where to
      verify independently.
codeExamples:
  - language: typescript
    title: Ground AI with Real Type Definitions
    code: >-
      import Anthropic from "@anthropic-ai/sdk";

      import { readFileSync } from "node:fs";


      const client = new Anthropic();


      // Instead of relying on the model's memory of your API, inject the real
      types.

      async function generateWithGrounding(task: string): Promise<string> {
        // Inject actual type definitions so the model can't hallucinate function signatures
        const types = readFileSync("src/lib/api-types.ts", "utf8");
        const errors = readFileSync("src/lib/errors.ts", "utf8");

        const res = await client.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 1024,
          system: [
            "You must only use the types and functions shown in the provided source files.",
            "Do not invent type names, method signatures, or imports not shown.",
            "If unsure, say so explicitly rather than guessing."
          ].join(" "),
          messages: [{
            role: "user",
            content: [
              `Task: ${task}`,
              "",
              "### src/lib/api-types.ts",
              "```typescript",
              types.slice(0, 3000),
              "```",
              "",
              "### src/lib/errors.ts",
              "```typescript",
              errors.slice(0, 1000),
              "```"
            ].join("\n")
          }]
        });

        return res.content.find(b => b.type === "text")?.text ?? "";
      }


      const code = await generateWithGrounding("Write a handler that calls
      createUser and returns AppError on failure.");

      console.log(code);
    reasoning: >-
      Demonstrates grounding: injecting real type definition files into context
      forces the model to use actual signatures rather than hallucinating
      plausible-but-wrong ones.
difficulty: intermediate
estimatedHours: 4
lastUpdatedAt: '2026-05-14T12:31:47.534Z'
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
