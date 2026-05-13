---
slug: support-ops
title: Support Operations
phase: growth-and-governance
order: 3
summary: >-
  Build tooling and processes for customer support, including admin dashboards,
  audit logs, and runbooks so support staff can resolve issues without direct
  database access.
definition: >-
  Build tooling and processes for customer support, including admin dashboards,
  audit logs, and runbooks so support staff can resolve issues without direct
  database access.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles: []
  services: []
  courses: []
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  The support ticket that requires a developer to run a SQL query against the
  production database is a failure mode, not a workflow. It's a failure of
  tooling, but it's also a failure of trust: your support team can't do their
  job, your engineers are context-switching to babysit simple lookups, and your
  production database is being probed by people whose job is to talk to
  customers, not manage data. Every startup goes through a phase where this is
  the norm — "just ping an engineer" is fast in the short run. The problem is
  that it doesn't scale, it's a security risk (how many people have production
  read access?), and it creates a shadow knowledge base that lives entirely in
  Slack threads and gets lost when engineers leave.


  The 80/20 for support ops is: build an admin dashboard that covers the top ten
  things your support team does every day, make sure it has an audit log, and
  write runbooks for the five most common incident types before you need them.
  The admin dashboard doesn't have to be beautiful. It needs to answer questions
  like: what is this user's current plan, when did they last log in, what
  actions did they take in the last 24 hours, did their last payment go through?
  Metabase or a simple internal Rails admin (or Django admin, or Retool) that
  queries your read replica is often all you need. The audit log is
  non-negotiable — not because you don't trust your support team, but because
  when something goes wrong you need to know what changed and who changed it.


  The dominant failure mode is building support tooling reactively rather than
  proactively. You wait until a customer complaint reveals a gap, build a
  one-off fix, and accumulate a patchwork of tools that are inconsistent and
  hard to train new support staff on. A related failure is giving support staff
  direct database access as a shortcut — it's fast but it means queries run on
  production without review, schema changes can confuse people running ad-hoc
  queries, and there's no audit trail for what was read or modified. The other
  thing that almost always gets skipped until it's painful: runbooks. The third
  time an engineer is pulled into a Slack thread to explain how to process a
  refund or re-send a verification email, that's the moment to write the
  runbook. Ideally you write it the first time.


  Think about support ops the way you think about internal APIs: the support
  team is a consumer of your system's capabilities, and their access should be
  mediated through intentional interfaces rather than raw database connections.
  That framing helps you make the right decisions about what to expose and how.
  An admin action to "resend welcome email" should be a button that calls a
  well-tested code path, not a support agent manually constructing a trigger in
  the database. This makes the action auditable, safe, and consistent. It also
  means the logic is tested — you know it works because it goes through the same
  code path that runs in production, not a one-off SQL statement.


  In the broader product ecosystem, support ops is the operational layer that
  sits between your engineering systems and your customer-facing team. It
  connects to billing (subscription state lookups, refund processing), to
  authentication (account recovery, session invalidation), to audit logging
  (what did this user do?), and to your incident runbooks. Getting it right
  means your support team can resolve the majority of issues independently
  during business hours without paging an engineer, and they can resolve them
  confidently because the tools they're using are safe, audited, and documented.
  That's not just a quality-of-life improvement for engineers — it's a
  meaningful factor in how quickly you can grow your support team and maintain
  quality as the customer base scales.
pitfalls:
  - title: Granting support staff direct production database access
    explanation: >-
      Ad-hoc SQL queries run against production by support agents leave no audit
      trail, risk accidental data modification, and expose schema details that
      should be internal. Build admin tooling that calls reviewed code paths
      instead, so every action is auditable and safe by construction.
  - title: Building support tooling reactively after complaints
    explanation: >-
      Waiting for the third support ticket about a common issue before building
      a tool means engineers are repeatedly interrupted and support agents lack
      confidence in their workflows. Identify the ten most frequent support
      actions at launch and build tooling for them proactively, before volume
      makes the pain undeniable.
  - title: No audit log on admin actions
    explanation: >-
      If a support agent resets a user's password or applies a credit and there
      is no record of it, the next agent handling the same account starts from a
      false picture of what happened. Every write action in your admin tooling
      must record who did what and when, both for accountability and for
      debugging.
  - title: Runbooks that live only in someone's head
    explanation: >-
      The engineer who knows how to process a manual refund or unblock a stuck
      import leaves, and the next incident takes three times as long to resolve.
      Write the runbook the first time you handle each class of issue — not
      after the third repetition — and keep it alongside the tooling it
      describes.
  - title: Admin tooling that queries the primary database under load
    explanation: >-
      Support dashboards running expensive account-lookup queries against the
      production primary database add unpredictable load and can degrade the
      application for all users during incidents — exactly when support activity
      peaks. Point admin tooling at a read replica with appropriate connection
      limits.
codeExamples:
  - language: typescript
    title: Audited Admin Action Wrapper
    code: >-
      // Every support action goes through this — never raw DB writes from an
      admin UI


      interface AdminContext {
        actorId: string;   // support agent's user ID
        reason: string;    // required: why this action is being taken
        ticketRef?: string;
      }


      interface AuditLog {
        actorId: string;
        action: string;
        targetId: string;
        before: unknown;
        after: unknown;
        reason: string;
        ticketRef?: string;
        performedAt: Date;
      }


      // Simulated dependencies

      declare const db: {
        auditLogs: { insert(log: AuditLog): Promise<void> };
      };


      async function adminAction<T>(
        action: string,
        targetId: string,
        ctx: AdminContext,
        perform: () => Promise<{ before: unknown; after: T }>,
      ): Promise<T> {
        const { before, after } = await perform();

        await db.auditLogs.insert({
          actorId: ctx.actorId,
          action,
          targetId,
          before,
          after,
          reason: ctx.reason,
          ticketRef: ctx.ticketRef,
          performedAt: new Date(),
        });

        return after;
      }


      // Example: resend a verification email through a tested code path

      async function resendVerificationEmail(
        userId: string,
        ctx: AdminContext,
      ) {
        return adminAction('resend_verification_email', userId, ctx, async () => {
          // before state for the audit record
          const before = { emailSentAt: null };
          // actual action — same code path as the normal product flow
          await sendVerificationEmail(userId);
          const after = { emailSentAt: new Date().toISOString() };
          return { before, after };
        });
      }


      declare function sendVerificationEmail(userId: string): Promise<void>;
    reasoning: >-
      The audit wrapper pattern forces every support action through a logged,
      intentional interface rather than ad-hoc DB writes, making actions
      traceable and safe by default.
  - language: sql
    title: Support Lookup View For Read Replica
    code: >-
      -- A read-only view for support tooling: answers the top questions without
      DB write access

      -- Point your admin dashboard at the read replica with a read-only role.


      CREATE OR REPLACE VIEW support_user_summary AS

      SELECT
        u.id                             AS user_id,
        u.email,
        u.created_at,
        u.last_sign_in_at,
        s.state                          AS subscription_state,
        s.current_period_end             AS access_until,
        s.plan_id,
        p.last_four                      AS card_last_four,
        p.next_retry_at                  AS payment_retry_at,
        COUNT(DISTINCT t.id)             AS open_ticket_count,
        MAX(al.performed_at)             AS last_admin_action_at
      FROM users u

      LEFT JOIN subscriptions s  ON s.user_id = u.id AND s.is_current

      LEFT JOIN payment_methods p ON p.user_id = u.id AND p.is_primary

      LEFT JOIN tickets t         ON t.user_id = u.id AND t.status = 'open'

      LEFT JOIN audit_logs al     ON al.target_id = u.id::text

      GROUP BY u.id, u.email, u.created_at, u.last_sign_in_at,
               s.state, s.current_period_end, s.plan_id,
               p.last_four, p.next_retry_at;

      -- Grant read-only role access (never write access from the support
      dashboard)

      GRANT SELECT ON support_user_summary TO support_readonly_role;
    reasoning: >-
      A single denormalized view over the read replica answers 80% of support
      lookups without giving agents write access or requiring raw table
      knowledge.
difficulty: beginner
estimatedHours: 3
---
<!-- user notes -->
