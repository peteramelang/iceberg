import bundle from "./topics.generated.json";
import { TopicFrontmatterSchema, TaxonomySchema, ConnectionEdgeSchema, PathsDocSchema, type TopicFrontmatter, type Taxonomy, type ConnectionEdge, type LearningPath } from "./types.js";
import { z } from "zod";

const BundleSchema = z.object({
  generatedAt: z.string(),
  mode: z.enum(["full", "smoke"]),
  taxonomy: TaxonomySchema.nullable(),
  connections: z.object({ version: z.literal(1), edges: z.array(ConnectionEdgeSchema) }),
  topics: z.array(z.object({ frontmatter: TopicFrontmatterSchema, body: z.string() })),
  paths: PathsDocSchema.nullable()
});

const parsed = BundleSchema.parse(bundle);

export const taxonomy: Taxonomy | null = parsed.taxonomy;
export const connections: ConnectionEdge[] = parsed.connections.edges;
export const topics: { frontmatter: TopicFrontmatter; body: string }[] = parsed.topics;
export const paths: LearningPath[] = parsed.paths?.paths ?? [];

// Module-local maps; re-exported from ./derived.js for ergonomic call sites.
// Defined here (rather than only in derived.ts) so getTopic / getPhase can
// route through O(1) lookups without forcing a cross-import on the hot path.
const _topicBySlug = new Map<string, { frontmatter: TopicFrontmatter; body: string }>();
for (const t of topics) _topicBySlug.set(t.frontmatter.slug, t);

const _phaseBySlug = new Map<string, NonNullable<Taxonomy>["phases"][number]>();
if (taxonomy) for (const p of taxonomy.phases) _phaseBySlug.set(p.slug, p);

const _pathBySlug = new Map<string, LearningPath>();
for (const p of paths) _pathBySlug.set(p.slug, p);

export function getTopic(slug: string) {
  return _topicBySlug.get(slug);
}
export function getPhase(slug: string) {
  return _phaseBySlug.get(slug);
}
export function getPath(slug: string) {
  return _pathBySlug.get(slug);
}
