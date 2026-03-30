import { Router, type Request } from "express";
import { eq, isNull, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { glossary } from "../db/schema/index.js";

type ProjectParams = { projectId: string };
type ItemParams = { projectId: string; id: string };

const router = Router({ mergeParams: true });

// List glossary entries for a project
router.get("/", async (req: Request<ProjectParams>, res) => {
  const rows = await db
    .select()
    .from(glossary)
    .where(
      and(
        eq(glossary.projectId, req.params.projectId),
        isNull(glossary.deletedAt),
      ),
    )
    .orderBy(glossary.term);
  res.json(rows);
});

// Get single glossary entry
router.get("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .select()
    .from(glossary)
    .where(and(eq(glossary.id, req.params.id), isNull(glossary.deletedAt)));
  if (!row) return res.status(404).json({ error: "Glossary entry not found" });
  res.json(row);
});

// Create glossary entry
router.post("/", async (req: Request<ProjectParams>, res) => {
  const { term, definition, tags, metadata } = req.body;
  const [row] = await db
    .insert(glossary)
    .values({ projectId: req.params.projectId, term, definition, tags, metadata })
    .returning();
  res.status(201).json(row);
});

// Update glossary entry
router.patch("/:id", async (req: Request<ItemParams>, res) => {
  const { term, definition, tags, metadata } = req.body;
  const [row] = await db
    .update(glossary)
    .set({ term, definition, tags, metadata, updatedAt: new Date() })
    .where(and(eq(glossary.id, req.params.id), isNull(glossary.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "Glossary entry not found" });
  res.json(row);
});

// Soft delete glossary entry
router.delete("/:id", async (req: Request<ItemParams>, res) => {
  const [row] = await db
    .update(glossary)
    .set({ deletedAt: new Date() })
    .where(and(eq(glossary.id, req.params.id), isNull(glossary.deletedAt)))
    .returning();
  if (!row) return res.status(404).json({ error: "Glossary entry not found" });
  res.json({ deleted: true });
});

export default router;
