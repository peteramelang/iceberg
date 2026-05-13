import { z } from "zod";

export const VideoResourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  author: z.string(),
  durationMinutes: z.number().int().positive(),
  addedAt: z.string(),
  reasoning: z.string()
});
export type VideoResource = z.infer<typeof VideoResourceSchema>;

export const ArticleResourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  kind: z.enum(["canonical-doc", "engineering-blog", "tutorial"]),
  reasoning: z.string()
});

export const ServiceResourceSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  category: z.string(),
  reasoning: z.string()
});

export const CourseResourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  provider: z.string(),
  paid: z.boolean(),
  reasoning: z.string()
});

export const TopicFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  phase: z.string(),
  order: z.number().int(),
  summary: z.string(),
  definition: z.string(),
  needsManualPick: z.boolean(),
  resources: z.object({
    videos: z.object({ short: VideoResourceSchema.nullable(), long: VideoResourceSchema.nullable() }),
    articles: z.array(ArticleResourceSchema),
    services: z.array(ServiceResourceSchema),
    courses: z.array(CourseResourceSchema)
  }),
  provenance: z.object({
    researchedAt: z.string(),
    pipelineVersion: z.number().int(),
    rounds: z.number().int(),
    stabilized: z.boolean()
  })
});
export type TopicFrontmatter = z.infer<typeof TopicFrontmatterSchema>;

export const ConnectionEdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: z.enum(["prerequisite", "related", "often-confused-with", "pairs-with"]),
  weight: z.number().min(0).max(1),
  reasoning: z.string()
});
export type ConnectionEdge = z.infer<typeof ConnectionEdgeSchema>;

export const TaxonomySchema = z.object({
  version: z.literal(1),
  phases: z.array(z.object({
    slug: z.string(),
    title: z.string(),
    order: z.number().int(),
    description: z.string(),
    topics: z.array(z.string())
  })),
  topics: z.record(z.object({
    slug: z.string(),
    title: z.string(),
    phase: z.string(),
    order: z.number().int(),
    summary: z.string(),
    prerequisites: z.array(z.string()),
    tags: z.array(z.string()),
    addedByStage0: z.boolean()
  }))
});
export type Taxonomy = z.infer<typeof TaxonomySchema>;
