import { Router } from "express";
import { eq, isNull, and } from "drizzle-orm";
import { db } from "../db/index.js";
import { projects } from "../db/schema/index.js";

const router = Router();

// List all projects (for current user)
router.get("/", async (req, res) => {
  const rows = await db
    .select()
    .from(projects)
    .where(and(eq(projects.userId, req.user!.userId), isNull(projects.deletedAt)))
    .orderBy(projects.createdAt);
  res.json(rows);
});

// Get single project
router.get("/:id", async (req, res) => {
  const [row] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.id, req.params.id),
        eq(projects.userId, req.user!.userId),
        isNull(projects.deletedAt),
      ),
    );
  if (!row) return res.status(404).json({ error: "Project not found" });
  res.json(row);
});

// Create project
router.post("/", async (req, res) => {
  const { title, description, genre, settings } = req.body;
  const [row] = await db
    .insert(projects)
    .values({ userId: req.user!.userId, title, description, genre, settings })
    .returning();
  res.status(201).json(row);
});

// Update project
router.patch("/:id", async (req, res) => {
  const { title, description, genre, settings } = req.body;
  const [row] = await db
    .update(projects)
    .set({ title, description, genre, settings, updatedAt: new Date() })
    .where(
      and(
        eq(projects.id, req.params.id),
        eq(projects.userId, req.user!.userId),
        isNull(projects.deletedAt),
      ),
    )
    .returning();
  if (!row) return res.status(404).json({ error: "Project not found" });
  res.json(row);
});

// Soft delete project
router.delete("/:id", async (req, res) => {
  const [row] = await db
    .update(projects)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(projects.id, req.params.id),
        eq(projects.userId, req.user!.userId),
        isNull(projects.deletedAt),
      ),
    )
    .returning();
  if (!row) return res.status(404).json({ error: "Project not found" });
  res.json({ deleted: true });
});

export default router;
