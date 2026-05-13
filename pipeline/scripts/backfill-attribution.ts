import { readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { readTopicFile, writeTopicFile } from "../lib/content.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(__dirname, "..", "..");
const contentDir = join(repoRoot, "content");

// Canonical publisher / vendor names by hostname. Lowercased hostname → display name.
const PUBLISHERS: Record<string, string> = {
  "stripe.com": "Stripe",
  "docs.stripe.com": "Stripe",
  "auth0.com": "Auth0",
  "clerk.com": "Clerk",
  "okta.com": "Okta",
  "www.okta.com": "Okta",
  "firebase.google.com": "Google (Firebase)",
  "cloud.google.com": "Google Cloud",
  "developers.google.com": "Google",
  "google.com": "Google",
  "sre.google": "Google SRE",
  "landing.google.com": "Google SRE",
  "research.google": "Google Research",
  "blog.google": "Google",
  "googleblog.com": "Google",
  "developer.mozilla.org": "MDN / Mozilla",
  "mozilla.org": "Mozilla",
  "owasp.org": "OWASP",
  "cheatsheetseries.owasp.org": "OWASP",
  "datatracker.ietf.org": "IETF",
  "ietf.org": "IETF",
  "www.iapp.org": "IAPP",
  "iapp.org": "IAPP",
  "gdpr.eu": "GDPR.eu",
  "oag.ca.gov": "California Attorney General",
  "nist.gov": "NIST",
  "www.nist.gov": "NIST",
  "github.com": "GitHub",
  "docs.github.com": "GitHub",
  "aws.amazon.com": "Amazon Web Services",
  "docs.aws.amazon.com": "Amazon Web Services",
  "learn.microsoft.com": "Microsoft Learn",
  "microsoft.com": "Microsoft",
  "microsoft.github.io": "Microsoft",
  "azure.com": "Microsoft Azure",
  "www.cloudflare.com": "Cloudflare",
  "cloudflare.com": "Cloudflare",
  "developers.cloudflare.com": "Cloudflare",
  "workers.cloudflare.com": "Cloudflare",
  "supabase.com": "Supabase",
  "www.supabase.com": "Supabase",
  "hasura.io": "Hasura",
  "www.prisma.io": "Prisma",
  "prisma.io": "Prisma",
  "postgrest.org": "PostgREST",
  "orm.drizzle.team": "Drizzle ORM",
  "drizzle.team": "Drizzle ORM",
  "www.postgresql.org": "PostgreSQL",
  "postgresql.org": "PostgreSQL",
  "redis.io": "Redis",
  "memcached.org": "Memcached",
  "varnish-cache.org": "Varnish",
  "www.nginx.com": "NGINX",
  "nginx.com": "NGINX",
  "www.haproxy.org": "HAProxy",
  "haproxy.org": "HAProxy",
  "www.envoyproxy.io": "Envoy",
  "envoyproxy.io": "Envoy",
  "traefik.io": "Traefik",
  "kafka.apache.org": "Apache Kafka",
  "rabbitmq.com": "RabbitMQ",
  "www.rabbitmq.com": "RabbitMQ",
  "sidekiq.org": "Sidekiq",
  "www.inngest.com": "Inngest",
  "inngest.com": "Inngest",
  "temporal.io": "Temporal",
  "www.temporal.io": "Temporal",
  "fly.io": "Fly.io",
  "planetscale.com": "PlanetScale",
  "www.cockroachlabs.com": "Cockroach Labs",
  "cockroachlabs.com": "Cockroach Labs",
  "www.flywaydb.org": "Redgate (Flyway)",
  "flywaydb.org": "Redgate (Flyway)",
  "www.liquibase.org": "Liquibase",
  "liquibase.org": "Liquibase",
  "atlasgo.io": "Atlas",
  "sqitch.org": "Sqitch",
  "opentelemetry.io": "OpenTelemetry (CNCF)",
  "prometheus.io": "Prometheus (CNCF)",
  "grafana.com": "Grafana Labs",
  "www.datadoghq.com": "Datadog",
  "datadoghq.com": "Datadog",
  "docs.datadoghq.com": "Datadog",
  "www.honeycomb.io": "Honeycomb",
  "honeycomb.io": "Honeycomb",
  "newrelic.com": "New Relic",
  "www.dynatrace.com": "Dynatrace",
  "dynatrace.com": "Dynatrace",
  "sentry.io": "Sentry",
  "rollbar.com": "Rollbar",
  "www.bugsnag.com": "BugSnag",
  "bugsnag.com": "BugSnag",
  "www.honeybadger.io": "Honeybadger",
  "honeybadger.io": "Honeybadger",
  "www.pagerduty.com": "PagerDuty",
  "pagerduty.com": "PagerDuty",
  "response.pagerduty.com": "PagerDuty",
  "incident.io": "incident.io",
  "firehydrant.com": "FireHydrant",
  "www.rootly.com": "Rootly",
  "rootly.com": "Rootly",
  "www.opsgenie.com": "Atlassian (Opsgenie)",
  "opsgenie.com": "Atlassian (Opsgenie)",
  "www.atlassian.com": "Atlassian",
  "atlassian.com": "Atlassian",
  "www.zendesk.com": "Zendesk",
  "zendesk.com": "Zendesk",
  "www.intercom.com": "Intercom",
  "intercom.com": "Intercom",
  "www.helpscout.com": "Help Scout",
  "helpscout.com": "Help Scout",
  "front.com": "Front",
  "www.freshworks.com": "Freshworks",
  "amplitude.com": "Amplitude",
  "mixpanel.com": "Mixpanel",
  "posthog.com": "PostHog",
  "www.heap.io": "Heap",
  "heap.io": "Heap",
  "www.reforge.com": "Reforge",
  "reforge.com": "Reforge",
  "chartmogul.com": "ChartMogul",
  "www.profitwell.com": "ProfitWell",
  "baremetrics.com": "Baremetrics",
  "recurly.com": "Recurly",
  "www.chargebee.com": "Chargebee",
  "chargebee.com": "Chargebee",
  "www.paddle.com": "Paddle",
  "paddle.com": "Paddle",
  "www.lemonsqueezy.com": "Lemon Squeezy",
  "lemonsqueezy.com": "Lemon Squeezy",
  "www.adyen.com": "Adyen",
  "squareup.com": "Square",
  "www.getorb.com": "Orb",
  "orbicular.com": "Orb",
  "www.metronome.com": "Metronome",
  "www.zuora.com": "Zuora",
  "stigg.io": "Stigg",
  "www.stigg.io": "Stigg",
  "stately.ai": "Stately",
  "xstate.js.org": "Stately (XState)",
  "launchdarkly.com": "LaunchDarkly",
  "www.growthbook.io": "GrowthBook",
  "growthbook.io": "GrowthBook",
  "flagsmith.com": "Flagsmith",
  "www.flagsmith.com": "Flagsmith",
  "www.getunleash.io": "Unleash",
  "getunleash.io": "Unleash",
  "statsig.com": "Statsig",
  "www.split.io": "Split",
  "splitsoftware.com": "Split",
  "www.optimizely.com": "Optimizely",
  "optimizely.com": "Optimizely",
  "vwo.com": "VWO",
  "www.vwo.com": "VWO",
  "vitest.dev": "Vitest",
  "jestjs.io": "Jest",
  "playwright.dev": "Microsoft (Playwright)",
  "www.cypress.io": "Cypress",
  "cypress.io": "Cypress",
  "testing-library.com": "Testing Library",
  "circleci.com": "CircleCI",
  "buildkite.com": "Buildkite",
  "gitlab.com": "GitLab",
  "www.jenkins.io": "Jenkins",
  "jenkins.io": "Jenkins",
  "kubernetes.io": "Kubernetes (CNCF)",
  "argoproj.github.io": "Argo (CNCF)",
  "spinnaker.io": "Spinnaker",
  "flagger.app": "Flagger",
  "www.heroku.com": "Heroku",
  "heroku.com": "Heroku",
  "www.cncf.io": "CNCF",
  "cncf.io": "CNCF",
  "sst.dev": "SST",
  "www.terraform.io": "HashiCorp (Terraform)",
  "www.hashicorp.com": "HashiCorp",
  "www.vaultproject.io": "HashiCorp (Vault)",
  "www.pulumi.com": "Pulumi",
  "pulumi.com": "Pulumi",
  "www.doppler.com": "Doppler",
  "doppler.com": "Doppler",
  "infisical.com": "Infisical",
  "1password.com": "1Password",
  "www.openpolicyagent.org": "Open Policy Agent (CNCF)",
  "openpolicyagent.org": "Open Policy Agent (CNCF)",
  "casbin.org": "Casbin",
  "casbin.apache.org": "Casbin (Apache)",
  "www.osohq.com": "Oso",
  "osohq.com": "Oso",
  "supertokens.com": "SuperTokens",
  "www.keycloak.org": "Keycloak",
  "keycloak.org": "Keycloak",
  "authjs.dev": "Auth.js",
  "passportjs.org": "Passport.js",
  "www.passportjs.org": "Passport.js",
  "www.onetrust.com": "OneTrust",
  "onetrust.com": "OneTrust",
  "www.cookiebot.com": "Cookiebot (Usercentrics)",
  "cookiebot.com": "Cookiebot (Usercentrics)",
  "www.osano.com": "Osano",
  "osano.com": "Osano",
  "www.iubenda.com": "iubenda",
  "iubenda.com": "iubenda",
  "trustarc.com": "TrustArc",
  "securiti.ai": "Securiti",
  "www.datagrail.io": "DataGrail",
  "transcend.io": "Transcend",
  "www.jaegertracing.io": "Jaeger (CNCF)",
  "jaegertracing.io": "Jaeger (CNCF)",
  "zipkin.io": "Zipkin",
  "www.nobl9.com": "Nobl9",
  "nobl9.com": "Nobl9",
  "www.vantage.sh": "Vantage",
  "vantage.sh": "Vantage",
  "www.cloudability.com": "Cloudability (Apptio)",
  "www.cloudzero.com": "CloudZero",
  "www.infracost.io": "Infracost",
  "infracost.io": "Infracost",
  "www.finops.org": "FinOps Foundation",
  "finops.org": "FinOps Foundation",
  "highscalability.com": "High Scalability",
  "martinfowler.com": "Martin Fowler",
  "www.brendangregg.com": "Brendan Gregg",
  "brandur.org": "Brandur Leach",
  "andrewchen.com": "Andrew Chen",
  "increment.com": "Increment Magazine (Stripe)",
  "www.percona.com": "Percona",
  "queue.acm.org": "ACM Queue",
  "jepsen.io": "Jepsen",
  "aphyr.com": "Aphyr / Kyle Kingsbury",
  "12factor.net": "12factor.net (Adam Wiggins)",
  "semver.org": "Semantic Versioning",
  "swagger.io": "SmartBear (Swagger)",
  "www.openapis.org": "OpenAPI Initiative (Linux Foundation)",
  "openapis.org": "OpenAPI Initiative (Linux Foundation)",
  "www.postman.com": "Postman",
  "diataxis.fr": "Diátaxis (Daniele Procida)",
  "adr.github.io": "ADR community",
  "documentation.divio.com": "Divio",
  "www.writethedocs.org": "Write the Docs",
  "docusaurus.io": "Docusaurus (Meta)",
  "www.gitbook.com": "GitBook",
  "readme.com": "ReadMe",
  "www.mkdocs.org": "MkDocs",
  "mkdocs.org": "MkDocs",
  "www.notion.so": "Notion",
  "snyk.io": "Snyk",
  "docs.renovatebot.com": "Mend (Renovate)",
  "renovatebot.com": "Mend (Renovate)",
  "socket.dev": "Socket",
  "slsa.dev": "SLSA (OpenSSF)",
  "docs.npmjs.com": "npm (GitHub)",
  "www.checkov.io": "Bridgecrew (Checkov)",
  "checkov.io": "Bridgecrew (Checkov)",
  "spacelift.io": "Spacelift",
  "www.youtube.com": "YouTube",
  "youtu.be": "YouTube",
  "www.coursera.org": "Coursera",
  "coursera.org": "Coursera",
  "www.udemy.com": "Udemy",
  "udemy.com": "Udemy",
  "www.pluralsight.com": "Pluralsight",
  "pluralsight.com": "Pluralsight",
  "www.linkedin.com": "LinkedIn Learning",
  "www.educative.io": "Educative",
  "educative.io": "Educative",
  "training.linuxfoundation.org": "Linux Foundation",
  "learn.finops.org": "FinOps Foundation",
  "courses.pragmaticwebsecurity.com": "Pragmatic Web Security (Philippe De Ryck)",
  "pragmaticwebsecurity.com": "Pragmatic Web Security (Philippe De Ryck)",
  "bytebytego.com": "ByteByteGo (Alex Xu)",
  "www.confluent.io": "Confluent",
  "confluent.io": "Confluent",
  "betterstack.com": "Better Stack",
  "axiom.co": "Axiom",
  "loggly.com": "Loggly (SolarWinds)",
  "www.sumologic.com": "Sumo Logic",
  "papertrail.com": "Papertrail (SolarWinds)",
  "www.splunk.com": "Splunk",
  "go.dev": "Go (Google)",
  "react.dev": "React (Meta)",
  "react-dev": "React (Meta)",
  "web.dev": "Google (web.dev)",
  "dora.dev": "DORA (Google)"
};

function publisherForUrl(url: string): string | null {
  try {
    const u = new URL(url);
    const host = u.hostname.toLowerCase();
    if (PUBLISHERS[host]) return PUBLISHERS[host]!;
    // Strip leading www. and try again
    const stripped = host.replace(/^www\./, "");
    if (PUBLISHERS[stripped]) return PUBLISHERS[stripped]!;
    // Fall back: capitalize the base domain
    const parts = stripped.split(".");
    if (parts.length >= 2) {
      const base = parts[parts.length - 2]!;
      return base.charAt(0).toUpperCase() + base.slice(1);
    }
    return null;
  } catch {
    return null;
  }
}

function walkMd(dir: string, out: string[]): void {
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith("_") || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) walkMd(full, out);
    else if (entry.endsWith(".md")) out.push(full);
  }
}

const files: string[] = [];
walkMd(contentDir, files);

let touched = 0;
for (const path of files) {
  const { frontmatter, body } = readTopicFile(path);

  for (const v of [frontmatter.resources.videos.short, frontmatter.resources.videos.long]) {
    if (v && !v.source) v.source = "ai-researcher";
  }

  for (const a of frontmatter.resources.articles) {
    if (!a.publisher) {
      const p = publisherForUrl(a.url);
      if (p) a.publisher = p;
    }
    if (!a.source) a.source = "ai-researcher";
  }

  for (const s of frontmatter.resources.services) {
    if (!s.vendor) {
      const v = publisherForUrl(s.url);
      if (v && v !== s.name) s.vendor = v;
    }
    if (!s.source) s.source = "ai-researcher";
  }

  for (const c of frontmatter.resources.courses) {
    if (!c.source) c.source = "ai-researcher";
  }

  writeTopicFile(path, frontmatter, body);
  touched++;
}

console.log(`Backfilled attribution on ${touched} topic files.`);
