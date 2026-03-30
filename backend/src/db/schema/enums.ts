import { pgEnum } from "drizzle-orm/pg-core";

export const aiTargetTypeEnum = pgEnum("ai_target_type", [
  "chapter",
  "character",
  "world_item",
  "plot",
  "note",
  "glossary",
]);

export const aiResultStatusEnum = pgEnum("ai_result_status", [
  "pending",
  "adopted",
  "partially_adopted",
  "discarded",
]);

export const worldItemCategoryEnum = pgEnum("world_item_category", [
  "region",
  "nation",
  "city",
  "race",
  "organization",
  "magic_system",
  "technology",
  "rule",
  "religion",
  "language",
  "other",
]);

export const plotItemTypeEnum = pgEnum("plot_item_type", [
  "synopsis",
  "act",
  "event",
  "foreshadowing",
  "conflict",
  "ending_candidate",
  "scene",
  "other",
]);

export const characterRelTypeEnum = pgEnum("character_rel_type", [
  "ally",
  "rival",
  "mentor",
  "student",
  "family",
  "romantic",
  "enemy",
  "colleague",
  "other",
]);
