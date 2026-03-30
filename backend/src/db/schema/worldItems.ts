import { pgTable, uuid, text, jsonb, timestamp, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects.js";
import { characters } from "./characters.js";
import { worldItemCategoryEnum } from "./enums.js";

export const worldItems = pgTable("world_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: worldItemCategoryEnum("category").notNull(),
  content: text("content").default(""),
  summary: text("summary"),
  tags: text("tags").array().default(sql`'{}'::text[]`),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const worldItemLinks = pgTable(
  "world_item_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    sourceId: uuid("source_id").notNull().references(() => worldItems.id, { onDelete: "cascade" }),
    targetId: uuid("target_id").notNull().references(() => worldItems.id, { onDelete: "cascade" }),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("world_item_link_unique").on(table.sourceId, table.targetId),
    check("world_item_link_no_self", sql`${table.sourceId} != ${table.targetId}`),
  ],
);

export const characterWorldItems = pgTable(
  "character_world_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
    worldItemId: uuid("world_item_id").notNull().references(() => worldItems.id, { onDelete: "cascade" }),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("character_world_item_unique").on(table.characterId, table.worldItemId),
  ],
);
