import bundle from "./topics.generated.json";
import { TopicFrontmatterSchema, TaxonomySchema, ConnectionEdgeSchema, type TopicFrontmatter, type Taxonomy, type ConnectionEdge } from "./types.js";
import { z } from "zod";

const BundleSchema = z.object({
  generatedAt: z.string(),
  mode: z.enum(["full", "smoke"]),
  taxonomy: TaxonomySchema.nullable(),
  connections: z.object({ version: z.literal(1), edges: z.array(ConnectionEdgeSchema) }),
  topics: z.array(z.object({ frontmatter: TopicFrontmatterSchema, body: z.string() }))
});

const parsed = BundleSchema.parse(bundle);

export const taxonomy: Taxonomy | null = parsed.taxonomy;
export const connections: ConnectionEdge[] = parsed.connections.edges;
export const topics: { frontmatter: TopicFrontmatter; body: string }[] = parsed.topics;

export function getTopic(slug: string) {
  return topics.find(t => t.frontmatter.slug === slug);
}
export function getPhase(slug: string) {
  return taxonomy?.phases.find(p => p.slug === slug);
}
