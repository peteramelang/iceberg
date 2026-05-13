---
slug: gdpr-ccpa
title: GDPR / CCPA Compliance
phase: security-and-identity
order: 6
summary: >-
  Implement data subject rights (access, deletion, portability) and consent
  flows to comply with major global privacy regulations.
definition: >-
  GDPR (General Data Protection Regulation, EU) and CCPA (California Consumer
  Privacy Act) are landmark privacy laws granting individuals significant rights
  over their personal data. GDPR provides eight rights including access, erasure
  (right to be forgotten), data portability, rectification, and restriction of
  processing; CCPA grants the right to know, delete, opt-out of sale, correct
  inaccurate data, and limit the use of sensitive personal information.


  Compliance requires organizations to provide transparent privacy notices,
  verify consumer identity for requests, respond within statutory timeframes
  (GDPR: 30 days; CCPA: 45 days, extendable), and document accountability
  through data processing records. Engineering work to operationalize these
  rights includes consent collection flows, automated data subject request (DSR)
  pipelines, retention enforcement, and audit logging.
needsManualPick: false
resources:
  videos:
    short: null
    long:
      url: 'https://www.youtube.com/watch?v=kLFFnAONHvU'
      title: GDPR Compliance Explained
      author: Simplilearn
      durationMinutes: 25
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Comprehensive overview of GDPR compliance fundamentals and data-handling
        requirements.
      source: ai-researcher
  articles:
    - url: 'https://gdpr.eu'
      title: GDPR — Official EU Regulation
      kind: canonical-doc
      reasoning: >-
        Canonical EU source for GDPR guidance and data-subject-rights
        definitions.
      publisher: GDPR.eu
      source: ai-researcher
    - url: 'https://oag.ca.gov/privacy/ccpa'
      title: California Consumer Privacy Act — Attorney General
      kind: canonical-doc
      reasoning: Official CCPA requirements and business obligations.
      publisher: California Attorney General
      source: ai-researcher
    - url: 'https://www.iapp.org'
      title: IAPP — International Association of Privacy Professionals
      kind: canonical-doc
      reasoning: >-
        Professional body providing GDPR/CCPA training, certifications, and
        global tracking.
      publisher: IAPP
      source: ai-researcher
  services:
    - name: OneTrust
      url: 'https://www.onetrust.com'
      category: privacy-platform
      reasoning: Market-leading enterprise privacy and compliance platform.
      source: ai-researcher
    - name: TrustArc
      url: 'https://trustarc.com'
      category: privacy-platform
      reasoning: Privacy data governance with automated compliance and DSR management.
      source: ai-researcher
    - name: Securiti
      url: 'https://securiti.ai'
      category: privacyops
      reasoning: PrivacyOps platform automating PI discovery and DSR workflows.
      source: ai-researcher
    - name: DataGrail
      url: 'https://www.datagrail.io'
      category: dsr-orchestration
      reasoning: >-
        Specialized DSR platform orchestrating requests across thousands of
        integrations.
      source: ai-researcher
    - name: Transcend
      url: 'https://transcend.io'
      category: privacy-platform
      reasoning: 'Compliance layer automating data deletion, access, and opt-outs.'
      source: ai-researcher
  courses:
    - url: 'https://www.udemy.com/course/learn-gdpr/'
      title: 'GDPR Complete Guide: Data Protection and Privacy Compliance'
      provider: Udemy
      paid: true
      reasoning: >-
        Comprehensive course on GDPR governance, cookie rules, and real-world
        enforcement.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Privacy compliance is easy to dismiss as a legal problem until the first data
  subject request arrives in your inbox and you discover that your system has no
  coherent answer to the question "where does this user's data live." The
  engineering work required to respond to GDPR and CCPA obligations touches
  nearly every layer of the stack: the database schema, the data pipeline, the
  logging infrastructure, the backup and retention systems, and the consent
  flows in the product itself. Teams that treat privacy as a checkbox at the end
  of a feature build consistently find themselves doing expensive retroactive
  work. Teams that treat it as a design constraint from the start find it's
  manageable.


  The two laws cover different jurisdictions but converge on similar principles.
  GDPR governs personal data of people in the EU and applies globally to any
  company that processes that data. CCPA governs California residents' data.
  Both grant individuals meaningful rights: the right to know what data you hold
  about them, the right to have it deleted, the right to receive a copy of it in
  a portable format, and the right to correct inaccurate data. GDPR adds
  restrictions on the legal basis for processing data in the first place — you
  need a documented reason (consent, legitimate interest, contractual necessity)
  for collecting and processing personal data, which is a constraint that shapes
  product design well before any user exercises a right.


  The 80/20 for engineering compliance: build a data map first. Before you can
  delete a user's data, you have to know where it is. Most systems accumulate
  personal data in places engineers stop thinking about — application databases,
  analytics event streams, error tracking services (Sentry captures request
  bodies that may contain PII), log aggregators (Datadog logs may contain IP
  addresses and user identifiers), email service provider lists, data warehouse
  snapshots, and cold storage backups. The data map is the prerequisite for
  everything else. Once you know where data lives, you can build a data subject
  request (DSR) pipeline: an automated workflow that, when triggered with a user
  identifier, queries every relevant system and either returns the data (for
  access requests) or deletes it (for erasure requests). Manual DSR processes
  break at scale and introduce response-time risk — GDPR requires response
  within 30 days, CCPA within 45.


  The failure modes are predictable. The first is incomplete deletion: the DSR
  pipeline removes the user from the production database but misses the
  analytics events table, the backup snapshots, and the search index. A deletion
  that isn't complete isn't compliant. The second failure mode is consent
  without control: the cookie consent banner is implemented, but the backend
  doesn't actually respect what users consent to — data is collected and
  processed regardless of consent state, with the banner serving as a legal
  theater prop rather than a functional control. The third is missing audit
  trails: GDPR requires that you document your data processing activities and be
  able to demonstrate compliance. If you can't show when consent was given, when
  a deletion request was processed, and what data was deleted, you can't
  demonstrate compliance even if you are compliant.


  The mental model that makes privacy engineering coherent is to think of
  personal data as borrowed. The user lent it to you for a specific purpose,
  under specific terms, for a specific period. Like any loan, there are
  obligations: use it only for the agreed purpose, return it when asked, and
  keep records of the transaction. That framing makes the engineering
  requirements feel less arbitrary. Retention policies (don't keep data longer
  than the purpose requires) are loan terms. Access controls (only systems that
  need the data should have it) are custody requirements. DSR pipelines are the
  mechanism for returning the loan. Consent flows are the loan agreement.
  Engineers who understand why these mechanisms exist, rather than just that
  they're required, tend to build them more robustly.
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
---
<!-- user notes -->
