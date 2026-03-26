import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router: IRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "sumo-guard-secret-2024";

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    lifestyle: JSON.parse(user.lifestyle || "{}"),
    onboardingDone: user.onboardingDone === "true",
    createdAt: user.createdAt.toISOString(),
  };
}

function makeToken(userId: number) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

export function verifyToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number };
  } catch {
    return null;
  }
}

router.post("/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      passwordHash,
      lifestyle: "{}",
      onboardingDone: "false",
    }).returning();
    const token = makeToken(user.id);
    res.status(201).json({ token, user: formatUser(user) });
  } catch (err) {
    req.log.error({ err }, "Register failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = makeToken(user.id);
    res.json({ token, user: formatUser(user) });
  } catch (err) {
    req.log.error({ err }, "Login failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ success: true, message: "Logged out" });
});

router.get("/auth/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, payload.userId)).limit(1);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "Get me failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/auth/onboarding", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const token = authHeader.slice(7);
    const payload = verifyToken(token);
    if (!payload) return res.status(401).json({ error: "Invalid token" });

    const lifestyle = {
      isSmoker: req.body.isSmoker ?? false,
      isDrinker: req.body.isDrinker ?? false,
      isAlcoholic: req.body.isAlcoholic ?? false,
      hasChronicCondition: req.body.hasChronicCondition ?? false,
      chronicConditions: req.body.chronicConditions ?? [],
      activityLevel: req.body.activityLevel ?? "moderate",
      dietType: req.body.dietType ?? "standard",
    };

    const [updated] = await db.update(usersTable)
      .set({ lifestyle: JSON.stringify(lifestyle), onboardingDone: "true" })
      .where(eq(usersTable.id, payload.userId))
      .returning();

    res.json(formatUser(updated));
  } catch (err) {
    req.log.error({ err }, "Onboarding failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
