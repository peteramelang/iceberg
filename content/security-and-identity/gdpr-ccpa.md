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
  articles:
    - url: 'https://gdpr.eu'
      title: GDPR — Official EU Regulation
      kind: canonical-doc
      reasoning: >-
        Canonical EU source for GDPR guidance and data-subject-rights
        definitions.
    - url: 'https://oag.ca.gov/privacy/ccpa'
      title: California Consumer Privacy Act — Attorney General
      kind: canonical-doc
      reasoning: Official CCPA requirements and business obligations.
    - url: 'https://www.iapp.org'
      title: IAPP — International Association of Privacy Professionals
      kind: canonical-doc
      reasoning: >-
        Professional body providing GDPR/CCPA training, certifications, and
        global tracking.
  services:
    - name: OneTrust
      url: 'https://www.onetrust.com'
      category: privacy-platform
      reasoning: Market-leading enterprise privacy and compliance platform.
    - name: TrustArc
      url: 'https://trustarc.com'
      category: privacy-platform
      reasoning: Privacy data governance with automated compliance and DSR management.
    - name: Securiti
      url: 'https://securiti.ai'
      category: privacyops
      reasoning: PrivacyOps platform automating PI discovery and DSR workflows.
    - name: DataGrail
      url: 'https://www.datagrail.io'
      category: dsr-orchestration
      reasoning: >-
        Specialized DSR platform orchestrating requests across thousands of
        integrations.
    - name: Transcend
      url: 'https://transcend.io'
      category: privacy-platform
      reasoning: 'Compliance layer automating data deletion, access, and opt-outs.'
  courses:
    - url: 'https://www.udemy.com/course/learn-gdpr/'
      title: 'GDPR Complete Guide: Data Protection and Privacy Compliance'
      provider: Udemy
      paid: true
      reasoning: >-
        Comprehensive course on GDPR governance, cookie rules, and real-world
        enforcement.
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
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
  - title: No Data Map Makes Deletion Requests Impossible to Fulfill
    explanation: >-
      Before you can delete a user's data, you must know where it lives — not
      just the primary application database, but analytics event streams, error
      tracking services, log aggregators, data warehouse snapshots, email
      service provider lists, and cold storage backups. Most systems accumulate
      personal data in places engineers stopped thinking about. Build the data
      map before building the deletion pipeline; attempting deletion without it
      produces incomplete erasure, which is not compliant.
  - title: Consent Banner That Does Not Actually Control Data Collection
    explanation: >-
      A cookie consent banner that is implemented purely as a UI element while
      the backend continues collecting and processing data regardless of consent
      state is legal theater, not compliance. The consent signal must flow from
      the UI through to every data collection and processing system it governs.
      Verify that declining analytics consent actually prevents analytics events
      from being sent, not just that the banner appears and closes.
  - title: Incomplete Deletion That Misses Secondary Data Stores
    explanation: >-
      A DSR pipeline that removes a user from the production database but leaves
      their data in the search index, analytics tables, and backup snapshots has
      not fulfilled a deletion request. Incomplete deletion is a compliance
      failure even when the primary delete succeeds. Map every secondary store
      at implementation time, test the full pipeline against a realistic data
      footprint, and log exactly which systems were queried and what was removed
      for every request.
  - title: Manual DSR Processes That Cannot Scale
    explanation: >-
      Responding to data subject requests by hand — an engineer queries the
      database and exports a CSV — breaks under volume and introduces
      response-time risk. GDPR requires a response within 30 days; CCPA within
      45. A single viral news story can generate hundreds of requests in a week.
      Build an automated DSR pipeline that can receive a request, query every
      relevant system, and return or delete data without manual intervention.
  - title: Missing Audit Trails for Consent and Deletions
    explanation: >-
      GDPR requires that you can demonstrate compliance, not just claim it. If
      you cannot show when consent was given, on what version of a privacy
      notice, when a deletion request arrived, and what data was deleted, you
      cannot pass an audit or respond to a regulatory inquiry. Log consent
      events with timestamps and version references, and log every step of every
      DSR execution as immutable records separate from the data being deleted.
  - title: PII Captured Accidentally in Logs and Error Tracking
    explanation: >-
      Request bodies, query parameters, and error context passed to logging and
      error tracking systems frequently contain personal data — names, email
      addresses, IP addresses, authentication tokens — without any deliberate
      decision to collect it. This data is subject to the same retention and
      deletion obligations as intentionally collected PII, but is rarely
      included in data maps or DSR pipelines. Audit what your logging and error
      tracking systems capture and apply scrubbing or masking at the
      instrumentation layer.
codeExamples:
  - language: typescript
    title: Data Subject Erasure Request Pipeline
    code: >-
      import { createHash } from 'crypto';


      interface ErasureResult {
        system: string;
        status: 'erased' | 'not_found' | 'error';
        detail?: string;
      }


      // Anonymise rather than hard-delete where referential integrity requires
      it

      function pseudonymise(userId: string): string {
        return 'deleted-' + createHash('sha256').update(userId).digest('hex').slice(0, 16);
      }


      async function handleErasureRequest(
        userId: string,
        requestId: string
      ): Promise<ErasureResult[]> {
        const results: ErasureResult[] = [];

        // 1. Application database: anonymise PII fields, keep order records for accounting
        try {
          await db.query(
            `UPDATE users
             SET email = $2, name = 'Deleted User', phone = NULL,
                 address = NULL, deleted_at = now(), gdpr_erasure_id = $3
             WHERE id = $1 AND deleted_at IS NULL`,
            [userId, `${pseudonymise(userId)}@deleted.invalid`, requestId]
          );
          results.push({ system: 'postgres:users', status: 'erased' });
        } catch (err: any) {
          results.push({ system: 'postgres:users', status: 'error', detail: err.message });
        }

        // 2. Analytics event store — delete or redact
        try {
          await analyticsClient.deleteUserEvents(userId);
          results.push({ system: 'analytics:events', status: 'erased' });
        } catch (err: any) {
          results.push({ system: 'analytics:events', status: 'error', detail: err.message });
        }

        // 3. Email service list
        try {
          await emailProvider.unsubscribeAndDelete(userId);
          results.push({ system: 'email-provider', status: 'erased' });
        } catch (err: any) {
          results.push({ system: 'email-provider', status: 'error', detail: err.message });
        }

        // 4. Audit log — immutable, records the erasure itself
        await auditLog.record({ event: 'gdpr.erasure', userId, requestId, results, ts: new Date() });

        return results;
      }


      // Stubs for illustration

      const db = { query: async (..._: any[]) => {} };

      const analyticsClient = { deleteUserEvents: async (_: string) => {} };

      const emailProvider = { unsubscribeAndDelete: async (_: string) => {} };

      const auditLog = { record: async (_: object) => {} };
    reasoning: >-
      A multi-system erasure pipeline that pseudonymises rather than
      hard-deletes (preserving referential integrity), covers every data store
      in sequence, and writes an immutable audit record is the practical
      implementation of the GDPR right to erasure — the most operationally
      complex of the data subject rights.
  - language: sql
    title: Data Retention Enforcement Query
    code: >-
      -- Run nightly as a scheduled job to enforce retention policy.

      -- Adjust intervals per your privacy policy and legal review.


      -- 1. Anonymise users inactive beyond retention window (e.g. 3 years)

      UPDATE users

      SET
        email       = 'retained-' || encode(sha256(id::text::bytea), 'hex') || '@deleted.invalid',
        name        = 'Retained User',
        phone       = NULL,
        address     = NULL,
        deleted_at  = now()
      WHERE
        last_active_at < now() - INTERVAL '3 years'
        AND deleted_at IS NULL;

      -- 2. Purge analytics events older than 13 months (common GDPR practice)

      DELETE FROM analytics_events

      WHERE created_at < now() - INTERVAL '13 months';


      -- 3. Purge raw session logs older than 90 days

      DELETE FROM session_logs

      WHERE created_at < now() - INTERVAL '90 days';


      -- 4. Record that the retention job ran (immutable audit trail)

      INSERT INTO retention_audit_log (run_at, users_anonymised, events_purged,
      session_logs_purged)

      SELECT
        now(),
        (SELECT count(*) FROM users WHERE deleted_at >= now() - INTERVAL '1 minute'),
        (SELECT count(*) FROM analytics_events WHERE created_at < now() - INTERVAL '13 months'),
        0
      ;
    reasoning: >-
      Automated retention enforcement via a nightly SQL job is more reliable
      than manual processes and directly implements the GDPR principle of
      storage limitation — retaining personal data only as long as the purpose
      requires — with an audit record that demonstrates compliance.
difficulty: intermediate
estimatedHours: 8
---
<!-- user notes -->
