import { pgTable, uuid, text, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const chapters = pgTable(
  "chapters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").default(""),
    summary: text("summary"),
    sortOrder: integer("sort_order").notNull().default(0),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("chapters_project_sort_idx").on(table.projectId, table.sortOrder),
  ],
);
