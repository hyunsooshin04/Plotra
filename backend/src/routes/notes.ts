import { Router, type Request } from "express";
import { eq, isNull, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { notes } from "../db/schema/index.js";

type ProjectParams = { projectId: string };
type ItemParams = { projectId: string; id: string };

const router = Router({ mergeParams: true });

// List notes for a project
router.get("/", async (req: Request<ProjectParams>, res) => {
  const rows = await db
    .select()
    .from(notes)
    .where(
      and(
        eq(notes.projectId, req.params.projectId),
        isNull(notes.deletedAt),
      ),
    )
    .orderBy(notes.createdAt);
  res.json(rows);
});

// Get single note
router.get("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, req.params.id), isNull(notes.deletedAt)));
  if (!row) return res.status(404).json({ error: "Note not found" });
  res.json(row);
});

// Create note
router.post("/", async (req: Request<ProjectParams>, res) => {
  const { title, content, metadata } = req.body;
  const [row] = await db
    .insert(notes)
    .values({ projectId: req.params.projectId, title, content, metadata })
    .returning();
  res.status(201).json(row);
});

// Update note
router.patch("/:id", async (req: Request<ItemParams>, res) => {
  const { title, content, metadata } = req.body;
  const [row] = await db
    .update(notes)
    .set({ title, content, metadata, updatedAt: new Date() })
    .where(and(eq(notes.id, req.params.id), isNull(notes.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "Note not found" });
  res.json(row);
});

// Soft delete note
router.delete("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .update(notes)
    .set({ deletedAt: new Date() })
    .where(and(eq(notes.id, req.params.id), isNull(notes.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "Note not found" });
  res.json({ deleted: true });
});

export default router;
