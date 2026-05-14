---
slug: test-coverage
title: Test Coverage
phase: delivery-and-operations
order: 5
summary: >-
  Build a layered test suite of unit, integration, and end-to-end tests that
  catches regressions before they reach production.
definition: >-
  Test coverage is a layered quality assurance strategy that organizes automated
  testing into complementary levels to catch regressions early and with
  confidence. The test pyramid principle (most unit tests, fewer integration
  tests, minimal end-to-end tests) balances execution speed with realistic
  confidence. Modern testing emphasizes writing tests that resemble actual user
  interactions and business flows rather than testing implementation details—the
  philosophy being that tests should verify observable behavior and outcomes.


  Building effective test coverage requires strategic test selection across
  three layers: unit tests for isolated components and logic, integration tests
  that verify collaboration between components without mocking critical
  dependencies, and targeted end-to-end tests for critical user journeys. Tools
  like Jest, Vitest, Playwright, and Cypress provide the infrastructure; Testing
  Library enforces user-centric testing practices. The goal is not 100% coverage
  but meaningful coverage (typically 70%+) that gives developers confidence to
  refactor, deploy, and maintain code without fear of introducing regressions.


  Implementing this strategy involves understanding when to write each test
  type, using appropriate tools and patterns for your tech stack, and treating
  test code with the same quality standards as production code. Avoid test
  duplication by pushing assertions as far down the pyramid as feasible,
  maintain fast feedback loops by organizing test pipelines for speed, and
  embrace contract testing for service boundaries. This layered approach creates
  a sustainable testing culture that catches bugs before users see them while
  keeping maintenance costs reasonable.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - title: The Test Pyramid
      url: 'https://martinfowler.com/bliki/TestPyramid.html'
      kind: canonical-doc
      reasoning: ''
    - title: Practical Test Pyramid
      url: 'https://martinfowler.com/articles/practical-test-pyramid.html'
      kind: canonical-doc
      reasoning: ''
    - title: Write Tests. Not Too Many. Mostly Integration.
      url: 'https://kentcdodds.com/blog/write-tests'
      kind: engineering-blog
      reasoning: ''
  services:
    - url: 'https://jestjs.io'
      name: 'https://jestjs.io'
      category: platform
      reasoning: ''
    - url: 'https://vitest.dev'
      name: 'https://vitest.dev'
      category: platform
      reasoning: ''
    - url: 'https://testing-library.com'
      name: 'https://testing-library.com'
      category: platform
      reasoning: ''
    - url: 'https://playwright.dev'
      name: 'https://playwright.dev'
      category: platform
      reasoning: ''
    - url: 'https://www.cypress.io'
      name: 'https://www.cypress.io'
      category: platform
      reasoning: ''
  courses: []
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  The codebase without tests isn't a timebomb — it's a timebomb that went off a
  while ago and you just haven't found all the damage yet. Every change is a
  coin flip: it might work, it might break something three levels removed from
  what you touched, and you won't know until a user emails you. Teams in this
  situation slow down not because the work is harder, but because the mental
  overhead of "what might I be breaking?" is exhausting and every deploy carries
  genuine anxiety. Test coverage is fundamentally about confidence: the
  confidence to refactor without fear, to ship on Friday afternoon, to hand a
  codebase to a new engineer and have them productive without a two-week oral
  history from the person who wrote it.


  The 80/20 in testing is: write integration tests for your critical paths and
  skip the unit test ceremony for code that's mostly glue. This contradicts the
  traditional test pyramid advice, but it's where experienced engineers usually
  land in practice. A unit test that mocks the database and the HTTP client and
  the email service is testing almost nothing real — it's just testing that your
  mock returns what you told it to return. An integration test that hits a real
  database (a test database, seeded with fixtures) and exercises the actual code
  path that processes a payment, sends a webhook, and updates a subscription
  state gives you something genuinely valuable. Add end-to-end tests with
  Playwright for the three or four user flows that, if broken, would cause
  customers to churn or lose money. Everything else can be added incrementally.


  The failure modes in testing are as predictable as they are frustrating. The
  most common: tests that pass locally but fail in CI because of timezone
  differences, database state from a previous test leaking, or a missing
  environment variable. Flaky tests are worse than no tests in one specific way
  — they train engineers to re-run the suite until it goes green rather than
  investigating failures, which means real failures get dismissed as flakiness.
  Second failure mode: tests coupled to implementation details rather than
  behavior. When you refactor a class and 40 tests break because they were
  testing the internal methods you renamed rather than the outcomes those
  methods produce, the tests are a liability. Write tests from the outside —
  what does this code do, not how does it do it. Third: the test suite that
  takes 20 minutes to run. Nobody runs tests that take 20 minutes. Invest early
  in parallelization and in keeping the feedback loop under two minutes.


  The mental model that makes testing decisions easier is to think about who
  catches the bug if the test doesn't. If a unit test for your date-formatting
  utility doesn't exist, probably a code reviewer catches it, or you catch it
  locally. If an integration test for your checkout flow doesn't exist, a
  customer catches it — and they might not tell you, they might just leave. That
  asymmetry should guide where you invest. The cost of a test failure is
  proportional to how deep into production the bug travels before it's caught.
  Tests at the unit level catch bugs cheaply. Tests at the integration level
  catch bugs that unit tests miss but before users see them. End-to-end tests
  catch the subset of integration failures that only manifest in a real browser
  against a real stack. Each layer has a job.


  Test coverage sits in the delivery and operations phase because its primary
  value is in enabling safe, fast delivery. A good test suite is what allows you
  to deploy multiple times a day with confidence, to run automated checks in
  your CI pipeline before code reaches production, and to onboard engineers
  quickly because the tests serve as executable documentation of how the system
  is supposed to behave. It connects directly to your CI/CD pipeline — tests
  should run on every pull request and block merges when they fail. The coverage
  metric (the percentage of lines executed during test runs) is a useful proxy
  but not the goal; the goal is the business logic and user-facing behavior
  being verified. A line that's covered by a test that can't actually fail has
  zero value.
pitfalls:
  - title: Unit tests that mock every dependency
    explanation: >-
      A test that mocks the database, the HTTP client, and the email adapter is
      testing that your mocks return what you told them to return — not that the
      code works. Prefer integration tests that hit a real test database and
      exercise the actual code path; reserve mocks for genuinely expensive or
      non-deterministic external services.
  - title: Flaky tests trained engineers to ignore failures
    explanation: >-
      Once the team learns to re-run the suite until it goes green, every real
      failure is assumed to be flakiness and gets dismissed. Flaky tests are
      more dangerous than no tests on that path because they actively suppress
      the signal you built the suite to produce. Quarantine and fix flaky tests
      immediately rather than tolerating them.
  - title: Test suite that takes too long to run
    explanation: >-
      A 20-minute CI run means developers stop running tests locally and stop
      investigating failures in review, so the suite stops catching bugs before
      merge. Keep the full suite under five minutes through parallelization and
      ruthless pruning of slow tests; a fast suite that developers actually run
      beats a thorough suite they skip.
  - title: Tests coupled to implementation rather than behavior
    explanation: >-
      Tests that assert on internal method names, private state, or specific
      call sequences break on every refactor, making the test suite an obstacle
      to improvement rather than a safety net. Test what the code does from the
      outside — inputs and observable outputs — so that valid refactors don't
      break valid tests.
  - title: Chasing coverage percentage on low-risk glue code
    explanation: >-
      A 90% line coverage number looks good but reveals nothing about whether
      the checkout flow, the billing webhook handler, or the account recovery
      path actually works. Prioritize test investment on code whose failure
      costs real money or customer trust, not on configuration wrappers and thin
      adapters.
  - title: No tests for the paths that fail most expensively
    explanation: >-
      Teams typically test the happy path and skip error handling: what happens
      when a payment webhook arrives twice, when a third-party API returns a
      429, or when a file upload times out halfway through. These are exactly
      the paths that cause production incidents, and they are almost always
      undertested because they require deliberate effort to simulate.
codeExamples:
  - language: typescript
    title: Integration Test For Checkout Flow
    code: >-
      // Hits a real test database — no mocks for the code paths that matter

      import { describe, it, expect, beforeEach, afterEach } from 'vitest';

      import { createTestDb, cleanTestDb } from './helpers/db';

      import { processCheckout } from '../src/checkout';

      import type { Cart, User } from '../src/types';


      describe('processCheckout', () => {
        let db: Awaited<ReturnType<typeof createTestDb>>;

        beforeEach(async () => {
          db = await createTestDb();
        });

        afterEach(async () => {
          await cleanTestDb(db);
        });

        it('creates an order and deducts inventory on success', async () => {
          const user: User = await db.users.create({ email: 'buyer@example.com' });
          const product = await db.products.create({ sku: 'WIDGET-1', stock: 10, priceCents: 999 });
          const cart: Cart = { items: [{ productId: product.id, qty: 2 }] };

          const result = await processCheckout({ userId: user.id, cart, db });

          expect(result.status).toBe('confirmed');
          expect(result.order.totalCents).toBe(1998);

          const updated = await db.products.findById(product.id);
          expect(updated.stock).toBe(8); // inventory actually deducted
        });

        it('returns insufficient_stock when inventory is too low', async () => {
          const user: User = await db.users.create({ email: 'buyer2@example.com' });
          const product = await db.products.create({ sku: 'WIDGET-2', stock: 1, priceCents: 999 });
          const cart: Cart = { items: [{ productId: product.id, qty: 5 }] };

          const result = await processCheckout({ userId: user.id, cart, db });

          expect(result.status).toBe('insufficient_stock');
          const unchanged = await db.products.findById(product.id);
          expect(unchanged.stock).toBe(1); // rollback confirmed
        });
      });


      declare function processCheckout(opts: { userId: string; cart: Cart; db:
      unknown }): Promise<{ status: string; order?: { totalCents: number } }>;
    reasoning: >-
      Testing behavior against a real database (not mocks) catches the class of
      bugs that most unit tests miss — transaction rollbacks, constraint
      failures, and inventory race conditions.
difficulty: intermediate
estimatedHours: 5
tldr: >-
  Test code at layers: small unit tests, real integration tests, then critical
  user workflows end-to-end. Catches bugs before customers do.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:11:25.864Z'
---
<!-- user notes -->
