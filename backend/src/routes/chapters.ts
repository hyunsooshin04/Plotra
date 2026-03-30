import { Router, type Request } from "express";
import { eq, isNull, and, asc } from "drizzle-orm";
import { db } from "../db/index.js";
import { chapters } from "../db/schema/index.js";

type ProjectParams = { projectId: string };
type ItemParams = { projectId: string; id: string };

const router = Router({ mergeParams: true });

// List chapters for a project
router.get("/", async (req: Request<ProjectParams>, res) => {
  const rows = await db
    .select()
    .from(chapters)
    .where(
      and(
        eq(chapters.projectId, req.params.projectId),
        isNull(chapters.deletedAt),
      ),
    )
    .orderBy(asc(chapters.sortOrder));
  res.json(rows);
});

// Get single chapter
router.get("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .select()
    .from(chapters)
    .where(and(eq(chapters.id, req.params.id), isNull(chapters.deletedAt)));
  if (!row) return res.status(404).json({ error: "Chapter not found" });
  res.json(row);
});

// Create chapter
router.post("/", async (req: Request<ProjectParams>, res) => {
  const { title, content, summary, sortOrder, metadata } = req.body;
  const [row] = await db
    .insert(chapters)
    .values({
      projectId: req.params.projectId,
      title,
      content,
      summary,
      sortOrder,
      metadata,
    })
    .returning();
  res.status(201).json(row);
});

// Update chapter
router.patch("/:id", async (req: Request<ItemParams>, res) => {
  const { title, content, summary, sortOrder, metadata } = req.body;
  const [row] = await db
    .update(chapters)
    .set({ title, content, summary, sortOrder, metadata, updatedAt: new Date() })
    .where(and(eq(chapters.id, req.params.id), isNull(chapters.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "Chapter not found" });
  res.json(row);
});

// Soft delete chapter
router.delete("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .update(chapters)
    .set({ deletedAt: new Date() })
    .where(and(eq(chapters.id, req.params.id), isNull(chapters.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "Chapter not found" });
  res.json({ deleted: true });
});

export default router;
