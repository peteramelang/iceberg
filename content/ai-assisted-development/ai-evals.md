---
slug: ai-evals
title: AI Evals
phase: ai-assisted-development
order: 6
summary: >-
  Measure whether AI features (or AI-assisted workflows) actually work — offline
  test sets, online metrics, golden examples, regression catches.
tldr: >-
  Automated tests that measure AI output quality against defined standards.
  Build test suites with sample inputs, expected outputs, and judges to track
  model performance.
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
  Evals are to AI features what automated tests are to application code — the
  mechanism that lets you change things without flying blind. The reason they
  matter in production is straightforward: language model behavior is
  nondeterministic, sensitive to prompt phrasing, and can shift silently when
  you update a model version or tweak a system prompt. Without an eval suite,
  you discover that your AI feature got worse the same way you discover
  application bugs without a test suite: your users tell you, after the damage
  is done. With evals, you catch regressions before they ship. That's the whole
  value proposition, and it's substantial.


  The 80/20 for most teams is to start with functional correctness and not
  overthink grading. For AI coding tools specifically, 'does the generated code
  pass the test suite?' is an eval. 'Does it compile without errors?' is an
  eval. These are deterministic, fast, and directly meaningful. You don't need a
  sophisticated model-as-judge to start getting value from evals — you need a
  set of representative examples, a way to run them automatically, and a result
  that tells you whether output quality went up or down. Add the fancy grading
  later, once you've established the habit of running evals at all.


  The dominant failure mode is building an eval suite that doesn't represent
  what users actually encounter. Golden sets assembled from hand-crafted
  examples tend to be cleaner, simpler, and more uniform than real traffic —
  which means your evals pass confidently while real users experience failures
  you never anticipated. The solution is to feed real production queries back
  into your eval set continuously, with appropriate anonymization. An eval suite
  that includes a growing sample of actual usage will catch the long-tail cases
  that crafted examples miss, and it will surface distribution shifts when user
  behavior changes in ways your original examples didn't anticipate.


  The mental model that makes eval culture click is to think of them as
  regression tests, not performance benchmarks. A benchmark asks 'how good is
  this system?' — a hard question with a subjective answer. A regression test
  asks 'did this get worse compared to before?' — a concrete, actionable
  question. Teams that frame evals as regression detection don't get paralyzed
  by the difficulty of defining 'good'; they run the evals on every change and
  investigate when scores drop. The bar isn't absolute quality; it's 'at least
  as good as yesterday.'


  Evals sit in the ecosystem at the intersection of your AI feature development
  workflow and your CI/CD pipeline. They're most powerful when they run
  automatically — on every prompt change, every model version bump, every
  context update. The tooling ecosystem has matured considerably: Braintrust,
  LangSmith, and open-source frameworks like inspect-ai provide the scaffolding
  so you're not building eval infrastructure from scratch. The organizational
  investment is a few weeks of setup and the discipline of growing your golden
  set over time. The return is the ability to iterate on AI features with the
  same confidence that a good test suite gives you for application code.
pitfalls:
  - title: Shipping prompt changes without running any evals
    explanation: >-
      Changing a system prompt without a test suite is the AI equivalent of
      editing application code with no tests — quality regressions are invisible
      until users complain. Even a small golden set of 20 examples run on every
      prompt change catches the worst regressions.
  - title: Golden sets that don't reflect real usage distribution
    explanation: >-
      A carefully curated set of easy examples will show high scores while
      production edge cases fail. Build your eval set from actual production
      queries, not from examples the model was already good at during
      development.
  - title: Using the same model to generate and judge evals
    explanation: >-
      When you use the same model to create examples and to grade them, it will
      score its own outputs highly even when they are wrong. Use a separate,
      independent judge — a different model, a deterministic check, or human
      annotation — for grading.
  - title: Treating eval score as a single number to maximize
    explanation: >-
      Teams often chase an aggregate score, unaware that gains on easy examples
      mask regressions on hard or rare ones. Track score distributions and
      per-category breakdowns, not just averages.
  - title: No CI integration means evals run never or manually
    explanation: >-
      Evals kept outside the CI pipeline are run infrequently, usually only when
      someone remembers to, which means regressions accumulate for weeks. Evals
      must block or at minimum annotate the PR that introduced a regression.
  - title: Skipping functional correctness in favor of vibe grades
    explanation: >-
      Subjective quality scores like 'is this response helpful?' are important
      but hard to automate and slow to collect. Start with deterministic checks
      — does the code compile, do tests pass — before layering in model-as-judge
      for softer qualities.
codeExamples:
  - language: python
    title: Eval Harness with Model-as-Judge
    code: |-
      import anthropic
      import json

      client = anthropic.Anthropic()

      GOLDEN_SET = [
          {
              "input": "Write a Python function that returns the factorial of n.",
              "criteria": "Uses recursion or iteration, handles n=0, returns int."
          },
          {
              "input": "Write a TypeScript type for a paginated API response.",
              "criteria": "Generic type, includes data array, total count, and page fields."
          }
      ]

      def generate(prompt: str) -> str:
          res = client.messages.create(
              model="claude-haiku-4-5",
              max_tokens=512,
              messages=[{"role": "user", "content": prompt}]
          )
          return res.content[0].text

      def judge(output: str, criteria: str) -> dict:
          res = client.messages.create(
              model="claude-opus-4-5",
              max_tokens=128,
              system="You are an eval judge. Return JSON: {\"pass\": bool, \"reason\": str}",
              messages=[{
                  "role": "user",
                  "content": f"Criteria: {criteria}\n\nOutput:\n{output}"
              }]
          )
          return json.loads(res.content[0].text)

      passed = 0
      for example in GOLDEN_SET:
          output = generate(example["input"])
          result = judge(output, example["criteria"])
          status = "PASS" if result["pass"] else "FAIL"
          if result["pass"]:
              passed += 1
          print(f"[{status}] {result['reason']}")

      print(f"\nScore: {passed}/{len(GOLDEN_SET)}")
    reasoning: >-
      A minimal but complete eval harness: golden set, a generator under test,
      and a model-as-judge grader — the three components every AI eval needs.
difficulty: intermediate
estimatedHours: 8
lastUpdatedAt: '2026-05-14T12:31:47.529Z'
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
