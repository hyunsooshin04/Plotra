import { pgTable, uuid, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects.js";

export const glossary = pgTable("glossary", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  term: text("term").notNull(),
  definition: text("definition").notNull(),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
