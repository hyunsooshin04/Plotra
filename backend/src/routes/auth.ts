import { Router } from "express";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { db } from "../db/index.js";
import { users } from "../db/schema/index.js";
import { createEncryptedToken } from "../lib/token.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// Register
router.post("/register", async (req, res) => {
  const { email, password, nickname } = req.body;

  if (!email || !password || !nickname) {
    res.status(400).json({ error: "email, password, nickname are required" });
    return;
  }

  const [existing] = await db.select().from(users).where(eq(users.email, email));
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const [user] = await db
    .insert(users)
    .values({ email, password: hashedPassword, nickname })
    .returning({ id: users.id, email: users.email, nickname: users.nickname, createdAt: users.createdAt });

  const token = createEncryptedToken({ userId: user.id, email: user.email });

  res.status(201).json({ user, token });
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  const [user] = await db.select().from(users).where(eq(users.email, email));
  if (!user) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const token = createEncryptedToken({ userId: user.id, email: user.email });

  res.json({
    user: { id: user.id, email: user.email, nickname: user.nickname },
    token,
  });
});

// Get current user (protected)
router.get("/me", requireAuth, async (req, res) => {
  const [user] = await db
    .select({ id: users.id, email: users.email, nickname: users.nickname, createdAt: users.createdAt })
    .from(users)
    .where(eq(users.id, req.user!.userId));

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(user);
});

export default router;
