---
slug: environments
title: Environments
phase: delivery-and-operations
order: 2
summary: >-
  Maintain distinct development, staging, and production environments with
  environment-specific configuration and data isolation.
definition: >-
  Maintaining distinct development, staging, and production environments is
  essential for safe, reliable software delivery. These isolated environments
  allow teams to test changes thoroughly before releasing to production,
  catching bugs and regressions early without impacting end users.
  Environment-specific configuration manages differences in infrastructure,
  database connections, API credentials, and feature flags across each stage,
  while data isolation ensures that staging and development can safely process
  test data without affecting production data or user information.


  Modern environment management combines multiple strategies: containerization
  (Docker) standardizes runtime environments across machines, orchestration
  platforms (Kubernetes) manage secrets and ConfigMaps for environment-specific
  values, infrastructure-as-code tools (Terraform, CloudFormation) ensure
  consistency, and specialized services (Doppler, Vercel) simplify secrets
  rotation and access control. The 12-factor app methodology emphasizes storing
  configuration in environment variables separate from code, enabling the same
  build to run unchanged across environments. Effective staging environments
  mirror production as closely as possible—using realistic data volumes, similar
  infrastructure patterns, and production-grade monitoring—to catch deployment
  issues before they affect users.


  Preview/ephemeral environments extend this pattern for feature validation:
  dynamically provisioned staging instances tied to pull requests allow
  developers and stakeholders to test changes in isolation before merging. This
  shift-left approach to environment management reduces both the cost of fixing
  bugs late and the blast radius of production incidents, while enabling faster
  feedback loops and more confident releases.
needsManualPick: false
resources:
  videos:
    short: null
    long: null
  articles:
    - url: 'https://12factor.net/config'
      title: 'The Twelve-Factor App: Config'
      kind: canonical-doc
      reasoning: >-
        Defines the fundamental pattern of storing all environment-specific
        configuration in environment variables, separated from code—the
        foundation of modern environment management.
    - url: >-
        https://aws.amazon.com/builders-library/automating-safe-hands-off-deployments/
      title: 'Automating Safe, Hands-Off Deployments'
      kind: tutorial
      reasoning: >-
        AWS Builders' Library article on staging environment strategies and safe
        deployment patterns including canary deployments and progressive traffic
        shifting across environments.
    - url: 'https://www.honeycomb.io/blog/the-open-source-observability-project/'
      title: Preview Environments and Observability
      kind: engineering-blog
      reasoning: >-
        Honeycomb's perspective on using preview/ephemeral environments for
        feature validation and the role of observability in testing across
        different environment stages.
  services:
    - name: Doppler
      url: 'https://www.doppler.com'
      category: secrets-management
      reasoning: >-
        Centralized secrets and environment variable management across dev,
        staging, and production with audit trails, access control, and automatic
        rotation.
    - name: Vercel
      url: 'https://vercel.com'
      category: environment-management
      reasoning: >-
        Provides environment variable management, preview deployments for every
        PR, and staging/production environment separation with integrated GitOps
        workflows.
    - name: Fly.io
      url: 'https://fly.io'
      category: deployment-platform
      reasoning: >-
        Container deployment platform with built-in support for multiple
        environments, encrypted secrets management, and automatic
        staging/production infrastructure provisioning.
    - name: Docker
      url: 'https://www.docker.com'
      category: containerization
      reasoning: >-
        Containerization ensures consistent environments across development,
        staging, and production by packaging applications with all dependencies
        in identical runtime images.
    - name: Kubernetes
      url: 'https://kubernetes.io'
      category: orchestration
      reasoning: >-
        Orchestration platform with native support for environment-specific
        configuration through ConfigMaps for non-sensitive config and Secrets
        for sensitive data across multiple namespaces.
  courses: []
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  The importance of environment isolation only becomes obvious after you've
  violated it. The first time a developer runs a database migration against
  production because the staging connection string wasn't configured, or the
  first time a bug gets reported that only exists in production because staging
  was running a two-week-old version of the application, the value of proper
  environment separation clicks immediately. Until then, it can feel like
  overhead — more infrastructure to maintain, more configuration to manage, more
  pipelines to keep green. The tax is real; so is the return.


  The conceptual core here is that every environment exists to answer a
  different question. Development asks: does this work at all? Staging asks:
  does this work the way production works? Production is the question you're
  trying not to ask at all. When these environments blur — when staging shares a
  database with production, when developers test directly in prod, when the
  staging environment hasn't been deployed to in three weeks — you lose the
  ability to get reliable answers. A staging environment that doesn't mirror
  production topology, data volumes, and configuration isn't staging; it's a
  theater set that looks like production from a distance but collapses when you
  actually walk into it.


  The 80/20 for environment management: the single most important thing is that
  staging runs the same deployment process as production, including the same
  CI/CD pipeline, the same infrastructure provisioning, and the same secrets
  management. If you deploy to production via a Helm chart upgrade and to
  staging via `kubectl apply -f` from a developer's laptop, you're not testing
  your deployment process — you're testing a different deployment process that
  happens to produce a similar result most of the time. Environment-specific
  configuration should live in environment variables, not in code branches or
  hardcoded constants; the twelve-factor methodology gets this right. Data
  isolation matters enormously — staging should never write to production
  databases, storage buckets, or external APIs (use stub credentials or test
  modes for third-party services).


  The dominant failure modes fall into two categories: false confidence and
  environment drift. False confidence is when staging passes and production
  fails because the environments are materially different in a way that matters
  — a different Postgres version, missing environment variables, different
  service sizing that reveals a memory issue only under production load.
  Environment drift is when staging and production start identical and gradually
  diverge as teams apply hotfixes directly to production, configure things
  manually, or forget to replicate infrastructure changes. Both problems have
  the same root cause: environments that aren't managed as code, with changes
  tracked and applied consistently across the board.


  Preview environments — ephemeral instances tied to individual pull requests —
  deserve attention because they've become genuinely transformative for teams
  that invest in them. Instead of a single shared staging environment that's
  usually occupied by someone else's in-progress changes, each feature branch
  gets its own isolated environment spun up automatically and torn down on
  merge. This eliminates the "staging is broken, can't test" problem that
  plagues teams with a single shared staging tier. The infrastructure cost is
  real but often lower than it looks; most preview environments are idle 90% of
  the time and can be sized aggressively small.


  The right mental model for environments is a progressive filter, not a safety
  net. Each environment is designed to catch a specific class of problem before
  it reaches the next environment. Development catches logic errors. Staging
  catches integration and deployment errors. Canary or production blue-green
  catches scale and configuration errors that only appear under real load. If a
  bug makes it through all the filters and reaches production, the question to
  ask isn't just "how do we fix this bug" but "which filter failed, and why."
  That framing turns environment failures into process improvements rather than
  just incidents to resolve.
pitfalls:
  - title: Staging and Production Using Different Deployment Processes
    explanation: >-
      Deploying to production via a Helm chart and to staging via kubectl apply
      from a developer's laptop means you are not actually testing your
      deployment process in staging — you are testing a different process that
      produces a similar result most of the time. The gap reveals itself on the
      deploy that matters. Staging must run the exact same CI/CD pipeline, the
      same infrastructure provisioning steps, and the same secrets management as
      production.
  - title: Staging Environment Drifts From Production Over Time
    explanation: >-
      Environments that start identical diverge when hotfixes are applied
      directly to production, infrastructure is configured manually, or teams
      forget to replicate changes across environments. Drift is invisible until
      it hides a bug that staging would have caught. Manage all environment
      differences as code, apply changes via the same pipeline, and regularly
      diff environment configurations to detect drift before it causes a
      production-only failure.
  - title: Staging Writing to Production Data Stores or External APIs
    explanation: >-
      Staging that shares a database with production or uses live third-party
      API credentials can corrupt production data or trigger real-world side
      effects — sending customer emails, charging payment methods, or modifying
      live inventory. Isolate every external integration in staging: use
      test-mode credentials for payment processors, point to a separate
      analytics dataset, and never allow staging configuration to reference
      production connection strings.
  - title: >-
      False Confidence From a Staging Environment That Does Not Match Production
      Load
    explanation: >-
      A staging environment sized at 10% of production will not surface memory
      leaks, connection pool exhaustion, or contention that only appear under
      real traffic. A bug that requires production load to manifest will pass
      staging and fail in production on every deploy. Either run load tests
      against staging at production-equivalent scale or run canary deploys in
      production with limited blast radius — but do not conflate 'passed
      staging' with 'safe to deploy'.
  - title: Hardcoding Environment-Specific Values in Application Code
    explanation: >-
      Connection strings, API endpoints, and credentials baked into code
      branches or hardcoded constants mean the same build cannot run unchanged
      across environments, forcing environment-specific builds and hiding
      configuration mistakes until runtime. Store all environment-specific
      configuration in environment variables, injected at runtime. The same
      container image should run in development, staging, and production with
      behavior controlled entirely by its environment.
codeExamples:
  - language: typescript
    title: Environment Config with Validation at Startup
    code: >-
      // config.ts — fail fast if env is misconfigured

      function requireEnv(name: string): string {
        const value = process.env[name];
        if (!value) throw new Error(`Missing required environment variable: ${name}`);
        return value;
      }


      function optionalEnv(name: string, fallback: string): string {
        return process.env[name] ?? fallback;
      }


      const ENV = requireEnv('APP_ENV'); // 'development' | 'staging' |
      'production'


      if (!['development', 'staging', 'production'].includes(ENV)) {
        throw new Error(`APP_ENV must be development|staging|production, got: ${ENV}`);
      }


      export const config = {
        env: ENV as 'development' | 'staging' | 'production',
        isProduction: ENV === 'production',
        databaseUrl: requireEnv('DATABASE_URL'),
        stripeSecretKey: requireEnv('STRIPE_SECRET_KEY'),
        logLevel: optionalEnv('LOG_LEVEL', ENV === 'production' ? 'warn' : 'debug'),
        stripeWebhookSecret: requireEnv('STRIPE_WEBHOOK_SECRET'),
        port: parseInt(optionalEnv('PORT', '3000'), 10),
      } as const;


      // Usage: import { config } from './config';

      // config.databaseUrl — always a string, never undefined
    reasoning: >-
      Validating all required environment variables at startup — rather than
      lazily at first use — turns silent misconfigurations into immediate,
      readable errors that catch environment drift before it causes mysterious
      production failures.
  - language: yaml
    title: GitHub Actions Preview Environment on Pull Request
    code: |-
      # .github/workflows/preview.yml
      name: Preview Environment

      on:
        pull_request:
          types: [opened, synchronize, reopened, closed]

      jobs:
        deploy-preview:
          if: github.event.action != 'closed'
          runs-on: ubuntu-latest
          environment: preview
          steps:
            - uses: actions/checkout@v4

            - name: Deploy preview
              id: deploy
              env:
                APP_ENV: staging
                DATABASE_URL: ${{ secrets.PREVIEW_DATABASE_URL }}
                STRIPE_SECRET_KEY: ${{ secrets.STRIPE_TEST_KEY }}
                STRIPE_WEBHOOK_SECRET: ${{ secrets.STRIPE_TEST_WEBHOOK_SECRET }}
              run: |
                IMAGE_TAG="pr-${{ github.event.pull_request.number }}"
                docker build -t myapp:$IMAGE_TAG .
                # Deploy to ephemeral namespace, e.g. with Helm:
                helm upgrade --install "preview-${IMAGE_TAG}" ./chart \
                  --namespace "preview-${IMAGE_TAG}" \
                  --create-namespace \
                  --set image.tag="${IMAGE_TAG}" \
                  --set env.APP_ENV=staging
                echo "url=https://pr-${{ github.event.pull_request.number }}.preview.example.com" >> $GITHUB_OUTPUT

            - name: Comment preview URL on PR
              uses: actions/github-script@v7
              with:
                script: |
                  github.rest.issues.createComment({
                    issue_number: context.issue.number,
                    owner: context.repo.owner,
                    repo: context.repo.repo,
                    body: `Preview deployed: ${{ steps.deploy.outputs.url }}`
                  });

        teardown-preview:
          if: github.event.action == 'closed'
          runs-on: ubuntu-latest
          steps:
            - name: Destroy preview namespace
              run: |
                helm uninstall "preview-pr-${{ github.event.pull_request.number }}" \
                  --namespace "preview-pr-${{ github.event.pull_request.number }}"
                kubectl delete namespace "preview-pr-${{ github.event.pull_request.number }}"
    reasoning: >-
      Ephemeral preview environments per pull request eliminate the 'staging is
      occupied' problem and ensure each feature is validated against a real
      deployment before merging, not against a shared environment carrying
      another team's in-progress changes.
difficulty: intermediate
estimatedHours: 4
tldr: >-
  Use separate development, test, and production systems with isolated data so
  bugs get caught before reaching real users and staging actually resembles
  production.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:27:20.527Z'
---
<!-- user notes -->
