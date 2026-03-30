import { pgTable, uuid, text, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";
import { aiTargetTypeEnum, aiResultStatusEnum } from "./enums.js";

export const aiRequestLogs = pgTable("ai_request_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  targetType: aiTargetTypeEnum("target_type").notNull(),
  targetId: uuid("target_id").notNull(),
  prompt: text("prompt").notNull(),
  systemPrompt: text("system_prompt"),
  contextScope: jsonb("context_scope").notNull().default({}),
  model: text("model"),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const aiResults = pgTable(
  "ai_results",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    requestId: uuid("request_id").notNull().references(() => aiRequestLogs.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    status: aiResultStatusEnum("status").notNull().default("pending"),
    versionData: jsonb("version_data").default({}),
    candidateIndex: integer("candidate_index").notNull().default(0),
    metadata: jsonb("metadata").default({}),
    adoptedAt: timestamp("adopted_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("ai_results_request_idx").on(table.requestId, table.candidateIndex),
  ],
);
