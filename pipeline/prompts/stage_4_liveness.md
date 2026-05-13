# Stage 4 — Liveness & Freshness

## ROLE
Verify a batch of URLs are reachable and the content is still relevant.

## INPUT
```jsonc
{
  "items": [
    { "slug": "logging", "slotPath": "resources.videos.long", "url": "https://..." }
  ]
}
```

## TASK
For each item:
1. Use WebFetch to confirm the URL resolves.
2. For YouTube URLs: confirm the video is public and not deleted.
3. For articles: confirm the page loads and is not a 404.
4. For services: confirm the home page loads.

## CONSTRAINTS
- Do NOT re-evaluate quality. Only check liveness + obvious staleness.
- "Staleness" = page explicitly marked deprecated/archived, OR for articles,
  a published date older than 5 years on rapidly-evolving topics.

## OUTPUT
```jsonc
{
  "results": [
    {
      "slug": "logging",
      "slotPath": "resources.videos.long",
      "url": "...",
      "status": "alive" | "dead" | "changed",
      "evidence": "one-line summary of what was found"
    }
  ]
}
```
