import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─── SIGNALS ─────────────────────────────────────────────
export const signals = sqliteTable("signals", {
  id: text("id").primaryKey(),
  rawText: text("raw_text").notNull(),
  source: text("source"),
  sourceUrl: text("source_url"),
  customer: text("customer"),
  arr: text("arr"),
  severity: text("severity"),
  frequency: text("frequency"),
  renewalRisk: text("renewal_risk"),
  status: text("status").notNull().default("new"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── PROBLEMS ────────────────────────────────────────────
export const problems = sqliteTable("problems", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  statement: text("statement").notNull(),
  whoAffected: text("who_affected"),
  workflowBlock: text("workflow_block"),
  businessImpact: text("business_impact"),
  retentionOrGrowth: text("retention_or_growth"),
  status: text("status").notNull().default("draft"),
  frequency: text("frequency"),
  severity: text("severity"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── SIGNAL <-> PROBLEM ──────────────────────────────────
export const signalProblems = sqliteTable("signal_problems", {
  id: text("id").primaryKey(),
  signalId: text("signal_id")
    .notNull()
    .references(() => signals.id, { onDelete: "cascade" }),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
  quote: text("quote"),
});

// ─── OBJECTIVES ──────────────────────────────────────────
export const objectives = sqliteTable("objectives", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  timeframe: text("timeframe"),
  metric: text("metric"),
  weight: real("weight").notNull().default(1.0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── RELEASES ───────────────────────────────────────────
export const releases = sqliteTable("releases", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  targetDate: text("target_date"),
  status: text("status").notNull().default("planned"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── ROADMAP ITEMS ───────────────────────────────────────
export const roadmapItems = sqliteTable("roadmap_items", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  rationale: text("rationale"),
  type: text("type").notNull().default("feature"),
  status: text("status").notNull().default("proposed"),
  targetMonth: text("target_month"),
  effortSize: text("effort_size"),
  reach: integer("reach"),
  impact: integer("impact"),
  confidence: integer("confidence"),
  effort: integer("effort"),
  score: real("score"),
  parentId: text("parent_id"),
  releaseId: text("release_id").references(() => releases.id, { onDelete: "set null" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── ROADMAP ITEM <-> PROBLEM ────────────────────────────
export const roadmapItemProblems = sqliteTable("roadmap_item_problems", {
  id: text("id").primaryKey(),
  roadmapItemId: text("roadmap_item_id")
    .notNull()
    .references(() => roadmapItems.id, { onDelete: "cascade" }),
  problemId: text("problem_id")
    .notNull()
    .references(() => problems.id, { onDelete: "cascade" }),
});

// ─── ROADMAP ITEM <-> OBJECTIVE ──────────────────────────
export const roadmapItemObjectives = sqliteTable("roadmap_item_objectives", {
  id: text("id").primaryKey(),
  roadmapItemId: text("roadmap_item_id")
    .notNull()
    .references(() => roadmapItems.id, { onDelete: "cascade" }),
  objectiveId: text("objective_id")
    .notNull()
    .references(() => objectives.id, { onDelete: "cascade" }),
  impactToObjective: integer("impact_to_objective"),
});

// ─── PRDs ────────────────────────────────────────────────
export const prds = sqliteTable("prds", {
  id: text("id").primaryKey(),
  roadmapItemId: text("roadmap_item_id").references(() => roadmapItems.id),
  title: text("title").notNull(),
  status: text("status").notNull().default("draft"),
  summary: text("summary"),
  problemStatement: text("problem_statement"),
  objectives: text("objectives"),
  userStories: text("user_stories"),
  designAssetLink: text("design_asset_link"),
  openQuestions: text("open_questions"),
  acceptanceCriteria: text("acceptance_criteria"),
  evidence: text("evidence"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

// ─── PRD CHAT MESSAGES ───────────────────────────────────
export const prdMessages = sqliteTable("prd_messages", {
  id: text("id").primaryKey(),
  prdId: text("prd_id")
    .notNull()
    .references(() => prds.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ─── TICKET STUBS ────────────────────────────────────────
export const ticketStubs = sqliteTable("ticket_stubs", {
  id: text("id").primaryKey(),
  prdId: text("prd_id")
    .notNull()
    .references(() => prds.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  acceptanceCriteria: text("acceptance_criteria"),
  storyPoints: integer("story_points"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

// ─── RELATIONS ───────────────────────────────────────────

export const signalsRelations = relations(signals, ({ many }) => ({
  signalProblems: many(signalProblems),
}));

export const problemsRelations = relations(problems, ({ many }) => ({
  signalProblems: many(signalProblems),
  roadmapItemProblems: many(roadmapItemProblems),
}));

export const signalProblemsRelations = relations(signalProblems, ({ one }) => ({
  signal: one(signals, {
    fields: [signalProblems.signalId],
    references: [signals.id],
  }),
  problem: one(problems, {
    fields: [signalProblems.problemId],
    references: [problems.id],
  }),
}));

export const objectivesRelations = relations(objectives, ({ many }) => ({
  roadmapItemObjectives: many(roadmapItemObjectives),
}));

export const releasesRelations = relations(releases, ({ many }) => ({
  roadmapItems: many(roadmapItems),
}));

export const roadmapItemsRelations = relations(roadmapItems, ({ one, many }) => ({
  parent: one(roadmapItems, {
    fields: [roadmapItems.parentId],
    references: [roadmapItems.id],
    relationName: "parentChild",
  }),
  children: many(roadmapItems, { relationName: "parentChild" }),
  release: one(releases, {
    fields: [roadmapItems.releaseId],
    references: [releases.id],
  }),
  roadmapItemProblems: many(roadmapItemProblems),
  roadmapItemObjectives: many(roadmapItemObjectives),
  prds: many(prds),
}));

export const roadmapItemProblemsRelations = relations(roadmapItemProblems, ({ one }) => ({
  roadmapItem: one(roadmapItems, {
    fields: [roadmapItemProblems.roadmapItemId],
    references: [roadmapItems.id],
  }),
  problem: one(problems, {
    fields: [roadmapItemProblems.problemId],
    references: [problems.id],
  }),
}));

export const roadmapItemObjectivesRelations = relations(roadmapItemObjectives, ({ one }) => ({
  roadmapItem: one(roadmapItems, {
    fields: [roadmapItemObjectives.roadmapItemId],
    references: [roadmapItems.id],
  }),
  objective: one(objectives, {
    fields: [roadmapItemObjectives.objectiveId],
    references: [objectives.id],
  }),
}));

export const prdsRelations = relations(prds, ({ one, many }) => ({
  roadmapItem: one(roadmapItems, {
    fields: [prds.roadmapItemId],
    references: [roadmapItems.id],
  }),
  messages: many(prdMessages),
  ticketStubs: many(ticketStubs),
}));

export const prdMessagesRelations = relations(prdMessages, ({ one }) => ({
  prd: one(prds, {
    fields: [prdMessages.prdId],
    references: [prds.id],
  }),
}));

export const ticketStubsRelations = relations(ticketStubs, ({ one }) => ({
  prd: one(prds, {
    fields: [ticketStubs.prdId],
    references: [prds.id],
  }),
}));
