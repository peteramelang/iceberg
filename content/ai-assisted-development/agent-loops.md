---
slug: agent-loops
title: Agent Loops
phase: ai-assisted-development
order: 3
summary: >-
  Autonomous coding agents that plan, edit, run, and verify in a loop. When to
  use them, how to bound them, what oversight they require.
tldr: >-
  Autonomous AI systems that plan, execute, and learn from results in cycles.
  Requires bounded iterations, human checkpoints, and guardrails to prevent
  runaway edits.
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
  Agent loops are the closest thing we currently have to a programmable junior
  engineer — one that never sleeps, never gets bored, and never refuses to run
  the tests for the fifteenth time. The reason they matter in production isn't
  that they eliminate human engineers; it's that they eliminate the
  context-switching tax on senior engineers. When a well-scoped task can be
  handed off to an agent — 'port this module to the new API contract and make
  the test suite green' — a senior can stay in the deep work of architecture
  while the mechanical parts execute themselves. That leverage is real and
  growing.


  The 80/20 of making agent loops work is the prompt you give them before they
  start. An agent with a vague goal will either thrash (trying things at random
  and accreting confusing edits) or overcorrect (producing a dramatic refactor
  you didn't ask for). The productive frame is to write your agent prompt the
  way you'd write a handoff to a contractor: define the goal, define what
  success looks like concretely and testably, define what the agent is not
  allowed to touch, and define when it should stop and ask rather than guess.
  Agents with clear stopping conditions produce recoverable work; agents without
  them produce sprawl.


  The dominant failure mode isn't the dramatic rogue-AI scenario — it's the
  quiet failure where an agent can't make progress, can't detect that it can't
  make progress, and spends twenty minutes making increasingly desperate edits
  while the context window fills up with noise. By the time you look back at the
  terminal, you have a codebase in a half-modified state that's harder to reason
  about than when you started. This is why hard iteration caps, mandatory
  test-passing checkpoints, and execution sandboxes aren't optional safety
  theater — they're the structural constraints that make agent output actually
  usable.


  The mental model that works best here is to think of an agent loop like a CI
  pipeline, not like a conversation. You set the inputs, you define the
  acceptance criteria, you let it run, and you review the result. Intervening in
  the middle of a run is usually more disruptive than letting it finish and then
  correcting. The agent's inner monologue — the plan-act-observe cycle — is
  implementation detail. What you care about is: did the output pass the tests,
  does it match the codebase conventions, and is the diff reviewable? If yes,
  merge it. If no, figure out whether the prompt was wrong or the task was too
  ambiguous for an agent, and adjust accordingly.


  In the broader AI-assisted development ecosystem, agent loops occupy the long
  end of the complexity spectrum. They sit above single-turn completions
  (autocomplete, one-shot generation) and below full orchestration systems with
  multiple specialized sub-agents. The current sweet spot is well-defined,
  self-contained tasks with automated success criteria — test suites, type
  checkers, linters. Tasks requiring business judgment, cross-system
  coordination, or interpretations of ambiguous requirements still need a human
  in the loop, and probably will for a while. The teams making the most of agent
  loops today are the ones disciplined about which tasks belong there and which
  don't.
pitfalls:
  - title: No iteration cap allows infinite loops
    explanation: >-
      Agents without a hard stop on loop count will spin indefinitely when they
      get stuck — burning tokens and sometimes corrupting state. Always set a
      maximum iteration budget and treat hitting it as a recoverable error, not
      a success.
  - title: Ambiguous goals produce thrashing agents
    explanation: >-
      An agent given a vague goal like 'improve this code' will make changes,
      observe ambiguous results, and loop without converging. Define explicit,
      testable success criteria before handing off to an agent — a test suite
      pass or a specific file diff.
  - title: No guardrails on destructive filesystem actions
    explanation: >-
      Agents with unrestricted write access can delete or overwrite files they
      shouldn't touch, especially when backtracking after failed attempts. Scope
      the writable directories explicitly and run agents in sandboxed
      environments by default.
  - title: Context window bloat causes late-loop failures
    explanation: >-
      As the conversation grows with each iteration, the agent's context window
      fills with stale observations and earlier attempts, degrading output
      quality and eventually hitting token limits. Periodically summarize or
      prune context rather than letting it accumulate unbounded.
  - title: Over-trusting agent self-assessment of success
    explanation: >-
      Agents often report success based on their own output rather than external
      verification, such as running the test suite or checking the build. Always
      verify agent completion with an independent, deterministic check outside
      the loop.
  - title: Skipping human checkpoints on major milestones
    explanation: >-
      An agent that can go from 'refactor the auth module' to 'deploy to
      staging' without a human review introduces unacceptable blast radius.
      Insert mandatory check-in points after steps with irreversible or
      cross-boundary effects.
codeExamples:
  - language: typescript
    title: Bounded Agent Loop with Tool Calls
    code: >-
      import Anthropic from "@anthropic-ai/sdk";


      const client = new Anthropic();


      async function runAgent(goal: string, maxIterations = 10): Promise<string>
      {
        const messages: Anthropic.MessageParam[] = [
          { role: "user", content: goal }
        ];

        for (let i = 0; i < maxIterations; i++) {
          const response = await client.messages.create({
            model: "claude-opus-4-5",
            max_tokens: 1024,
            tools: [
              {
                name: "run_tests",
                description: "Run the test suite and return output",
                input_schema: { type: "object", properties: {}, required: [] }
              }
            ],
            messages
          });

          if (response.stop_reason === "end_turn") {
            const text = response.content.find(b => b.type === "text");
            return text?.text ?? "done";
          }

          // Process tool calls
          const toolUse = response.content.find(b => b.type === "tool_use");
          if (!toolUse || toolUse.type !== "tool_use") break;

          const toolResult = toolUse.name === "run_tests"
            ? { output: "All 42 tests passed.", exitCode: 0 }
            : { error: "Unknown tool" };

          messages.push({ role: "assistant", content: response.content });
          messages.push({
            role: "user",
            content: [{ type: "tool_result", tool_use_id: toolUse.id, content: JSON.stringify(toolResult) }]
          });
        }

        throw new Error(`Agent exceeded ${maxIterations} iterations without completing.`);
      }


      runAgent("Verify all tests pass for the auth module.").then(console.log);
    reasoning: >-
      Shows a complete bounded agent loop with a hard iteration cap, tool-use
      cycle, and explicit end detection — the three essential guardrails for
      production agent code.
difficulty: intermediate
estimatedHours: 8
lastUpdatedAt: '2026-05-14T12:31:47.516Z'
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
