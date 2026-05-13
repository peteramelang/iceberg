import { z } from "zod";

const AttributionFields = {
  license: z.string().optional(),
  source: z.enum(["ai-researcher", "human-curator"]).optional()
};

export const VideoResourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  author: z.string(),
  durationMinutes: z.number().int().positive(),
  addedAt: z.string(),
  reasoning: z.string(),
  channelUrl: z.string().url().optional(),
  ...AttributionFields
});
export type VideoResource = z.infer<typeof VideoResourceSchema>;

export const ArticleResourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  kind: z.enum(["canonical-doc", "engineering-blog", "tutorial"]),
  reasoning: z.string(),
  publisher: z.string().optional(),
  author: z.string().optional(),
  ...AttributionFields
});

export const ServiceResourceSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  category: z.string(),
  reasoning: z.string(),
  vendor: z.string().optional(),
  ...AttributionFields
});

export const CourseResourceSchema = z.object({
  url: z.string().url(),
  title: z.string(),
  provider: z.string(),
  paid: z.boolean(),
  reasoning: z.string(),
  instructor: z.string().optional(),
  ...AttributionFields
});

export const PitfallSchema = z.object({
  title: z.string().min(1),
  explanation: z.string().min(40)
});
export type Pitfall = z.infer<typeof PitfallSchema>;

export const CodeExampleSchema = z.object({
  language: z.enum(["typescript","javascript","python","go","rust","sql","bash","yaml","json","ruby","java","csharp"]),
  title: z.string().min(1),
  code: z.string().min(20),
  reasoning: z.string().min(1)
});
export type CodeExample = z.infer<typeof CodeExampleSchema>;

export const TopicFrontmatterSchema = z.object({
  slug: z.string(),
  title: z.string(),
  phase: z.string(),
  order: z.number().int(),
  summary: z.string(),
  definition: z.string(),
  narrative: z.string().min(400),
  pitfalls: z.array(PitfallSchema).min(3).max(8),
  codeExamples: z.array(CodeExampleSchema).min(1).max(3),
  difficulty: z.enum(["beginner","intermediate","advanced"]),
  estimatedHours: z.number().min(0.5).max(40),
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

export const PathSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string().min(40),
  audience: z.string(),
  estimatedHours: z.number().min(1),
  topics: z.array(z.string()).min(4).max(15)
});
export type LearningPath = z.infer<typeof PathSchema>;

export const PathsDocSchema = z.object({
  version: z.literal(1),
  paths: z.array(PathSchema)
});
