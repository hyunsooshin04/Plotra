import { pgTable, uuid, text, jsonb, timestamp, unique, check } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { projects } from "./projects.js";
import { characterRelTypeEnum } from "./enums.js";

export const characters = pgTable("characters", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  profile: text("profile"),
  personality: text("personality"),
  goals: text("goals"),
  weaknesses: text("weaknesses"),
  conflicts: text("conflicts"),
  backstory: text("backstory"),
  appearance: text("appearance"),
  speechStyle: text("speech_style"),
  growthArc: text("growth_arc"),
  traits: jsonb("traits").default({}),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const characterRelationships = pgTable(
  "character_relationships",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
    characterId: uuid("character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
    relatedCharacterId: uuid("related_character_id").notNull().references(() => characters.id, { onDelete: "cascade" }),
    relationshipType: characterRelTypeEnum("relationship_type").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    unique("character_rel_unique").on(table.characterId, table.relatedCharacterId),
    check("character_rel_no_self", sql`${table.characterId} != ${table.relatedCharacterId}`),
  ],
);
