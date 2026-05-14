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
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Authentication is one of those topics where the gap between "works in
  development" and "correct in production" is enormous. You can build a login
  form that accepts a password and sets a cookie in an afternoon. Building an
  authentication system that doesn't leak sessions, doesn't store credentials
  insecurely, handles token expiry gracefully, and holds up under an adversarial
  internet is a different project entirely. The teams that underestimate this
  gap are the ones who end up in breach disclosure posts.


  The strong recommendation for most applications is to reach for an existing
  identity provider — Auth0, Clerk, Supabase Auth, Firebase Auth — rather than
  building from scratch. Not because it's impossible to build correctly, but
  because the surface area of what "correctly" means is genuinely large: you
  need to hash passwords with bcrypt or Argon2 at appropriate work factors,
  protect against timing attacks on comparison, rotate session tokens on
  privilege escalation, handle account enumeration through consistent error
  messages, implement rate limiting on login endpoints, and that's before you
  get to MFA or OAuth. Each of those is a known pitfall that identity providers
  have already solved. The cost of a third-party provider is worth it unless you
  have a compelling reason to own the stack.


  If you are building authentication yourself, the single most important
  decision is session management. Session-based auth (server stores session
  state, client holds a session cookie) is simpler and easier to invalidate —
  you can log a user out by deleting the server-side session. JWT-based auth is
  stateless and scales horizontally without shared storage, but token
  invalidation before expiry requires a blocklist, which reintroduces
  statefulness. The "stateless JWT" pattern is frequently misunderstood: if you
  issue a JWT with a 24-hour expiry and the user gets compromised, you cannot
  invalidate that token without a revocation list. Short expiry times (15
  minutes) with refresh tokens are the standard mitigation, but it adds
  complexity. Neither approach is universally better; the tradeoff depends on
  your scale and operational requirements.


  OAuth 2.0 and OpenID Connect are worth understanding even if you're not
  building a public API. OIDC is the identity layer on top of OAuth 2.0 — OAuth
  handles authorization ("this app can access your calendar"), OIDC handles
  authentication ("this is who the user is"). The Authorization Code flow with
  PKCE is the correct choice for web and mobile apps. Implicit flow is
  deprecated. If you're implementing "Login with Google" or "Login with GitHub,"
  you're using OIDC. Understanding what tokens are exchanged and what they
  contain helps you debug integration issues and understand what claims you can
  trust.


  Authentication sits at the entry point of the security-and-identity phase, and
  almost everything else depends on it correctly. Access control can't work
  without a verified identity. Session fixation attacks, credential stuffing,
  and phishing are the dominant real-world attack vectors — not cryptographic
  weaknesses. Defense against credential stuffing means rate limiting and
  ideally integrating with a breach credential database (Have I Been Pwned's API
  is free for this purpose). Phishing defense means WebAuthn / passkeys, which
  bind credentials to the origin domain and make them non-phishable by
  construction. Passkeys are increasingly supported and worth implementing as a
  second factor or primary credential for new applications.
pitfalls:
  - title: Rolling your own authentication from scratch
    explanation: >-
      Building login, session management, and token handling in-house introduces
      a large attack surface — password hashing work factors, timing-safe
      comparison, account enumeration, and session fixation are all known
      pitfalls that are easy to get subtly wrong. Established identity providers
      have solved these problems already; the cost of adopting one is nearly
      always less than the cost of a breach.
  - title: Issuing long-lived JWTs with no revocation mechanism
    explanation: >-
      A JWT with a 24-hour expiry cannot be invalidated before it expires
      without maintaining a blocklist, so a compromised token remains valid for
      the full expiry window. Short expiry times paired with refresh tokens, or
      server-side session state, are the standard mitigations for credentials
      that need to be revocable.
  - title: Storing passwords with weak or no hashing
    explanation: >-
      MD5, SHA-1, and even SHA-256 without a salt are all insufficient for
      password storage because they are fast to compute, making brute-force and
      rainbow-table attacks practical at scale. Passwords must be hashed with an
      adaptive, slow algorithm like bcrypt or Argon2 at a work factor tuned to
      take at least 100ms.
  - title: No rate limiting on login and credential endpoints
    explanation: >-
      Without rate limiting, a login endpoint is fully open to credential
      stuffing attacks — automated tools testing millions of username/password
      combinations from breached credential lists. Rate limiting by IP and by
      account, with progressive backoff and CAPTCHA escalation, is the baseline
      defense.
  - title: Leaking user existence through inconsistent error messages
    explanation: >-
      Returning 'user not found' for unknown usernames and 'incorrect password'
      for known ones lets an attacker enumerate valid accounts in your system.
      Login and password-reset endpoints should return the same generic error
      message regardless of whether the account exists.
  - title: Skipping token rotation on privilege escalation
    explanation: >-
      Reusing the same session token before and after a user elevates to admin
      or confirms an action (like changing their email) allows session fixation
      attacks where an attacker who planted a session ID inherits the elevated
      privileges. Always issue a fresh token or session ID when privilege level
      changes.
codeExamples:
  - language: typescript
    title: Short-lived JWT with refresh token rotation
    code: |-
      import jwt from 'jsonwebtoken';
      import { randomBytes } from 'crypto';

      const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
      const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

      function issueAccessToken(userId: string): string {
        return jwt.sign({ sub: userId }, ACCESS_SECRET, { expiresIn: '15m' });
      }

      function issueRefreshToken(): string {
        // Opaque token stored server-side; not a JWT
        return randomBytes(40).toString('hex');
      }

      async function refresh(
        incomingRefreshToken: string,
        db: { getRefreshToken: (t: string) => Promise<{ userId: string; revoked: boolean } | null>;
              revokeRefreshToken: (t: string) => Promise<void>;
              saveRefreshToken: (t: string, userId: string) => Promise<void>; }
      ) {
        const stored = await db.getRefreshToken(incomingRefreshToken);
        if (!stored || stored.revoked) throw new Error('Invalid refresh token');

        // Rotation: revoke old token and issue a new pair
        await db.revokeRefreshToken(incomingRefreshToken);
        const newRefresh = issueRefreshToken();
        await db.saveRefreshToken(newRefresh, stored.userId);

        return {
          accessToken: issueAccessToken(stored.userId),
          refreshToken: newRefresh,
        };
      }
    reasoning: >-
      Short-lived access tokens (15 min) limit the blast radius of a leaked
      token, while opaque refresh tokens with server-side rotation allow
      immediate invalidation — solving the core stateless-JWT revocation
      problem.
  - language: typescript
    title: Constant-time password comparison to avoid timing attacks
    code: >-
      import { hash, verify } from 'argon2';

      import { timingSafeEqual, createHash } from 'crypto';


      async function hashPassword(plaintext: string): Promise<string> {
        return hash(plaintext, { memoryCost: 65536, timeCost: 3, parallelism: 1 });
      }


      async function verifyPassword(stored: string, candidate: string):
      Promise<boolean> {
        // argon2.verify already uses constant-time comparison internally
        return verify(stored, candidate);
      }


      // For API key comparison (not argon2), use timingSafeEqual directly:

      function safeCompareApiKey(storedKey: string, candidateKey: string):
      boolean {
        // Normalize lengths first to avoid early exit on length mismatch
        const a = createHash('sha256').update(storedKey).digest();
        const b = createHash('sha256').update(candidateKey).digest();
        return timingSafeEqual(a, b);
      }
    reasoning: >-
      Using Argon2 for passwords (vs. bcrypt/md5) and timingSafeEqual for token
      comparison eliminates the two most common cryptographic implementation
      mistakes — weak hashing and timing side-channels.
difficulty: intermediate
estimatedHours: 6
tldr: >-
  Verify users are really who they claim to be. Do this right and your login is
  secure; do it wrong and sessions get stolen.
shortExplainerVideo:
  url: 'https://www.youtube.com/watch?v=UBUNrFtufWo'
  title: Session vs Token Authentication in 100 Seconds
  author: Fireship
  durationSeconds: 138
  reasoning: >-
    Fireship covers the two dominant authentication patterns — session cookies
    vs stateless tokens (JWT) — in exactly 138 seconds. Directly hits the
    topic's core concepts: how sessions and tokens work, when to use each, and
    the tradeoffs. Fireship is a top-tier authoritative source for concise
    developer explainers.
  source: ai-researcher
lastUpdatedAt: '2026-05-14T12:33:14.490Z'
---
<!-- user notes -->
