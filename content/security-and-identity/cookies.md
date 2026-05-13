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
    long: null
  articles:
    - url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies'
      title: Using HTTP cookies — MDN
      kind: canonical-doc
      reasoning: >-
        MDN's authoritative reference on cookie syntax, security attributes, and
        best practices.
    - url: >-
        https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
      title: OWASP Session Management Cheat Sheet
      kind: canonical-doc
      reasoning: >-
        Hardened cookie configuration patterns and threat models for CSRF/XSS
        prevention.
  services:
    - name: OneTrust
      url: 'https://www.onetrust.com'
      category: consent-management-platform
      reasoning: >-
        Enterprise CMP covering privacy, risk, data, and compliance across 300+
        jurisdictions.
    - name: Cookiebot
      url: 'https://www.cookiebot.com'
      category: consent-management-platform
      reasoning: >-
        Lightweight automated CMP with high scanning accuracy and Google Consent
        Mode V2 support.
    - name: Osano
      url: 'https://www.osano.com'
      category: consent-management-platform
      reasoning: All-in-one privacy ops platform with jurisdiction-aware consent banners.
    - name: iubenda
      url: 'https://www.iubenda.com'
      category: consent-management-platform
      reasoning: Google-certified CMP with auto-updating legal docs across 27 languages.
  courses:
    - url: 'https://www.udemy.com/course/cookie-compliance-for-websites-and-apps/'
      title: Cookie Compliance for Websites and Apps
      provider: Udemy
      paid: true
      reasoning: >-
        Course covering GDPR cookie exemptions, policy templates, and CMP tool
        selection.
provenance:
  researchedAt: '2026-05-13T22:22:34.988Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
---
<!-- user notes -->
