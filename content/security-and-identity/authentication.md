---
slug: authentication
title: Authentication
phase: security-and-identity
order: 1
summary: >-
  Verify user identity securely using industry-standard protocols such as OAuth
  2.0, OIDC, and session management best practices.
definition: >-
  Authentication is the process of verifying that an individual, entity, or
  website is who or what it claims to be. It establishes identity through
  credentials like passwords, tokens, biometrics, or multi-factor authentication
  before granting access to resources or systems. Authentication differs from
  authorization—once a user's identity is confirmed, authorization determines
  what they are permitted to do. Modern authentication systems employ multiple
  strategies including session-based authentication using cookies, token-based
  approaches like JWT, OAuth for delegated access, and passwordless methods such
  as WebAuthn and one-time passwords (OTP), each offering different security and
  usability tradeoffs for different application contexts.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=N9lgIzizV0w'
      title: Authentication vs Authorization - Explained in 5 minutes
      author: Web Dev Simplified
      durationMinutes: 5
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Direct and concise explanation of core concepts distinguishing
        authentication from authorization, ideal for beginners just starting to
        understand identity management fundamentals.
    long:
      url: 'https://www.youtube.com/watch?v=WPiqNDapQrk'
      title: Master Senior Level Authentication In 4 Hours
      author: Web Dev Simplified
      durationMinutes: 90
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Comprehensive deep-dive covering advanced authentication patterns,
        implementation strategies, and real-world best practices for building
        production authentication systems.
  articles:
    - url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Authentication'
      title: Authentication - Security - MDN Web Docs
      kind: canonical-doc
      reasoning: >-
        Mozilla's canonical guide covering main authentication techniques
        including passwords, OTP, WebAuthn, federated identity, and session
        management with best practices.
    - url: >-
        https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html
      title: OWASP Authentication Cheat Sheet
      kind: canonical-doc
      reasoning: >-
        OWASP's authoritative security reference defining authentication,
        covering common threats, and providing practical guidance for
        implementing secure authentication systems.
    - url: 'https://datatracker.ietf.org/doc/html/rfc6749'
      title: RFC 6749 - The OAuth 2.0 Authorization Framework
      kind: canonical-doc
      reasoning: >-
        Official IETF specification for OAuth 2.0, the industry-standard
        protocol for delegated authentication and authorization widely adopted
        across the web.
  services:
    - name: Auth0
      url: 'https://auth0.com/'
      category: identity-platform
      reasoning: >-
        Production-grade identity platform supporting 30+ SDKs, handling
        billions of login transactions monthly, and offering passwordless
        authentication, adaptive MFA, and enterprise SSO.
    - name: Clerk
      url: 'https://clerk.com/'
      category: identity-platform
      reasoning: >-
        Modern authentication platform with drop-in UI components, built-in
        session management, OAuth support, MFA, and organizations features
        tailored for modern web and mobile apps.
    - name: Okta
      url: 'https://www.okta.com/'
      category: identity-platform
      reasoning: >-
        Enterprise-scale identity provider offering comprehensive authentication
        and authorization for employees, customers, and AI agents with strong
        security and compliance features.
    - name: Firebase Authentication
      url: 'https://firebase.google.com/products/auth'
      category: identity-platform
      reasoning: >-
        Google's authentication service integrating with Firebase ecosystem,
        supporting email, phone, OAuth providers, and multi-factor
        authentication with minimal setup.
    - name: Keycloak
      url: 'https://www.keycloak.org/'
      category: open-source-library
      reasoning: >-
        Open-source Apache 2.0 licensed IAM platform supporting OAuth 2.0,
        OpenID Connect, SAML, user federation, and fine-grained authorization
        with full admin control.
  courses:
    - url: >-
        https://courses.pragmaticwebsecurity.com/courses/introduction-to-oauth-2-0-and-openid-connect
      title: Introduction to OAuth 2.0 and OpenID Connect
      provider: Pragmatic Web Security
      paid: false
      reasoning: >-
        Free foundational course by security researcher Philippe De Ryck
        demystifying OAuth 2.0 and OpenID Connect with clear examples and
        real-world applications.
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
