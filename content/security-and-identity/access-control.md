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
      source: ai-researcher
    long: null
  articles:
    - url: >-
        https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Cheat_Sheet.html
      title: OWASP Authorization Cheat Sheet
      kind: canonical-doc
      reasoning: >-
        Canonical OWASP reference covering least privilege principles and common
        implementation patterns.
      publisher: OWASP
      source: ai-researcher
    - url: 'https://auth0.com/docs/manage-users/access-control/rbac'
      title: Role-Based Access Control - Auth0 Docs
      kind: canonical-doc
      reasoning: Industry-standard RBAC implementation guide with practical examples.
      publisher: Auth0
      source: ai-researcher
    - url: 'https://www.osohq.com/learn/rbac-vs-abac'
      title: 'RBAC vs ABAC: Make the Right Call'
      kind: engineering-blog
      reasoning: Authoritative comparison of RBAC and ABAC with decision criteria.
      publisher: Oso
      source: ai-researcher
  services:
    - name: Oso
      url: 'https://www.osohq.com'
      category: authorization-platform
      reasoning: >-
        Fine-grained authorization platform supporting RBAC, ABAC, and ReBAC
        patterns.
      source: ai-researcher
    - name: Open Policy Agent (OPA)
      url: 'https://www.openpolicyagent.org'
      category: policy-engine
      reasoning: >-
        CNCF graduated project for declarative authorization across applications
        and Kubernetes.
      vendor: Open Policy Agent (CNCF)
      source: ai-researcher
    - name: Casbin
      url: 'https://casbin.org'
      category: authorization-library
      reasoning: >-
        Efficient open-source access control library supporting ACL, RBAC, ABAC,
        and ReBAC across 15+ languages.
      source: ai-researcher
    - name: AWS IAM
      url: 'https://aws.amazon.com/iam/'
      category: cloud-access-control
      reasoning: >-
        Enterprise-grade IAM service for role-based access control of AWS
        resources.
      vendor: Amazon Web Services
      source: ai-researcher
  courses:
    - url: >-
        https://www.udemy.com/course/authentication-authorization-security-the-complete-guide/
      title: Build A Complete Authentication Authorization Web App
      provider: Udemy
      paid: true
      reasoning: >-
        Hands-on course covering practical implementation of RBAC and
        authorization.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
