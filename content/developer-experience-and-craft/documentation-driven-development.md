---
slug: documentation-driven-development
title: Documentation-Driven Development
phase: developer-experience-and-craft
order: 5
summary: >-
  Write the README first. ADRs as code. Doc tests. Treat documentation as an API
  contract with future readers.
tldr: >-
  Write docs before code to clarify requirements and catch design gaps early. A
  clear README often reveals missing functionality.
definition: >-
  Documentation-Driven Development (DDD) is the practice of writing
  documentation — READMEs, API references, Architecture Decision Records, or
  user guides — before or alongside the code rather than after it. The act of
  writing forces precision: if you cannot explain what a function does in one
  sentence, the function is probably doing too many things. Writing the README
  first is the easiest entry point: if the installation or usage instructions
  feel awkward to write, the interface is probably awkward to use.


  Architecture Decision Records (ADRs) apply the same discipline to design
  choices. An ADR captures the context, the options considered, and the
  rationale for the choice made — so future maintainers understand not just what
  the system does but why it is shaped the way it is. Doc tests (doctest in
  Python, Rust's integrated doc examples, or tsdoc with jest-doctest) go further
  by making documentation executable, so the examples in the docs stay correct
  as the code evolves.


  The Diátaxis framework, developed by Daniele Procida, provides a four-quadrant
  model — tutorials, how-to guides, reference, and explanation — that helps
  teams understand which type of documentation they are writing and for whom.
  This framework prevents the common failure mode where documentation is
  technically accurate but impossible to navigate because tutorials and
  reference are mixed together.
shortExplainerVideo: null
narrative: >-
  The most common objection to documentation is that it goes stale. This is
  true, and it is also a symptom of doing documentation wrong. When docs are
  written after the code, as a separate afterthought artifact, they are coupled
  to a snapshot of reality that immediately starts drifting. When docs are
  written before or alongside the code — as constraints that the code must
  satisfy — the relationship inverts. Stale docs become visible instantly
  because the code no longer does what the docs say, rather than silently wrong
  because the docs no longer describe what the code does.


  The 80/20 of documentation-driven development is the README-first discipline
  for APIs and the ADR discipline for architecture decisions. Writing the README
  before you write the code forces a clarity of intent that design documents and
  whiteboard diagrams rarely achieve. If you cannot write a clear 'getting
  started' section, you do not yet understand what you are building well enough
  to build it. Awkward installation instructions usually mean awkward
  installation; a usage example that requires ten steps to do something simple
  usually means the interface is too complex. The README becomes a specification
  that the code either satisfies or does not. Architecture Decision Records
  extend this to the why layer: they capture not just what the system does but
  what alternatives were rejected and on what grounds, which is the information
  future maintainers most desperately need and most rarely have.


  The failure mode that kills most documentation efforts is category confusion.
  Teams write tutorials when they need reference docs, or write reference docs
  when what users need is a how-to guide for a specific task. The result is
  technically accurate but impossible to use — like a dictionary that lists
  every word but provides no sentence examples. The Diátaxis framework provides
  a useful forcing function: before writing anything, ask whether you are
  writing a tutorial (learning-oriented, for new users), a how-to guide
  (task-oriented, assumes baseline knowledge), a reference
  (information-oriented, exhaustive), or an explanation (understanding-oriented,
  covers the 'why'). These four types answer different questions for different
  readers, and mixing them in a single document serves none of them well.


  Doc tests are the mechanism that eliminates the staleness problem for the most
  critical documentation: code examples. In Python, Rust, and increasingly other
  ecosystems, the examples in your API docs can be executed as part of the test
  suite. This means a code change that breaks the documented behavior also
  breaks the build — you cannot silently drift. The investment to set this up is
  small; the compounding benefit over the life of a codebase is substantial. Any
  API that is more than superficially complex should have at minimum a handful
  of executable examples covering the happy path and the most common error
  cases.


  In the ecosystem of developer craft, documentation-driven development is the
  practice that most directly serves future engineers — including your future
  self. Every undocumented design decision is a trap for the next person who has
  to change that part of the code, including six-months-from-now you. Teams that
  build the habit of capturing intent at decision time are effectively investing
  in their own future velocity: onboarding new engineers costs a fraction of
  what it costs in teams where knowledge lives only in the heads of the original
  authors. This is not about covering your bases or being professional for its
  own sake. It is a productivity investment with one of the highest and most
  durable returns in software engineering.
pitfalls:
  - title: Writing documentation after the code is done
    explanation: >-
      Documentation written post-hoc describes what was built, not what should
      have been built — any design awkwardness is already locked in. Writing the
      README or API doc first forces interface clarity before a line of
      implementation is committed.
  - title: Mixing tutorial and reference content in the same document
    explanation: >-
      Blending step-by-step instructions with exhaustive API details in one wall
      of text serves neither learner well — tutorials require narrative flow,
      reference requires completeness and scanability. Keep them separate
      following the Diátaxis four-quadrant model.
  - title: Code examples that drift from reality and mislead readers
    explanation: >-
      Docs with manual code examples go stale as the API evolves, creating user
      confusion and support load. Make examples executable via doc tests, CI
      notebook checks, or runnable snippets so stale examples fail visibly
      rather than quietly misleading users.
  - title: 'ADRs never written, so decision rationale is lost'
    explanation: >-
      Without Architecture Decision Records, the team perpetually rediscovers
      why a constraint or pattern exists, relitigating past decisions at cost. A
      five-sentence ADR capturing context, options, and rationale prevents that
      regression and onboards new engineers faster.
  - title: 'Documentation treated as a deliverable, not a living asset'
    explanation: >-
      Docs written at launch and never updated become inaccurate faster than the
      code they describe. Assign documentation ownership, include doc updates in
      the PR checklist for feature changes, and audit for staleness on a regular
      schedule.
codeExamples:
  - language: typescript
    title: JSDoc as Executable Contract with Tests
    code: |-
      /**
       * Paginate an array into fixed-size pages.
       *
       * @param items - The full array to paginate.
       * @param page  - 1-based page number.
       * @param size  - Items per page (1–100).
       * @returns The slice for the requested page and total page count.
       *
       * @example
       * paginate([1,2,3,4,5], 1, 2) // => { items: [1, 2], totalPages: 3 }
       * paginate([1,2,3,4,5], 3, 2) // => { items: [5],    totalPages: 3 }
       * paginate([],           1, 10) // => { items: [],    totalPages: 0 }
       */
      export function paginate<T>(
        items: T[],
        page: number,
        size: number
      ): { items: T[]; totalPages: number } {
        if (size < 1 || size > 100) throw new RangeError("size must be 1–100");
        if (page < 1) throw new RangeError("page must be >= 1");
        const totalPages = Math.ceil(items.length / size);
        const start = (page - 1) * size;
        return { items: items.slice(start, start + size), totalPages };
      }

      // --- Tests derived directly from the JSDoc examples ---
      import { describe, it, expect } from "vitest";
      describe("paginate", () => {
        it("returns the correct slice", () => {
          expect(paginate([1,2,3,4,5], 1, 2)).toEqual({ items: [1,2], totalPages: 3 });
          expect(paginate([1,2,3,4,5], 3, 2)).toEqual({ items: [5],   totalPages: 3 });
          expect(paginate([],           1, 10)).toEqual({ items: [],   totalPages: 0 });
        });
      });
    reasoning: >-
      Writing the JSDoc @example first (documentation-driven) then deriving
      tests directly from those examples — the pattern that keeps docs and code
      in sync.
difficulty: beginner
estimatedHours: 3
lastUpdatedAt: '2026-05-14T12:31:47.552Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=t4vKPhjcMZg'
      title: 'Diátaxis: A Systematic Framework for Technical Documentation'
      author: Daniele Procida
      durationMinutes: 8
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        The Diátaxis author's short explanation of the four documentation types
        is the most concise canonical introduction to structured technical
        writing.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=p0PPtdRHGgM'
      title: What Nobody Tells You About Documentation
      author: PyCon AU
      durationMinutes: 30
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Daniele Procida's longer PyCon AU talk lays out the full Diátaxis
        argument with examples from real projects — the definitive long-form
        introduction.
      source: ai-researcher
  articles:
    - url: 'https://diataxis.fr'
      title: Diátaxis — A Systematic Framework for Technical Documentation
      kind: canonical-doc
      reasoning: >-
        The primary reference site for the Diátaxis framework, authored by its
        creator — the canonical starting point for teams adopting structured
        documentation.
      publisher: Diátaxis
      author: Daniele Procida
      source: ai-researcher
    - url: 'https://adr.github.io'
      title: Architecture Decision Records (ADR) — GitHub Pages
      kind: canonical-doc
      reasoning: >-
        The community hub for ADR tools, templates, and examples; the most
        referenced starting point for teams adopting lightweight architectural
        decision logging.
      publisher: ADR GitHub organization
      source: ai-researcher
    - url: 'https://tom.preston-werner.com/2010/08/23/readme-driven-development.html'
      title: Readme Driven Development
      kind: engineering-blog
      reasoning: >-
        Tom Preston-Werner's original 2010 essay coined the 'write the README
        first' practice and remains the most cited justification for
        documentation-driven workflows.
      author: Tom Preston-Werner
      source: ai-researcher
  services:
    - name: Docusaurus
      url: 'https://docusaurus.io'
      category: documentation-site-generator
      reasoning: >-
        Facebook's open-source documentation site generator with MDX support,
        versioning, and search — widely used for developer documentation.
      vendor: Meta (open-source)
      source: ai-researcher
    - name: MkDocs
      url: 'https://www.mkdocs.org'
      category: documentation-site-generator
      reasoning: >-
        Markdown-based documentation builder popular in Python ecosystems;
        Material for MkDocs theme makes it production-quality with minimal
        configuration.
      vendor: open-source
      source: ai-researcher
    - name: Notion
      url: 'https://www.notion.so'
      category: collaborative-documentation
      reasoning: >-
        Flexible wiki and document workspace used by many engineering teams for
        internal ADRs, runbooks, and onboarding documentation.
      vendor: Notion
      source: ai-researcher
    - name: Mintlify
      url: 'https://mintlify.com'
      category: documentation-site-generator
      reasoning: >-
        Developer-documentation platform with API reference generation, MDX
        support, and a polished default theme — popular for public API docs.
      vendor: Mintlify
      source: ai-researcher
  courses:
    - url: 'https://www.writethedocs.org/conf/'
      title: Write the Docs Conference Talks (free recordings)
      provider: Write the Docs
      paid: false
      reasoning: >-
        The Write the Docs community publishes free recordings of practical
        technical-writing talks; the closest thing to a course for
        engineering-focused documentation practice.
      source: ai-researcher
    - url: 'https://www.udemy.com/course/learn-api-technical-writing-2/'
      title: The Art of API Documentation
      provider: Udemy
      paid: true
      reasoning: >-
        Focused course on writing developer-facing API documentation with
        real-world examples — directly applicable to documentation-driven API
        design.
      instructor: Peter Gruenbaum
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.510Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
