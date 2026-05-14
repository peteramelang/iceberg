---
slug: secrets-management
title: Secrets Management
phase: security-and-identity
order: 3
summary: >-
  Store, rotate, and audit API keys and credentials using dedicated vaults
  rather than hardcoding them in source or environment files.
definition: >-
  Secrets management is the practice of securely storing, controlling access to,
  and managing digital credentials throughout their lifecycle using dedicated
  vaults rather than hardcoding them in source code or environment files. This
  includes API keys, passwords, database credentials, OAuth tokens, and
  certificates. Effective secrets management enforces centralized storage,
  automated rotation, dynamic credential generation with short-lived expiration,
  role-based access control following the principle of least privilege, and
  strict audit logging.


  By implementing secrets management best practices with encryption, access
  policies, and automation, organizations significantly reduce breach costs and
  security risks in CI/CD pipelines and production infrastructure. The shift
  from static, long-lived credentials embedded in code to dynamic, short-lived
  secrets issued just-in-time is foundational to modern DevSecOps and zero-trust
  architectures.
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=Kf_sKXuv-RY'
      title: Infisical Secrets Management for Beginners
      author: Infisical
      durationMinutes: 10
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: Beginner-friendly demonstration of a modern open-source secrets manager.
    long:
      url: 'https://www.youtube.com/watch?v=ae72pKpXe-s'
      title: HashiCorp Vault Tutorial for Beginners — Full Course
      author: TechWorld with Nana
      durationMinutes: 60
      addedAt: '2026-05-14T00:00:00Z'
      reasoning: >-
        Comprehensive 1-hour course on Vault, the industry-standard secrets
        manager.
  articles:
    - url: >-
        https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html
      title: OWASP Secrets Management Cheat Sheet
      kind: canonical-doc
      reasoning: >-
        Authoritative OWASP reference for secrets management concepts and best
        practices.
    - url: >-
        https://microsoft.github.io/code-with-engineering-playbook/CI-CD/dev-sec-ops/secrets-management/
      title: Secrets Management — Engineering Fundamentals Playbook
      kind: engineering-blog
      reasoning: Microsoft's official playbook covering tools and CI/CD integration.
  services:
    - name: HashiCorp Vault
      url: 'https://www.vaultproject.io'
      category: secrets-manager
      reasoning: >-
        Industry-leading open-source secrets management with multi-cloud support
        and dynamic secrets.
    - name: AWS Secrets Manager
      url: 'https://aws.amazon.com/secrets-manager/'
      category: managed-secrets
      reasoning: >-
        Managed AWS service with tight ecosystem integration and automatic
        rotation.
    - name: Doppler
      url: 'https://www.doppler.com'
      category: secrets-manager
      reasoning: >-
        Developer-first SaaS secrets management with automatic syncing across
        environments.
    - name: Infisical
      url: 'https://infisical.com'
      category: secrets-manager
      reasoning: >-
        Open-source platform with self-hosted and cloud options for
        machine-to-machine secrets.
    - name: 1Password Secrets Automation
      url: 'https://1password.com/products/secrets'
      category: secrets-manager
      reasoning: Enterprise-grade automation built on 1Password's security foundation.
  courses:
    - url: >-
        https://www.coursera.org/learn/packt-hashicorp-vault-foundations-and-secrets-management-hbxj3
      title: HashiCorp Vault Foundations and Secrets Management
      provider: Coursera
      paid: true
      reasoning: Structured course on Vault foundations with hands-on labs.
provenance:
  researchedAt: '2026-05-13T23:57:18.043Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: true
narrative: >-
  The credential that killed the company almost always had two properties: it
  was long-lived, and it was sitting somewhere convenient. A `.env` file
  committed to a public repo three years ago and forgotten. An AWS access key
  hardcoded in a Lambda function that a departing engineer never rotated. A
  Postgres password baked into a Docker Compose file that made it to production
  because it "worked locally." The damage from these mistakes isn't hypothetical
  — it's a script running in the background, quietly exfiltrating data or
  spinning up crypto miners on your bill. Secrets management exists because the
  attack surface of a credential is exactly as wide as the number of places it's
  stored and the length of time it remains valid.


  The 80/20 here is straightforward: get your secrets out of code and off disk,
  and make sure you know when they were last rotated. A vault like HashiCorp
  Vault, AWS Secrets Manager, or GCP Secret Manager gives you a single source of
  truth with access logging. That's the first order of business. Everything else
  — dynamic credentials, fine-grained RBAC policies, automated rotation
  workflows, certificate management — matters, but it matters less than the
  baseline. A team that has centralized secrets storage and a rotation schedule
  is dramatically safer than one still pulling credentials from environment
  files checked into version control, even if they haven't implemented
  zero-trust machine identities yet.


  The failure modes you'll run into almost universally fall into a few buckets.
  First, rotation breaks things because the application was never designed to
  refresh credentials without a restart — suddenly rotating the database
  password brings down production because three services are holding stale
  connections. The fix is to design for rotation from the start: read the
  credential on each connection attempt, or at a short TTL, not once at startup.
  Second, access sprawl: secrets get shared broadly because restricting them
  feels like friction, and six months later you can't audit who actually needed
  the Stripe API key. Third, the CI/CD pipeline becomes the weakest link — the
  application vault is locked down tight, but the build pipeline has a
  `GITHUB_SECRET_EVERYTHING` environment variable that any workflow can read.
  Treat your CI environment with the same skepticism you treat production.


  The mental model that makes secrets management click is thinking about
  credentials the way you think about cash. You wouldn't leave cash on your desk
  and hope nobody takes it. You wouldn't make photocopies of your corporate card
  and hand them to everyone who might ever need to make a purchase. You'd give
  people the minimum access they need, you'd know exactly who has what, and
  you'd change the combination on the safe when someone leaves. Secrets
  management operationalizes that intuition: least privilege, auditability, and
  time-bounded access. A secret that expires in an hour is worth far less to an
  attacker than one that never expires. A secret that's logged every time it's
  accessed gives you a forensic trail when something does go wrong.


  In the broader ecosystem, secrets management sits at the intersection of
  security and infrastructure. It's upstream of almost everything else: your
  database credentials, your third-party API integrations, your internal
  service-to-service authentication, your TLS certificates. Getting this right
  early means every service you add to your stack inherits a sane credential
  hygiene baseline. Getting it wrong means technical debt that compounds — every
  new service learns the bad habit from the services that came before it, and by
  the time you're ready to fix it, you have a hundred credentials scattered
  across a hundred places that all need to be found, rotated, and migrated
  simultaneously.
pitfalls:
  - title: Hardcoding credentials in source code
    explanation: >-
      Secrets committed to a repository — even briefly, even in a private repo —
      persist in git history long after they are deleted from the file. Rotate
      every credential that has ever touched version control and migrate to a
      vault before treating the exposure as resolved.
  - title: Long-lived static credentials with no rotation
    explanation: >-
      A secret that never expires has infinite attack surface: every person who
      ever had access, every machine that ever cached it, and every log that
      ever printed it is a potential leak vector. Enforce a rotation schedule
      and prefer short-lived dynamic credentials issued by your vault on demand.
  - title: Applications that can't reload secrets without restart
    explanation: >-
      If your service reads the database password once at startup and holds it
      in memory, rotating the credential brings down production — so rotation
      never happens. Design services to fetch credentials on each connection or
      at a short TTL so rotation is operationally safe.
  - title: CI/CD pipelines treated as a lower-security environment
    explanation: >-
      Build pipelines frequently hold broad secrets under a single environment
      variable that every workflow job can read, undermining a tightly
      locked-down production vault. Scope CI secrets to the minimum required per
      job and audit who can trigger workflows that consume them.
  - title: Broad secret access with no least-privilege policy
    explanation: >-
      Sharing a single API key across five services because it is easier means a
      compromise of any one of them exposes all of them. Issue per-service
      credentials scoped to only the permissions each service actually needs,
      and revoke immediately when a service is decommissioned.
  - title: No audit log on secret access
    explanation: >-
      Without a record of which workload accessed which secret and when, a
      breach investigation starts from zero. Ensure every secret read is logged
      through your vault's audit backend, and alert on access patterns that
      deviate from the established baseline.
codeExamples:
  - language: typescript
    title: Fetch Secret From AWS Secrets Manager
    code: >-
      import { SecretsManagerClient, GetSecretValueCommand } from
      '@aws-sdk/client-secrets-manager';


      const client = new SecretsManagerClient({ region: 'us-east-1' });


      // Cache secrets in memory with a short TTL — never hold them forever

      const cache = new Map<string, { value: string; expiresAt: number }>();

      const TTL_MS = 5 * 60 * 1000; // 5 minutes


      export async function getSecret(secretId: string): Promise<string> {
        const cached = cache.get(secretId);
        if (cached && cached.expiresAt > Date.now()) {
          return cached.value;
        }

        const response = await client.send(
          new GetSecretValueCommand({ SecretId: secretId })
        );

        const value = response.SecretString;
        if (!value) throw new Error(`Secret ${secretId} has no string value`);

        cache.set(secretId, { value, expiresAt: Date.now() + TTL_MS });
        return value;
      }


      // Usage: always fetch at call time, never store in a module-level const

      async function connectToDatabase() {
        const password = await getSecret('prod/myapp/db-password');
        return createConnection({ password });
      }


      function createConnection(opts: { password: string }) {
        // ... database connection logic
        return { connected: true };
      }
    reasoning: >-
      Shows the key pattern that prevents rotation from breaking production:
      fetching the secret at call time with a short TTL cache, so a rotated
      credential is picked up within minutes without a restart.
  - language: bash
    title: Audit Which Secrets Are Stale In Vault
    code: >-
      #!/usr/bin/env bash

      # List all secrets in a Vault KV mount and flag those not rotated in 90
      days


      set -euo pipefail


      VAULT_ADDR=${VAULT_ADDR:-https://vault.example.com}

      MOUNT=${1:-secret}

      STALE_DAYS=90

      STALE_EPOCH=$(( $(date +%s) - STALE_DAYS * 86400 ))


      echo "Checking secrets under ${MOUNT}/ not rotated in ${STALE_DAYS}
      days..."


      vault kv list -format=json "${MOUNT}/" | jq -r '.[]' | while read -r key;
      do
        metadata=$(vault kv metadata get -format=json "${MOUNT}/${key}" 2>/dev/null) || continue

        updated_time=$(echo "$metadata" | jq -r '.data.updated_time')
        updated_epoch=$(date -d "$updated_time" +%s 2>/dev/null || date -j -f "%Y-%m-%dT%H:%M:%S" "${updated_time%%.*}" +%s)

        if [[ $updated_epoch -lt $STALE_EPOCH ]]; then
          days_old=$(( ( $(date +%s) - updated_epoch ) / 86400 ))
          echo "STALE [${days_old}d]: ${MOUNT}/${key}"
        fi
      done
    reasoning: >-
      Rotation is only useful if you can find the secrets that were never
      rotated; this script surfaces stale credentials before an audit or
      incident forces you to.
difficulty: intermediate
estimatedHours: 4
tldr: >-
  Keep API keys and passwords in a secure vault, not in code or files. Rotate
  them automatically and know who accessed them when.
shortExplainerVideo: null
lastUpdatedAt: '2026-05-14T12:11:25.916Z'
---
<!-- user notes -->
