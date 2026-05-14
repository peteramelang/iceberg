---
slug: search-and-vector-store
title: Search and Vector Stores
phase: modern-backend-and-platform
order: 7
summary: >-
  Full-text search (Postgres FTS, Meilisearch, Typesense) and vector stores
  (pgvector, Qdrant) — choosing between them and combining.
tldr: >-
  Full-text search finds keyword matches; vector search finds semantically
  similar items. Combine both for comprehensive discovery and recommendation.
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
  Search is one of those features that looks simple until you try to build it
  correctly. A naive ILIKE query in Postgres will get you through a demo, but it
  will also miss results because of case sensitivity, return too many results
  because it matches substrings indiscriminately, and fall apart on typos that
  real users make constantly. Production search requires understanding relevance
  ranking, stemming, stop words, and tokenization — all of which full-text
  search engines have solved and raw SQL has not. The decision of which search
  solution to use is primarily driven by your scale, your operational budget,
  and what kind of search you need: keyword, semantic, or both.


  For most applications at moderate scale, Postgres full-text search is the
  right starting point and the choice you should exhaust before introducing a
  separate search service. The `tsvector` and `tsquery` types give you stemming,
  stop words, ranked results, and GIN index-backed performance on millions of
  rows without any additional infrastructure. The 80/20 of Postgres FTS is
  learning to use `to_tsquery` with `plainto_tsquery` for user input (which
  handles the tokenization safely), creating a GIN index on a generated
  `tsvector` column, and using `ts_rank` for result ordering. When you hit the
  ceiling — typo tolerance, faceted filtering, sub-20ms response times at high
  query volume — Meilisearch and Typesense are the correct step up. Both are
  self-hosted, Rust-based, and optimized for search-as-a-UI-feature: they handle
  typos by default, support facets natively, and consistently return results in
  under 10ms. Algolia is the managed equivalent with the best developer
  experience and the highest cost at scale.


  Vector search is a different problem with a different answer. Keyword search
  matches tokens; vector search finds semantic neighbors. You embed your
  documents and queries into high-dimensional float vectors using an embedding
  model, then find the approximate nearest neighbors at query time. This is what
  makes it possible to search for "documents about contract termination" and
  surface results that never use those exact words. pgvector is the correct
  starting point here as well — it adds ANN indexing to Postgres, keeps you at
  zero additional infrastructure, and handles hundreds of millions of vectors
  before you genuinely need to consider a dedicated engine. The HNSW index in
  pgvector is meaningfully faster than the older IVFFlat for most query patterns
  and is the recommended choice for new deployments.


  The failure mode that catches teams is treating vector search as a drop-in
  replacement for keyword search when it is actually a complement. Pure semantic
  search misses exact matches, returns unexpected results for proper nouns and
  product SKUs, and is sensitive to embedding model quality in ways that are
  hard to predict without evaluation. Pure keyword search misses paraphrases and
  synonyms. The production pattern — hybrid search combining BM25 keyword scores
  with vector similarity, fused using Reciprocal Rank Fusion — consistently
  outperforms either alone on real user query distributions. Meilisearch and
  Elasticsearch both support hybrid search natively now; implementing it
  yourself on Postgres requires running both query types and fusing the results
  in application code, which is doable but adds complexity.


  In the broader ecosystem, the line between full-text and vector search is
  deliberately blurring. Typesense added vector search. Qdrant and Weaviate
  added keyword hybrid modes. The managed Postgres providers — Supabase, Neon —
  made pgvector trivially easy to enable. For teams building RAG pipelines, the
  vector store is the retrieval layer that determines what context gets sent to
  the language model, which makes its quality directly visible in output
  quality. The lesson from early RAG deployments is that retrieval quality
  compounds: a well-tuned hybrid search with good chunking strategies
  dramatically outperforms pure vector search on even the best embedding models,
  and the engineering investment in getting retrieval right is almost always
  more leveraged than fine-tuning the generation model.
pitfalls:
  - title: Embedding search when keyword search would work better
    explanation: >-
      Vector search finds semantically similar content but performs poorly for
      exact keyword lookups, SKU matching, and filtering by structured
      attributes — cases where full-text search or a database WHERE clause is
      the correct tool. Reach for vector search only when semantic similarity is
      genuinely the retrieval objective.
  - title: Storing raw embeddings without knowing retrieval quality
    explanation: >-
      Teams index a corpus, declare the RAG pipeline done, and ship without
      measuring whether retrieval is returning the right chunks. Poor retrieval
      quality poisons every generated answer regardless of model quality —
      evaluate retrieval independently before blaming the generator.
  - title: Rebuilding the entire embedding index on every data change
    explanation: >-
      Full re-indexing on each document update becomes prohibitively slow as
      corpus size grows and causes index downtime during rebuild. Use
      incremental indexing with upsert semantics — add or update only changed
      documents, preserving the rest of the index.
  - title: pgvector index not loaded into memory causes slow queries
    explanation: >-
      pgvector's HNSW index must fit in shared_buffers or be warmed into memory
      for fast approximate nearest-neighbor queries; a cold index causes full
      sequential scans that are orders of magnitude slower. Monitor index memory
      usage and warm indexes after restarts.
  - title: Skipping hybrid search leaves precision or recall on the table
    explanation: >-
      Pure vector search misses exact keyword matches; pure BM25 misses synonyms
      and paraphrases. Combining both with reciprocal rank fusion or a learned
      ranker produces materially better results for most real-world search
      queries — don't lock into one mode.
codeExamples:
  - language: sql
    title: pgvector Hybrid Search with BM25 + Embedding
    code: >-
      -- Enable extensions (run once)

      CREATE EXTENSION IF NOT EXISTS vector;

      CREATE EXTENSION IF NOT EXISTS pg_trgm;


      -- Documents table with both full-text and vector columns

      CREATE TABLE documents (
        id          BIGSERIAL PRIMARY KEY,
        title       TEXT NOT NULL,
        body        TEXT NOT NULL,
        embedding   vector(1536),             -- OpenAI text-embedding-3-small
        fts         tsvector GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || body)) STORED
      );


      CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH
      (lists = 100);

      CREATE INDEX ON documents USING GIN (fts);


      -- Hybrid search: combine keyword rank + vector similarity, return top 10

      WITH keyword AS (
        SELECT id, ts_rank(fts, query) AS kw_score
        FROM documents, plainto_tsquery('english', $1) query
        WHERE fts @@ query
      ),

      vector AS (
        SELECT id, 1 - (embedding <=> $2::vector) AS vec_score
        FROM documents
        ORDER BY embedding <=> $2::vector
        LIMIT 50
      )

      SELECT d.id, d.title,
        COALESCE(k.kw_score, 0) * 0.4 + COALESCE(v.vec_score, 0) * 0.6 AS score
      FROM documents d

      LEFT JOIN keyword k USING (id)

      LEFT JOIN vector  v USING (id)

      WHERE k.id IS NOT NULL OR v.id IS NOT NULL

      ORDER BY score DESC

      LIMIT 10;
    reasoning: >-
      A self-contained pgvector + FTS hybrid search query showing the exact SQL
      pattern — BM25 keyword score plus cosine vector similarity, fused with
      configurable weights — that most teams eventually need.
difficulty: intermediate
estimatedHours: 8
lastUpdatedAt: '2026-05-14T12:31:47.576Z'
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
