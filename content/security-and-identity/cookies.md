---
slug: cookies
title: Cookies & Consent
phase: security-and-identity
order: 5
summary: >-
  Manage first- and third-party cookies correctly for security (SameSite,
  HttpOnly, Secure) and obtain lawful consent for tracking under privacy
  regulations.
definition: >-
  Cookies are small text files stored on a user's browser that enable stateful
  HTTP communication, session management, and personalization. Secure cookie
  implementation requires proper attribute configuration — Secure, HttpOnly,
  SameSite, Domain, Path prefixes — to prevent XSS, CSRF, and MITM attacks.


  Privacy regulations (GDPR, CCPA, CPRA, LGPD) mandate explicit informed consent
  for non-essential tracking cookies and transparent disclosure of data
  practices. Compliance requires both technical security measures and legal
  consent mechanisms working in tandem: misconfiguration exposes sessions to
  theft and replay, while consent violations trigger regulatory fines reaching
  hundreds of millions of euros.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=3asMiTut9x4'
      title: 'PHP Cookie Security: Secure, HttpOnly & SameSite Explained'
      author: Program With Gio
      durationMinutes: 12
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Practical tutorial covering the three critical security attributes with
        examples.
      source: ai-researcher
    long: null
  articles:
    - url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies'
      title: Using HTTP cookies — MDN
      kind: canonical-doc
      reasoning: >-
        MDN's authoritative reference on cookie syntax, security attributes, and
        best practices.
      publisher: MDN / Mozilla
      source: ai-researcher
    - url: >-
        https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
      title: OWASP Session Management Cheat Sheet
      kind: canonical-doc
      reasoning: >-
        Hardened cookie configuration patterns and threat models for CSRF/XSS
        prevention.
      publisher: OWASP
      source: ai-researcher
  services:
    - name: OneTrust
      url: 'https://www.onetrust.com'
      category: consent-management-platform
      reasoning: >-
        Enterprise CMP covering privacy, risk, data, and compliance across 300+
        jurisdictions.
      source: ai-researcher
    - name: Cookiebot
      url: 'https://www.cookiebot.com'
      category: consent-management-platform
      reasoning: >-
        Lightweight automated CMP with high scanning accuracy and Google Consent
        Mode V2 support.
      vendor: Cookiebot (Usercentrics)
      source: ai-researcher
    - name: Osano
      url: 'https://www.osano.com'
      category: consent-management-platform
      reasoning: All-in-one privacy ops platform with jurisdiction-aware consent banners.
      source: ai-researcher
    - name: iubenda
      url: 'https://www.iubenda.com'
      category: consent-management-platform
      reasoning: Google-certified CMP with auto-updating legal docs across 27 languages.
      source: ai-researcher
  courses:
    - url: 'https://www.udemy.com/course/cookie-compliance-for-websites-and-apps/'
      title: Cookie Compliance for Websites and Apps
      provider: Udemy
      paid: true
      reasoning: >-
        Course covering GDPR cookie exemptions, policy templates, and CMP tool
        selection.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-13T22:45:46.767Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  Cookies are one of those topics where the gap between "it works" and "it works
  correctly" is wide enough to park a GDPR fine in. A session cookie that is
  missing HttpOnly is readable by any JavaScript on your page, which means an
  XSS vulnerability anywhere in your application can steal every active session.
  A cookie without SameSite can be sent cross-site in certain request flows,
  enabling CSRF attacks that execute actions on behalf of authenticated users.
  These are not theoretical concerns — they are the mechanical consequences of
  omitting attributes that browsers started making available over a decade ago.
  The configuration is one line. The omission can empty someone's bank account.


  The security side of cookies is mostly about getting the attributes right and
  understanding what each one actually does. Secure ensures the cookie is only
  sent over HTTPS — without it, the cookie travels in plaintext over any
  unencrypted connection. HttpOnly prevents JavaScript access, which stops XSS
  from harvesting session tokens. SameSite controls whether the browser sends
  the cookie on cross-origin requests; Strict is the safest but breaks some
  OAuth flows, Lax is a sensible default for most applications, and None
  requires Secure and is intended for explicitly cross-site use cases like
  embedded iframes. The Domain and Path attributes scope where the cookie is
  sent. __Host- and __Secure- prefixes enforce that browsers reject the cookie
  if the constraints are not met — a useful defense against subdomain takeover
  attacks.


  The consent layer is a separate and increasingly consequential problem. GDPR
  requires that non-essential cookies — analytics, advertising, A/B testing —
  only fire after the user has given informed, uncoerced consent. The regulation
  is specific: pre-ticked boxes do not count, "by using this site you consent"
  banners do not count, and consent cannot be bundled with terms of service. The
  practical failure mode is a site that loads Google Analytics, Facebook Pixel,
  and a session replay tool before the consent modal even renders. The cookies
  are already set. The data is already in third-party systems. The legal
  exposure is real. Regulators in the EU have issued significant fines for
  exactly this pattern.


  The 80/20 for most applications: get the session cookie attributes right
  (HttpOnly, Secure, SameSite=Lax as a baseline), then implement a consent
  management platform that actually blocks non-essential scripts until consent
  is granted — not one that just displays a banner. The distinction between a
  consent banner and a consent mechanism is the most common mistake teams make.
  A banner that says "we use cookies" while analytics fires in the background is
  a liability, not compliance. The technical implementation of a real consent
  gate means loading third-party scripts conditionally, after the user's choice
  is recorded, and respecting that choice on return visits.


  Cookies sit at the intersection of authentication, security, and privacy law —
  which is an unusual combination. Most security topics pair with authentication
  and session management; most privacy topics pair with data retention and GDPR
  compliance more broadly. Understanding cookies well means understanding both:
  what the browser will and will not send, and what the law requires you to ask
  before setting certain cookies in the first place. The two halves are not
  optional — skipping either one creates either a security vulnerability or a
  legal exposure.
pitfalls:
  - title: Omitting HttpOnly on session cookies
    explanation: >-
      A session cookie without HttpOnly is readable by any JavaScript executing
      on your page. A single XSS vulnerability anywhere in the application —
      including third-party scripts — can harvest every active session token.
      The fix is a one-word attribute; the cost of omitting it is account
      takeover at scale.
  - title: Confusing a consent banner with a consent mechanism
    explanation: >-
      A banner that says 'we use cookies' while analytics and tracking scripts
      load in the background before the user responds is not compliant — it is a
      liability. Real consent means non-essential scripts are blocked until
      explicit, informed consent is granted, and that choice is respected on
      every subsequent visit.
  - title: Shipping cookies without the Secure flag on HTTPS sites
    explanation: >-
      Without the Secure flag, a cookie is transmitted in plaintext on any
      unencrypted connection a user might encounter. This is especially
      dangerous on public Wi-Fi and exposes session tokens to passive network
      interception, even if your own servers only accept HTTPS.
  - title: Setting SameSite=None without understanding the implications
    explanation: >-
      SameSite=None allows the cookie to be sent on all cross-origin requests,
      which is intentional for embedded iframes and third-party use cases but
      re-opens CSRF attack surfaces that SameSite was introduced to close. It
      also requires the Secure flag; omitting either attribute causes modern
      browsers to reject or alter the cookie behavior in ways that are hard to
      debug.
  - title: Loading third-party tracking scripts unconditionally
    explanation: >-
      Analytics tags, session replay tools, and advertising pixels loaded
      unconditionally on page load fire before any consent is given and send
      data to third-party systems without a lawful basis under GDPR. Regulators
      have issued substantial fines specifically for this pattern, which is
      common because it's the default integration path for most marketing tools.
codeExamples:
  - language: typescript
    title: (pending)
    code: // pending code example with at least 20 chars of real code
    reasoning: pending
difficulty: intermediate
estimatedHours: 4
---
<!-- user notes -->
