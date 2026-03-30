import { Router, type Request } from "express";
import { eq, isNull, and, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import {
  plotItems,
  plotItemChapters,
  plotItemCharacters,
} from "../db/schema/index.js";

type ProjectParams = { projectId: string };
type ItemParams = { projectId: string; id: string };
type SubParams = { projectId: string; id: string; linkId: string };

const router = Router({ mergeParams: true });

// ─── Plot Items CRUD ───

// List plot items for a project
router.get("/", async (req: Request<ProjectParams>, res) => {
  const rows = await db
    .select()
    .from(plotItems)
    .where(
      and(
        eq(plotItems.projectId, req.params.projectId),
        isNull(plotItems.deletedAt),
      ),
    )
    .orderBy(asc(plotItems.sortOrder));
  res.json(rows);
});

// Get single plot item
router.get("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .select()
    .from(plotItems)
    .where(and(eq(plotItems.id, req.params.id), isNull(plotItems.deletedAt)));
  if (!row) return res.status(404).json({ error: "Plot item not found" });
  res.json(row);
});

// Create plot item
router.post("/", async (req: Request<ProjectParams>, res) => {
  const { title, type, content, sortOrder, metadata } = req.body;
  const [row] = await db
    .insert(plotItems)
    .values({
      projectId: req.params.projectId,
      title, type, content, sortOrder, metadata,
    })
    .returning();
  res.status(201).json(row);
});

// Update plot item
router.patch("/:id", async (req: Request<ItemParams>, res) => {
  const { title, type, content, sortOrder, metadata } = req.body;
  const [row] = await db
    .update(plotItems)
    .set({ title, type, content, sortOrder, metadata, updatedAt: new Date() })
    .where(and(eq(plotItems.id, req.params.id), isNull(plotItems.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "Plot item not found" });
  res.json(row);
});

// Soft delete plot item
router.delete("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .update(plotItems)
    .set({ deletedAt: new Date() })
    .where(and(eq(plotItems.id, req.params.id), isNull(plotItems.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "Plot item not found" });
  res.json({ deleted: true });
});

// ─── Plot Item ↔ Chapters ───

// List chapters linked to a plot item
router.get("/:id/chapters", async (req: Request<ItemParams>, res) => {
  const rows = await db
    .select()
    .from(plotItemChapters)
    .where(eq(plotItemChapters.plotItemId, req.params.id));
  res.json(rows);
});

// Link chapter to plot item
router.post("/:id/chapters", async (req: Request<ItemParams>, res) => {
  const { chapterId } = req.body;
  const [row] = await db
    .insert(plotItemChapters)
    .values({ plotItemId: req.params.id, chapterId })
    .returning();
  res.status(201).json(row);
});

// Unlink chapter from plot item
router.delete("/:id/chapters/:linkId", async (req: Request<SubParams>, res) => {
  const [row] = await db
    .delete(plotItemChapters)
    .where(eq(plotItemChapters.id, req.params.linkId))
    .returning();
  if (!row) return res.status(404).json({ error: "Link not found" });
  res.json({ deleted: true });
});

// ─── Plot Item ↔ Characters ───

// List characters linked to a plot item
router.get("/:id/characters", async (req: Request<ItemParams>, res) => {
  const rows = await db
    .select()
    .from(plotItemCharacters)
    .where(eq(plotItemCharacters.plotItemId, req.params.id));
  res.json(rows);
});

// Link character to plot item
router.post("/:id/characters", async (req: Request<ItemParams>, res) => {
  const { characterId, role } = req.body;
  const [row] = await db
    .insert(plotItemCharacters)
    .values({ plotItemId: req.params.id, characterId, role })
    .returning();
  res.status(201).json(row);
});

// Unlink character from plot item
router.delete("/:id/characters/:linkId", async (req: Request<SubParams>, res) => {
  const [row] = await db
    .delete(plotItemCharacters)
    .where(eq(plotItemCharacters.id, req.params.linkId))
    .returning();
  if (!row) return res.status(404).json({ error: "Link not found" });
  res.json({ deleted: true });
});

export default router;
