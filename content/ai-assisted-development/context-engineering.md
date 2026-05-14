---
slug: context-engineering
title: Context Engineering
phase: ai-assisted-development
order: 2
summary: >-
  Curate what an AI tool sees — files, docs, examples, schemas — so it has
  enough signal to be accurate and not so much that it gets confused.
tldr: >-
  Give AI tools the right files, types, and examples so it produces accurate
  code. Too much context confuses the model; structure matters as much as
  volume.
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
  Context engineering is the discipline that separates developers who get
  reliable results from AI coding tools from those who find them unpredictably
  useful. The fundamental constraint is that a model can only reason about what
  it can see — it has no access to your mental model of the codebase, your
  team's conventions, the architectural decisions made three years ago, or the
  reasons why the obvious approach won't work in your system. Every time you're
  frustrated by AI output that's generic, slightly wrong, or stylistically
  foreign to your codebase, the root cause is almost always a context problem:
  the model didn't have what it needed to do better.


  The 80/20 of context engineering for most coding tasks is selectivity and
  examples. Selectivity means giving the model the three files that are actually
  relevant to the task, not the whole project. More context is not automatically
  better — irrelevant files add noise and push important signal further from the
  model's attention. Examples means showing the model the pattern you want to
  follow, not just describing it in the abstract. 'Use our existing error
  handling pattern' is a weak instruction; including the two functions that
  embody that pattern and saying 'match this style exactly' is a strong one.
  These two practices — curating what you include and adding concrete examples —
  account for the majority of quality improvement available from context tuning.


  The dominant failure mode is treating AI tools as oracles that work best when
  given maximum input. This is the context-stuffing trap: loading an entire
  codebase, every relevant file, all the documentation, and hoping the model
  figures out what matters. In practice this degrades output quality because the
  model's attention is distributed across too much material, and the irrelevant
  content competes with the relevant. The discipline of asking 'what is the
  minimum context this model needs to do this task correctly?' produces better
  results than throwing everything at it and hoping.


  For production systems, context engineering extends beyond individual prompts
  to the persistent layer: CLAUDE.md files, project-level system prompts, and
  indexed codebase retrievers that ensure every session starts with the right
  conventions loaded. This is where the investment compounds — conventions
  written once inform every session, and retrieval systems that index your
  codebase make it possible to automatically include relevant context rather
  than requiring developers to remember to add it manually. The teams doing this
  well have effectively trained their AI tools on their specific codebase
  conventions, which is a durable advantage.


  In the ecosystem, context engineering is the connective tissue between
  everything else in AI-assisted development. Good evals depend on consistent
  context to produce meaningful comparisons. Agent loops depend on
  well-specified context to stay on task. Hallucination mitigation depends on
  grounding context to replace the model's fuzzy memory with authoritative
  facts. Every other AI coding practice works better when the context is
  well-engineered, and worse when it isn't. It's also the practice that's most
  underrated relative to its impact — prompt phrasing gets more attention, but
  for coding tasks specifically, what you include is usually more important than
  how you phrase it.
pitfalls:
  - title: Sending the whole codebase as context
    explanation: >-
      Loading an entire repository into context adds noise that degrades output
      quality — models struggle to prioritize relevant files when everything is
      included. Curate the minimal set of files, types, and schemas the model
      genuinely needs for the specific task.
  - title: No project-level instruction file for persistent conventions
    explanation: >-
      Without a CLAUDE.md or equivalent, every new session starts from scratch
      and the model defaults to generic conventions rather than your team's
      patterns. Commit a project-level instruction file that encodes naming,
      error handling, and testing conventions.
  - title: Providing examples of what to do but not what to avoid
    explanation: >-
      Few-shot examples of the target pattern help, but without negative
      examples the model may still reproduce the anti-pattern you're trying to
      eliminate. Include one or two explicit 'do not do this' examples alongside
      the positive ones.
  - title: Retrieval returning textually similar but semantically wrong context
    explanation: >-
      RAG systems that index by keyword similarity often retrieve files that
      mention the right terms but don't contain the right logic, giving the
      model misleading context. Evaluate retrieval quality independently from
      generation quality — bad retrieval poisons every answer.
  - title: Stale context that contradicts current codebase state
    explanation: >-
      Context prepared at session start may become incorrect after the agent
      makes edits mid-session, causing the model to reason from an outdated
      picture. Re-read affected files after significant edits rather than
      relying on context built at the start.
codeExamples:
  - language: typescript
    title: Assemble Minimal Task Context for AI
    code: |-
      import { readFileSync, existsSync } from "node:fs";
      import Anthropic from "@anthropic-ai/sdk";

      const client = new Anthropic();

      interface TaskContext {
        goal: string;
        relevantFiles: string[];  // Only files the AI actually needs
        projectConventions?: string;
      }

      async function runWithContext(ctx: TaskContext): Promise<string> {
        const fileSections = ctx.relevantFiles
          .filter(f => existsSync(f))
          .map(f => `### ${f}\n\`\`\`\n${readFileSync(f, "utf8").slice(0, 2000)}\n\`\`\``)
          .join("\n\n");

        const systemPrompt = [
          ctx.projectConventions ?? "Follow existing code style.",
          "Do not modify files not shown. Do not add new dependencies."
        ].join(" ");

        const userMessage = [
          `Goal: ${ctx.goal}`,
          "",
          "Relevant files:",
          fileSections
        ].join("\n");

        const res = await client.messages.create({
          model: "claude-opus-4-5",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }]
        });

        const block = res.content.find(b => b.type === "text");
        return block?.text ?? "";
      }

      const result = await runWithContext({
        goal: "Add input validation to the createUser function.",
        relevantFiles: ["src/users/create.ts", "src/lib/errors.ts"],
        projectConventions: "Use Zod for validation. Return Result<T, AppError>."
      });
      console.log(result);
    reasoning: >-
      Shows deliberate context curation — passing only the two relevant files
      plus explicit conventions — rather than dumping the whole codebase into
      the prompt.
difficulty: intermediate
estimatedHours: 6
lastUpdatedAt: '2026-05-14T12:31:47.532Z'
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
