import { pgTable, uuid, text, integer, jsonb, timestamp, index, unique } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";
import { chapters } from "./chapters.js";
import { characters } from "./characters.js";
import { plotItemTypeEnum } from "./enums.js";

export const plotItems = pgTable(
  "plot_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    type: plotItemTypeEnum("type").notNull(),
    content: text("content").default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    metadata: jsonb("metadata").default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    index("plot_items_project_sort_idx").on(table.projectId, table.sortOrder),
  ],
);

export const plotItemChapters = pgTable(
  "plot_item_chapters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    plotItemId: uuid("plot_item_id").notNull().references(() => plotItems.id, { onDelete: "cascade" }),
    chapterId: uuid("chapter_id").notNull().references(() => chapters.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("plot_item_chapter_unique").on(table.plotItemId, table.chapterId),
  ],
);

export const plotItemCharacters = pgTable(
  "plot_item_characters",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    plotItemId: uuid("plot_item_id").notNull().references(() => plotItems.id, { onDelete: "cascade" }),
    characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
    role: text("role"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("plot_item_character_unique").on(table.plotItemId, table.characterId),
  ],
);
