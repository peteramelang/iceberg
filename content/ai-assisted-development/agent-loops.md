---
slug: agent-loops
title: Agent Loops
phase: ai-assisted-development
order: 3
summary: >-
  Autonomous coding agents that plan, edit, run, and verify in a loop. When to
  use them, how to bound them, what oversight they require.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Agent loops are autonomous AI workflows in which a language model is given a
  goal and a set of tools, then iterates through plan–act–observe cycles until
  it reaches a stopping condition or is interrupted. In a coding context, this
  typically means the agent reads files, writes edits, runs tests or a shell,
  reads the output, and decides what to do next — all without a human in the
  inner loop. The agent may spawn sub-tasks, call specialized tools (web search,
  code execution, lint), and backtrack when it detects failure, mimicking how a
  senior developer works through a problem methodically.


  Using agent loops effectively requires understanding their failure modes:
  infinite loops when the model can't make progress, over-confidence causing
  destructive edits, and context window overflow as the conversation grows.
  Teams bound agents with hard iteration caps, read-only guardrails for
  sensitive directories, mandatory human check-in points after major milestones,
  and sandboxed execution environments so a runaway agent can't break production
  systems.


  The practical skill is knowing when to invoke an agent versus a single-turn
  completion: agents shine on well-scoped, multi-step tasks with clear success
  criteria ("port this module to TypeScript and make all tests pass"), but
  struggle with ambiguous goals or tasks requiring deep business judgment.
  Writing good agent prompts means defining the goal, success criteria, explicit
  stopping rules, and what the agent is not allowed to touch — the same
  discipline needed for any autonomous process.
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
lastUpdatedAt: '2026-05-14T12:26:04.481Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=sal78ACtGTc'
      title: 'AI Agents Explained: How Claude Uses Tools and Agent Loops'
      author: Anthropic
      durationMinutes: 10
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Official Anthropic walkthrough of how agent loops work with tool use,
        directly from the model creators — authoritative and beginner-friendly.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=Tklx4Fs33ys'
      title: Building AI Agents from Scratch — Full Course
      author: freeCodeCamp.org
      durationMinutes: 60
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Full hands-on course covering the plan-act-observe loop, tool
        integration, and error recovery patterns with real code examples.
      source: ai-researcher
  articles:
    - url: 'https://docs.anthropic.com/en/docs/build-with-claude/agents'
      title: Building Agents — Anthropic Documentation
      kind: canonical-doc
      reasoning: >-
        Anthropic's canonical reference for building agents with Claude,
        covering tool use, multi-step reasoning, and safety considerations.
      publisher: Anthropic
      source: ai-researcher
    - url: 'https://simonwillison.net/2023/Apr/25/dual-llm-pattern/'
      title: >-
        The Dual LLM Pattern for Building AI Products That Can Resist Prompt
        Injection
      kind: engineering-blog
      reasoning: >-
        Simon Willison's canonical analysis of agentic safety — the
        privileged/unprivileged model split that prevents prompt injection in
        agent loops.
      author: Simon Willison
      source: ai-researcher
    - url: 'https://lilianweng.github.io/posts/2023-06-23-agent/'
      title: LLM Powered Autonomous Agents
      kind: engineering-blog
      reasoning: >-
        Lilian Weng's comprehensive survey of agent architectures — planning,
        memory, tool use — widely cited and written by OpenAI's head of safety
        research.
      author: Lilian Weng
      source: ai-researcher
  services:
    - name: Claude Code
      url: 'https://claude.ai/code'
      category: AI coding agent
      reasoning: >-
        Anthropic's terminal-based coding agent that runs full agent loops:
        reads files, writes edits, runs tests, and iterates autonomously.
      vendor: Anthropic
      source: ai-researcher
    - name: Aider
      url: 'https://aider.chat'
      category: AI coding agent
      reasoning: >-
        Open-source terminal agent with mature loop logic including git-aware
        diff generation, auto-commit, and multi-model support.
      vendor: Aider
      source: ai-researcher
    - name: Cursor
      url: 'https://cursor.com'
      category: AI coding IDE
      reasoning: >-
        IDE with integrated agent mode (Composer) that runs multi-step file
        edits and terminal commands in a bounded loop.
      vendor: Anysphere
      source: ai-researcher
    - name: Cline
      url: 'https://github.com/cline/cline'
      category: AI coding agent
      reasoning: >-
        VS Code extension implementing autonomous agent loops with explicit
        permission requests for each file write or shell command.
      vendor: Cline
      source: ai-researcher
    - name: LangGraph
      url: 'https://langchain-ai.github.io/langgraph/'
      category: Agent framework
      reasoning: >-
        Graph-based framework for building stateful, multi-actor agent loops
        with explicit cycle control, checkpointing, and human-in-the-loop pause
        points.
      vendor: LangChain
      source: ai-researcher
  courses:
    - url: 'https://learn.deeplearning.ai/courses/ai-agents-in-langgraph'
      title: AI Agents in LangGraph
      provider: DeepLearning.AI
      paid: false
      reasoning: >-
        Covers ReAct loops, tool calling, persistence, and human-in-the-loop
        patterns — short and practical, taught by LangChain creators.
      instructor: Harrison Chase
      source: ai-researcher
    - url: 'https://learn.deeplearning.ai/courses/multi-ai-agent-systems-with-crewai'
      title: Multi AI Agent Systems with crewAI
      provider: DeepLearning.AI
      paid: false
      reasoning: >-
        Teaches multi-agent orchestration patterns including role-based loops,
        delegation, and bounded autonomy for real coding workflows.
      instructor: João Moura
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.480Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
