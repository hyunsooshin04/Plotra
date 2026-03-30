import { Router, type Request } from "express";
import { eq, isNull, and, or } from "drizzle-orm";
import { db } from "../db/index.js";
import { characters, characterRelationships } from "../db/schema/index.js";

type ProjectParams = { projectId: string };
type ItemParams = { projectId: string; id: string };
type RelParams = { projectId: string; id: string; relId: string };

const router = Router({ mergeParams: true });

// ─── Characters CRUD ───

// List characters for a project
router.get("/", async (req: Request<ProjectParams>, res) => {
  const rows = await db
    .select()
    .from(characters)
    .where(
      and(
        eq(characters.projectId, req.params.projectId),
        isNull(characters.deletedAt),
      ),
    )
    .orderBy(characters.createdAt);
  res.json(rows);
});

// Get single character
router.get("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .select()
    .from(characters)
    .where(and(eq(characters.id, req.params.id), isNull(characters.deletedAt)));
  if (!row) return res.status(404).json({ error: "Character not found" });
  res.json(row);
});

// Create character
router.post("/", async (req: Request<ProjectParams>, res) => {
  const {
    name, profile, personality, goals, weaknesses, conflicts,
    backstory, appearance, speechStyle, growthArc, traits, metadata,
  } = req.body;
  const [row] = await db
    .insert(characters)
    .values({
      projectId: req.params.projectId,
      name, profile, personality, goals, weaknesses, conflicts,
      backstory, appearance, speechStyle, growthArc, traits, metadata,
    })
    .returning();
  res.status(201).json(row);
});

// Update character
router.patch("/:id", async (req: Request<ItemParams>, res) => {
  const {
    name, profile, personality, goals, weaknesses, conflicts,
    backstory, appearance, speechStyle, growthArc, traits, metadata,
  } = req.body;
  const [row] = await db
    .update(characters)
    .set({
      name, profile, personality, goals, weaknesses, conflicts,
      backstory, appearance, speechStyle, growthArc, traits, metadata,
      updatedAt: new Date(),
    })
    .where(and(eq(characters.id, req.params.id), isNull(characters.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "Character not found" });
  res.json(row);
});

// Soft delete character
router.delete("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .update(characters)
    .set({ deletedAt: new Date() })
    .where(and(eq(characters.id, req.params.id), isNull(characters.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "Character not found" });
  res.json({ deleted: true });
});

// ─── Character Relationships ───

// List relationships for a character
router.get("/:id/relationships", async (req: Request<ItemParams>, res) => {
  const rows = await db
    .select()
    .from(characterRelationships)
    .where(
      or(
        eq(characterRelationships.characterId, req.params.id),
        eq(characterRelationships.relatedCharacterId, req.params.id),
      ),
    );
  res.json(rows);
});

// Create relationship
router.post("/:id/relationships", async (req: Request<ItemParams>, res) => {
  const { relatedCharacterId, relationshipType, description } = req.body;
  const [row] = await db
    .insert(characterRelationships)
    .values({
      projectId: req.params.projectId,
      characterId: req.params.id,
      relatedCharacterId,
      relationshipType,
      description,
    })
    .returning();
  res.status(201).json(row);
});

// Update relationship
router.patch("/:id/relationships/:relId", async (req: Request<RelParams>, res) => {
  const { relationshipType, description } = req.body;
  const [row] = await db
    .update(characterRelationships)
    .set({ relationshipType, description, updatedAt: new Date() })
    .where(eq(characterRelationships.id, req.params.relId))
    .returning();
  if (!row) return res.status(404).json({ error: "Relationship not found" });
  res.json(row);
});

// Delete relationship
router.delete("/:id/relationships/:relId", async (req: Request<RelParams>, res) => {
  const [row] = await db
    .delete(characterRelationships)
    .where(eq(characterRelationships.id, req.params.relId))
    .returning();
  if (!row) return res.status(404).json({ error: "Relationship not found" });
  res.json({ deleted: true });
});

export default router;
