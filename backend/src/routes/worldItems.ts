import { Router, type Request } from "express";
import { eq, isNull, and, or } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  worldItems,
  worldItemLinks,
  characterWorldItems,
} from "../db/schema/index.js";

type ProjectParams = { projectId: string };
type ItemParams = { projectId: string; id: string };
type SubParams = { projectId: string; id: string; linkId: string };

const router = Router({ mergeParams: true });

// ─── World Items CRUD ───

// List world items for a project
router.get("/", async (req: Request<ProjectParams>, res) => {
  const rows = await db
    .select()
    .from(worldItems)
    .where(
      and(
        eq(worldItems.projectId, req.params.projectId),
        isNull(worldItems.deletedAt),
      ),
    )
    .orderBy(worldItems.createdAt);
  res.json(rows);
});

// Get single world item
router.get("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .select()
    .from(worldItems)
    .where(and(eq(worldItems.id, req.params.id), isNull(worldItems.deletedAt)));
  if (!row) return res.status(404).json({ error: "World item not found" });
  res.json(row);
});

// Create world item
router.post("/", async (req: Request<ProjectParams>, res) => {
  const { name, category, content, summary, tags, metadata } = req.body;
  const [row] = await db
    .insert(worldItems)
    .values({
      projectId: req.params.projectId,
      name, category, content, summary, tags, metadata,
    })
    .returning();
  res.status(201).json(row);
});

// Update world item
router.patch("/:id", async (req: Request<ItemParams>, res) => {
  const { name, category, content, summary, tags, metadata } = req.body;
  const [row] = await db
    .update(worldItems)
    .set({ name, category, content, summary, tags, metadata, updatedAt: new Date() })
    .where(and(eq(worldItems.id, req.params.id), isNull(worldItems.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "World item not found" });
  res.json(row);
});

// Soft delete world item
router.delete("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .update(worldItems)
    .set({ deletedAt: new Date() })
    .where(and(eq(worldItems.id, req.params.id), isNull(worldItems.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "World item not found" });
  res.json({ deleted: true });
});

// ─── World Item Links ───

// List links for a world item
router.get("/:id/links", async (req: Request<ItemParams>, res) => {
  const rows = await db
    .select()
    .from(worldItemLinks)
    .where(
      or(
        eq(worldItemLinks.sourceId, req.params.id),
        eq(worldItemLinks.targetId, req.params.id),
      ),
    );
  res.json(rows);
});

// Create link between world items
router.post("/:id/links", async (req: Request<ItemParams>, res) => {
  const { targetId, description } = req.body;
  const [row] = await db
    .insert(worldItemLinks)
    .values({
      projectId: req.params.projectId,
      sourceId: req.params.id,
      targetId,
      description,
    })
    .returning();
  res.status(201).json(row);
});

// Delete link
router.delete("/:id/links/:linkId", async (req: Request<SubParams>, res) => {
  const [row] = await db
    .delete(worldItemLinks)
    .where(eq(worldItemLinks.id, req.params.linkId))
    .returning();
  if (!row) return res.status(404).json({ error: "Link not found" });
  res.json({ deleted: true });
});

// ─── Character ↔ World Item Links ───

// List characters linked to a world item
router.get("/:id/characters", async (req: Request<ItemParams>, res) => {
  const rows = await db
    .select()
    .from(characterWorldItems)
    .where(eq(characterWorldItems.worldItemId, req.params.id));
  res.json(rows);
});

// Link character to world item
router.post("/:id/characters", async (req: Request<ItemParams>, res) => {
  const { characterId, description } = req.body;
  const [row] = await db
    .insert(characterWorldItems)
    .values({
      projectId: req.params.projectId,
      characterId,
      worldItemId: req.params.id,
      description,
    })
    .returning();
  res.status(201).json(row);
});

// Remove character-world item link
router.delete("/:id/characters/:linkId", async (req: Request<SubParams>, res) => {
  const [row] = await db
    .delete(characterWorldItems)
    .where(eq(characterWorldItems.id, req.params.linkId))
    .returning();
  if (!row) return res.status(404).json({ error: "Link not found" });
  res.json({ deleted: true });
});

export default router;
