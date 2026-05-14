---
slug: access-control
title: Access Control
phase: security-and-identity
order: 2
summary: >-
  Enforce who can do what in your application using RBAC, ABAC, or policy-based
  authorization systems.
definition: >-
  Access control is the process of enforcing who can perform which actions on
  what resources in your application, forming the cornerstone of application
  security alongside authentication. It implements the security principle of
  least privilege—granting users or processes only the minimum permissions
  necessary to accomplish their assigned tasks. Access control can be enforced
  through multiple models: Role-Based Access Control (RBAC) assigns permissions
  based on user roles within an organization; Attribute-Based Access Control
  (ABAC) makes decisions based on attributes of the user, resource, and
  environment; Policy-Based Access Control (PBAC) uses declarative policies as
  code to define authorization rules; and Relationship-Based Access Control
  (ReBAC) models permissions through graph-like relationships between entities.


  Modern access control systems range from simple Access Control Lists (ACLs)
  that map subjects to objects, to sophisticated policy engines like Open Policy
  Agent (OPA) that evaluate complex rules across distributed systems.
  Authorization must be distinguished from authentication—authentication
  verifies who you are, while authorization determines what you're allowed to
  do. Broken or misconfigured access control is consistently ranked as a
  critical vulnerability by OWASP and NIST, making proper implementation
  essential for compliance with standards like NIST 800-53, SOC 2, and HIPAA.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=enztHVaMiMc'
      title: RBAC vs. ABAC vs. ReBAC in under 5 minutes
      author: Oso
      durationMinutes: 5
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: Concise beginner-friendly comparison of three core authorization models.
    long: null
  articles:
    - url: >-
        https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
      title: OWASP Authorization Cheat Sheet
      kind: canonical-doc
      reasoning: >-
        Canonical OWASP reference covering least privilege principles and common
        implementation patterns.
    - url: 'https://auth0.com/docs/manage-users/access-control/rbac'
      title: Role-Based Access Control - Auth0 Docs
      kind: canonical-doc
      reasoning: Industry-standard RBAC implementation guide with practical examples.
    - url: 'https://www.osohq.com/learn/rbac-vs-abac'
      title: 'RBAC vs ABAC: Make the Right Call'
      kind: engineering-blog
      reasoning: Authoritative comparison of RBAC and ABAC with decision criteria.
  services:
    - name: Oso
      url: 'https://www.osohq.com'
      category: authorization-platform
      reasoning: >-
        Fine-grained authorization platform supporting RBAC, ABAC, and ReBAC
        patterns.
    - name: Open Policy Agent (OPA)
      url: 'https://www.openpolicyagent.org'
      category: policy-engine
      reasoning: >-
        CNCF graduated project for declarative authorization across applications
        and Kubernetes.
    - name: Casbin
      url: 'https://casbin.org'
      category: authorization-library
      reasoning: >-
        Efficient open-source access control library supporting ACL, RBAC, ABAC,
        and ReBAC across 15+ languages.
    - name: AWS IAM
      url: 'https://aws.amazon.com/iam/'
      category: cloud-access-control
      reasoning: >-
        Enterprise-grade IAM service for role-based access control of AWS
        resources.
  courses:
    - url: >-
        https://www.udemy.com/course/authentication-authorization-security-the-complete-guide/
      title: Build A Complete Authentication Authorization Web App
      provider: Udemy
      paid: true
      reasoning: >-
        Hands-on course covering practical implementation of RBAC and
        authorization.
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Access control is the part of security that actually gets you breached.
  Authentication gets most of the attention — teams spend weeks on OAuth flows
  and MFA — but broken access control is consistently the number one
  vulnerability in the OWASP Top 10, and has been for years. The failure mode
  isn't usually an attacker breaking encryption. It's a user with a valid
  session hitting an endpoint they were never supposed to reach and getting back
  data that wasn't theirs. That happens because the authentication layer worked
  perfectly and the authorization layer wasn't there.


  The core distinction worth internalizing is: authentication answers "who are
  you?" and access control answers "what are you allowed to do?" Those are
  completely separate concerns, and conflating them is where teams get into
  trouble. A common pattern in early-stage apps is to check "is the user logged
  in?" and then trust that any logged-in user can do anything. That works fine
  until you add a second user. The moment you have multi-tenancy, admin roles,
  or shared resources, you need an actual authorization model — and retrofitting
  one onto an app that wasn't designed for it is painful.


  Role-Based Access Control (RBAC) is the right default for most applications.
  You define roles — admin, member, viewer — and attach permissions to roles
  rather than directly to users. It's easy to reason about and easy to audit.
  Where RBAC breaks down is when you need fine-grained control over individual
  resources: user A can edit document X but not document Y, and user B can only
  read document X. That's where Relationship-Based Access Control (ReBAC) shines
  — it models permissions as a graph of relationships between users and objects,
  which is how Google Zanzibar works and why Notion, Figma, and similar tools
  can implement sharing with granular per-document control. ABAC is powerful but
  complex; it's the right tool when you need policy decisions that depend on
  environmental context like time-of-day or request origin, not the right
  starting point.


  The implementation mistake that causes the most pain is checking permissions
  in the wrong layer. If your authorization logic lives in the UI — showing or
  hiding buttons based on role — but not in the API, you have the illusion of
  access control without the reality. An attacker (or a curious user with dev
  tools) can call the API directly. Every state-mutating endpoint needs its own
  authorization check, server-side, regardless of what the client shows. A close
  second is over-relying on ID obscurity: using UUIDs instead of sequential
  integers doesn't protect you from IDOR (Insecure Direct Object Reference)
  vulnerabilities if you're not checking ownership on every lookup.


  The mental model: think of every action in your system as a triple — subject,
  verb, object. "User 42 wants to delete comment 17." Your authorization layer
  needs to answer that question cleanly and consistently. Tools like Open Policy
  Agent let you write those rules declaratively and test them in isolation from
  application code, which is valuable because authorization rules tend to
  accumulate complexity quickly and need their own test coverage. Access control
  pairs directly with authentication (you can't authorize without an
  authenticated identity) and with audit logging (you need a record of who did
  what for compliance and incident response).
pitfalls:
  - title: Enforcing authorization only in the UI layer
    explanation: >-
      Showing or hiding buttons based on role gives the illusion of access
      control, but any user with dev tools can call the underlying API directly.
      Every state-mutating endpoint must perform its own authorization check
      server-side, independent of what the client renders.
  - title: Conflating authentication with authorization
    explanation: >-
      Checking 'is the user logged in?' and then allowing any logged-in user to
      perform any action is the default failure mode for single-tenant apps that
      grow into multi-tenant ones. Authentication confirms identity;
      authorization must separately and explicitly confirm permission for each
      action.
  - title: Relying on UUID obscurity to prevent IDOR
    explanation: >-
      Using non-sequential IDs makes object references harder to guess but
      provides zero security if ownership is never verified. An attacker with a
      valid session and any valid resource ID can access data that isn't theirs;
      every resource lookup must check that the requesting subject owns or has
      rights to that object.
  - title: Retrofitting access control onto an app built without it
    explanation: >-
      Adding fine-grained authorization to a codebase that assumed all users
      were equal is one of the most painful refactors in backend engineering —
      permission checks get scattered inconsistently across dozens of endpoints.
      Designing for at least a basic authorization model from the first
      multi-user feature is far cheaper than doing it later.
  - title: Granting overly broad roles to avoid friction
    explanation: >-
      Making everyone an admin or giving service accounts production-level
      permissions because it is easier than scoping access correctly violates
      least-privilege and widens the blast radius of any compromise. Roles and
      service account permissions should be the minimum necessary to accomplish
      the task, reviewed periodically.
codeExamples:
  - language: typescript
    title: RBAC permission check middleware
    code: >-
      type Permission = 'posts:read' | 'posts:write' | 'posts:delete' |
      'admin:users';


      const ROLE_PERMISSIONS: Record<string, Permission[]> = {
        viewer:  ['posts:read'],
        editor:  ['posts:read', 'posts:write'],
        admin:   ['posts:read', 'posts:write', 'posts:delete', 'admin:users'],
      };


      function can(userRole: string, action: Permission): boolean {
        return ROLE_PERMISSIONS[userRole]?.includes(action) ?? false;
      }


      // Express middleware factory

      import type { Request, Response, NextFunction } from 'express';


      function requirePermission(action: Permission) {
        return (req: Request, res: Response, next: NextFunction) => {
          const role = (req as any).user?.role;
          if (!role || !can(role, action)) {
            res.status(403).json({ error: 'Forbidden' });
            return;
          }
          next();
        };
      }


      // Usage on route

      // router.delete('/posts/:id', requirePermission('posts:delete'),
      deletePostHandler);
    reasoning: >-
      A single reusable middleware that checks permissions server-side on every
      mutating route is the most common RBAC pattern — it prevents the UI-only
      access control trap.
  - language: typescript
    title: Resource ownership check prevents IDOR
    code: |-
      import type { Request, Response } from 'express';
      import { db } from './db';

      async function getComment(req: Request, res: Response) {
        const commentId = Number(req.params.id);
        const userId = (req as any).user.id;

        const comment = await db.query(
          'SELECT * FROM comments WHERE id = $1',
          [commentId]
        );

        if (!comment) {
          res.status(404).json({ error: 'Not found' });
          return;
        }

        // Ownership check: logged-in user must own the resource
        if (comment.author_id !== userId) {
          // Return 404, not 403, to avoid leaking resource existence
          res.status(404).json({ error: 'Not found' });
          return;
        }

        res.json(comment);
      }
    reasoning: >-
      Checking resource ownership at the data-fetch layer (not just in the UI)
      is the fix for IDOR vulnerabilities — returning 404 instead of 403 also
      avoids leaking whether a resource exists.
difficulty: intermediate
estimatedHours: 8
tldr: >-
  Enforce who can do what in your app. Admin sees everything, viewer sees
  limited data, and unauthorized users see nothing. The difference between a
  safe app and a breach.
shortExplainerVideo:
  url: 'https://www.youtube.com/watch?v=rvZ35YW4t5k'
  title: Role-based access control (RBAC) vs. Attribute-based access control (ABAC)
  author: IBM Technology
  durationSeconds: 459
  reasoning: >-
    IBM Distinguished Engineer Jeff Crume explains RBAC and ABAC in depth —
    exactly the two dominant access control models covered in the topic. IBM
    Technology is a top-tier authoritative source. 7:39 runtime fits the
    short-explainer window and covers the core RBAC/ABAC tradeoff that
    practitioners need to understand.
  source: ai-researcher
lastUpdatedAt: '2026-05-14T12:44:38.142Z'
---
<!-- user notes -->
