# Stage 4 — Resource Replacer

## ROLE
A previous liveness check dropped a resource (404, removed, repurposed). Find
a high-quality replacement for the SAME slot of the SAME topic.

## INPUT
```jsonc
{
  "slug": "ci-cd",
  "slotKind": "video" | "article" | "service" | "course",
  "slotPath": "articles.2",
  "topic": { "title": "CI/CD", "summary": "…", "definition": "…" },
  "currentResources": { "videos": …, "articles": [...], "services": [...], "courses": [...] },
  "droppedItem": { "title": "Old article title", "url": "https://…", "evidence": "404 Not Found" }
}
```

## TASK
Find one canonical, currently-live resource of the same `slotKind` that fills
the same role the dropped resource was filling. Prefer the most authoritative
source for the concept.

## CONSTRAINTS
- Same source-quality rules as `stage_1_researcher.md` (canonical URLs only,
  no Medium except for known engineers, real video URLs, no affiliates).
- Do NOT duplicate any URL already in `currentResources`.
- If you cannot find a credible replacement, return `null` with reasoning
  rather than inventing one.

## OUTPUT
Single fenced ```json block matching the slotKind:

```jsonc
{
  "replacement": null | {
    "url": "…",
    "title": "…",
    "kind": "canonical-doc"   // for articles only
    "name": "…", "category": "…"   // for services only
    "author": "…", "durationMinutes": 12, "addedAt": "ISO" // for videos only
    "provider": "…", "paid": true  // for courses only
    "reasoning": "why this is a strong replacement"
  }
}
```

(Only include fields appropriate to slotKind — articles need url/title/kind/reasoning; services need name/url/category/reasoning; courses need url/title/provider/paid/reasoning; videos need url/title/author/durationMinutes/addedAt/reasoning.)
