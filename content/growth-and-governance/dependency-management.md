---
slug: dependency-management
title: Dependency Management
phase: growth-and-governance
order: 6
summary: >-
  Pin, audit, and update third-party dependencies. Manage supply-chain risk,
  vulnerability scanning, and license compliance for production software.
definition: >-
  Pin, audit, and update third-party dependencies. Manage supply-chain risk,
  vulnerability scanning, and license compliance for production software.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: 'https://docs.github.com/en/code-security/supply-chain-security'
      title: GitHub Supply Chain Security
      kind: canonical-doc
      reasoning: (no reasoning captured)
      publisher: GitHub
      source: ai-researcher
    - url: 'https://docs.npmjs.com/cli/v10/commands/npm-audit'
      title: npm audit
      kind: tutorial
      reasoning: (no reasoning captured)
      publisher: npm (GitHub)
      source: ai-researcher
  services:
    - name: Renovate Documentation
      url: 'https://docs.renovatebot.com'
      category: platform
      reasoning: (no reasoning captured)
      vendor: Mend (Renovate)
      source: ai-researcher
    - name: Snyk Open Source
      url: 'https://snyk.io'
      category: platform
      reasoning: (no reasoning captured)
      vendor: Snyk
      source: ai-researcher
    - name: OWASP Dependency-Check
      url: 'https://owasp.org/www-project-dependency-check/'
      category: platform
      reasoning: (no reasoning captured)
      vendor: OWASP
      source: ai-researcher
    - name: Semantic Versioning (SemVer)
      url: 'https://semver.org'
      category: platform
      reasoning: (no reasoning captured)
      vendor: Semantic Versioning
      source: ai-researcher
    - name: SLSA Framework
      url: 'https://slsa.dev'
      category: platform
      reasoning: (no reasoning captured)
      vendor: SLSA (OpenSSF)
      source: ai-researcher
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Dependencies are borrowed code, and borrowed code comes with obligations. The
  obligation is not just to use the package correctly — it is to know what
  version you are running, to keep that version current enough that known
  vulnerabilities are patched, to understand the license implications of
  distributing code that includes the package, and to have a plan for what
  happens when the package is abandoned or taken over by a malicious actor. Most
  teams handle the first obligation reasonably well. The rest get ignored until
  something forces the issue.


  The supply chain attack problem has moved from theoretical to routine. The npm
  ecosystem has been targeted by packages that typosquat popular names, by
  maintainers who inject malicious code into legitimate packages before
  releasing a new version, and by packages that include postinstall scripts with
  unexpected behavior. The log4shell vulnerability in late 2021 demonstrated
  that a transitive dependency — one that nobody on the team consciously chose —
  could be present in thousands of production systems. The practical response to
  this threat is not to stop using dependencies; it is to maintain visibility.
  You cannot patch a vulnerability in a package you did not know you had.


  Lock files are the baseline. A package-lock.json, yarn.lock, or poetry.lock
  file pins exact versions and produces reproducible installs. Without a lock
  file, running the same install command on two different machines on different
  days can produce different results if any dependency released a new version in
  between. This is not a theoretical concern — it is the explanation for a
  category of CI failures and "works on my machine" incidents that waste hours.
  Committing the lock file to the repository and treating it as a first-class
  artifact is the minimum viable dependency management practice.


  The 80/20 in dependency management: use a lock file, run automated
  vulnerability scanning in CI (GitHub's Dependabot, Snyk, or similar), review
  the transitive dependency tree when adding new packages, and audit licenses
  for anything that will be distributed externally. The vulnerability scanning
  step is the one with the highest return on investment — modern tools alert you
  when a new CVE affects a package in your lock file, which turns "we discovered
  we were vulnerable six months after the fact" into "we patched within a week
  of disclosure." License auditing is the step most engineering teams skip but
  that legal teams care about when a product ships or a company is acquired —
  GPL dependencies in a proprietary product are not a small problem.


  Dependency management connects upstream to CI/CD — automated updates and
  vulnerability patches flow through the same pipeline as feature changes and
  need to pass the same test suite before merging. It connects to security more
  broadly: a patching cadence is only useful if it is fast enough to get ahead
  of active exploitation, which means the pipeline needs to be reliable enough
  that a security patch can go from alert to production in hours, not weeks. It
  also pairs with data integrity and reliability concerns: upgrading a major
  version of an ORM or database driver is a dependency update with potentially
  significant behavioral changes, and testing that upgrade rigorously before
  deploying it is not optional.
pitfalls:
  - title: Not committing lock files to the repository
    explanation: >-
      Without a committed lock file, two installs of the same project on
      different days can produce different dependency trees if any upstream
      package released a new version. This explains a category of CI failures
      and environment-specific bugs that appear unrelated to any code change.
  - title: Ignoring transitive dependencies in security audits
    explanation: >-
      Log4Shell was a transitive dependency vulnerability — many affected teams
      didn't know they had log4j at all. Scanning only direct dependencies
      misses the majority of the dependency surface area. Vulnerability scanning
      tools that analyze the full dependency tree are not optional for
      production software.
  - title: Letting vulnerability alerts accumulate without a patch SLA
    explanation: >-
      Automated scanners generate alerts, but alerts only reduce risk if they
      trigger action within a timeframe shorter than active exploitation. Teams
      without a defined patching cadence treat the alert backlog as noise, and
      high-severity CVEs sit unpatched for months while the tool faithfully
      reports them every day.
  - title: Adding packages without reviewing postinstall scripts
    explanation: >-
      npm and other package managers allow packages to run arbitrary code during
      installation via postinstall scripts. This is a common vector for supply
      chain attacks — a compromised or malicious package can exfiltrate
      credentials or modify files during a routine install. New packages should
      be reviewed before being added to a production dependency graph.
  - title: Skipping license audits on distributed software
    explanation: >-
      GPL and AGPL dependencies in a proprietary product create license
      conflicts that surface during acquisitions, legal reviews, or when a
      competitor complains. Most engineering teams skip license auditing
      entirely until it becomes a legal problem — and retrofitting a license
      audit across years of accumulated dependencies is not a quick process.
  - title: Upgrading major dependency versions without regression testing
    explanation: >-
      A major version bump to an ORM, database driver, or HTTP client often
      changes behavior in ways that don't cause immediate errors but produce
      subtly wrong results — different query plans, altered serialization,
      changed timeout semantics. Merging major upgrades through the same
      pipeline as routine patches, without specific regression coverage, is how
      silent behavioral regressions reach production.
codeExamples:
  - language: typescript
    title: (pending)
    code: // pending code example with at least 20 chars of real code
    reasoning: pending
difficulty: intermediate
estimatedHours: 4
---
<!-- user notes -->
