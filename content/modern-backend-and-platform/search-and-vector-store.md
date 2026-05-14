---
slug: search-and-vector-store
title: Search and Vector Stores
phase: modern-backend-and-platform
order: 7
summary: >-
  Full-text search (Postgres FTS, Meilisearch, Typesense) and vector stores
  (pgvector, Qdrant) — choosing between them and combining.
tldr: >-
  Pending tldr — short, plain-language summary written for a non-technical
  reader or quick skim. Replace before publishing.
definition: >-
  Search in production divides into two related but distinct problems: full-text
  search (matching keywords, handling typos, ranking by relevance) and vector
  search (finding semantically similar items by comparing embedding vectors).
  Full-text search is the default choice for product search, documentation, and
  filtering: Postgres FTS (via `tsvector`) works well at moderate scale with no
  extra infrastructure, while dedicated engines like Meilisearch and Typesense
  offer sub-millisecond response times, typo tolerance, and faceting out of the
  box. Algolia is the managed incumbent with the best developer experience but
  significant cost at scale. Elasticsearch remains dominant in enterprise log
  analytics.


  Vector search powers semantic retrieval for RAG pipelines, recommendation
  systems, image similarity, and duplicate detection. Embeddings are
  high-dimensional float vectors produced by models like OpenAI's
  `text-embedding-3-small`; the database finds the approximate nearest neighbors
  (ANN) using indexing algorithms like HNSW or IVFFlat. pgvector adds this
  capability to Postgres—zero additional infrastructure, but it stores the full
  index in memory and can be slower than dedicated engines at billion-scale.
  Qdrant (Rust, high throughput, advanced filtering), Pinecone (fully managed,
  zero ops), and Weaviate (open source, hybrid search, self-host or managed) are
  the dedicated alternatives.


  The modern pattern is hybrid search: combine keyword search (BM25) with vector
  similarity, fuse the scores, and re-rank. Both Meilisearch and Elasticsearch
  now support this natively. For most applications starting out, pgvector plus
  Postgres FTS covers 90% of use cases before the operational complexity of a
  dedicated search cluster is warranted.
shortExplainerVideo: null
narrative: >-
  Pending narrative — at least 400 characters of plain-English explanation of
  why this topic matters, what the dominant failure modes are, and how a learner
  should approach it. Replace this placeholder before publishing. Placeholder
  body. Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. Placeholder body.
  Placeholder body. Placeholder body. Placeholder body. 
pitfalls:
  - title: (pitfall 1 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
  - title: (pitfall 2 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
  - title: (pitfall 3 pending)
    explanation: Pending — at least 40 characters explaining why this is a common mistake.
codeExamples:
  - language: typescript
    title: (pending)
    code: // pending code example with at least 20 chars of real code
    reasoning: pending
difficulty: intermediate
estimatedHours: 4
lastUpdatedAt: '2026-05-14T12:26:04.525Z'
needsManualPick: false
resources:
  videos:
    short:
      url: 'https://www.youtube.com/watch?v=fuS_TQSPCoU'
      title: >-
        Build your own search engine with Text Transformers and Qdrant Vector
        Database
      author: Qdrant
      durationMinutes: 12
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Concise practical demo of building a semantic search engine using text
        embeddings and Qdrant—shows the full vector search pipeline in a
        digestible runtime.
      source: ai-researcher
    long:
      url: 'https://www.youtube.com/watch?v=Xfv4hCWvkp0'
      title: >-
        Postgres As A Vector Database: Billion-Scale Vector Similarity Search
        With pgvector
      author: Neon
      durationMinutes: 40
      addedAt: '2026-05-15T00:00:00Z'
      reasoning: >-
        Deep dive into pgvector covering HNSW vs IVFFlat indexes, approximate vs
        exact search, and performance benchmarks at scale—essential for teams
        evaluating pgvector vs dedicated engines.
      source: ai-researcher
  articles:
    - url: 'https://github.com/pgvector/pgvector'
      title: pgvector — Open-source vector similarity search for Postgres
      kind: canonical-doc
      reasoning: >-
        The canonical reference for pgvector: installation, index types,
        distance operators, and performance tuning—the starting point for
        Postgres-native vector search.
      publisher: pgvector open source
      source: ai-researcher
    - url: 'https://www.meilisearch.com/blog/meilisearch-vs-typesense'
      title: Meilisearch vs Typesense
      kind: engineering-blog
      reasoning: >-
        Detailed comparison of the two leading open-source full-text search
        engines covering architecture, performance, language support, and
        scaling characteristics.
      publisher: Meilisearch
      source: ai-researcher
    - url: 'https://encore.dev/blog/you-probably-dont-need-a-vector-database'
      title: 'pgvector Guide: Vector Search and RAG in PostgreSQL'
      kind: tutorial
      reasoning: >-
        Practical guide arguing for pgvector as a starting point, with working
        RAG examples—helps teams avoid premature complexity when Postgres is
        already in the stack.
      publisher: Encore
      source: ai-researcher
  services:
    - name: Meilisearch
      url: 'https://www.meilisearch.com/'
      category: full-text search engine
      reasoning: >-
        Open-source, developer-friendly full-text search with instant results,
        typo tolerance, and hybrid search; available self-hosted or as a managed
        cloud service.
      vendor: Meilisearch SAS
      source: ai-researcher
    - name: Typesense
      url: 'https://typesense.org/'
      category: full-text search engine
      reasoning: >-
        Open-source search engine with entire index in RAM for sub-10ms queries;
        strong choice for e-commerce and high-traffic search with simple
        configuration.
      vendor: Typesense Inc.
      source: ai-researcher
    - name: Algolia
      url: 'https://www.algolia.com/'
      category: managed search-as-a-service
      reasoning: >-
        The most mature managed full-text search service with the best developer
        experience, comprehensive SDKs, and AI search features—highest cost at
        scale.
      vendor: Algolia
      source: ai-researcher
    - name: Qdrant
      url: 'https://qdrant.tech/'
      category: vector database
      reasoning: >-
        High-performance open-source vector search engine written in Rust with
        advanced filtering, sparse vectors, and both self-hosted and managed
        cloud options.
      vendor: Qdrant Solutions GmbH
      source: ai-researcher
    - name: Pinecone
      url: 'https://www.pinecone.io/'
      category: managed vector database
      reasoning: >-
        Fully managed vector database with no infrastructure to operate; instant
        indexing, sub-100ms queries at billion scale, and SOC2/HIPAA compliance.
      vendor: Pinecone Systems
      source: ai-researcher
  courses:
    - url: >-
        https://qdrant.tech/course/essentials/day-0/building-simple-vector-search/
      title: 'Qdrant Essentials: Building Simple Vector Search'
      provider: Qdrant
      paid: false
      reasoning: >-
        Free hands-on course from Qdrant covering collections, vector insertion,
        and similarity search with Python—structured introduction to the full
        vector search workflow.
      source: ai-researcher
provenance:
  researchedAt: '2026-05-14T12:26:04.525Z'
  pipelineVersion: 1
  rounds: 1
  stabilized: false
---
<!-- user notes -->
