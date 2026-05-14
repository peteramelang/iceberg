---
slug: documentation-driven-development
title: Documentation-Driven Development
phase: developer-experience-and-craft
order: 5
summary: >-
  Write the README first. ADRs as code. Doc tests. Treat documentation as an API
  contract with future readers.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
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
lastUpdatedAt: '2026-05-14T12:26:04.510Z'
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
