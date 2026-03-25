import { Router, type IRouter } from "express";
import { db, userProfileTable } from "@workspace/db";
import { UpdateProfileBody } from "@workspace/api-zod";

const router: IRouter = Router();

function formatProfile(profile: typeof userProfileTable.$inferSelect) {
  return {
    ...profile,
    existingConditions: JSON.parse(profile.existingConditions || "[]"),
    familyHistory: JSON.parse(profile.familyHistory || "[]"),
    createdAt: profile.createdAt.toISOString(),
  };
}

async function getOrCreateProfile() {
  const profiles = await db.select().from(userProfileTable).limit(1);
  if (profiles.length > 0) return profiles[0];
  const [profile] = await db.insert(userProfileTable).values({
    name: "User",
    age: 30,
    gender: "male",
    weight: 70,
    height: 170,
    existingConditions: "[]",
    familyHistory: "[]",
  }).returning();
  return profile;
}

router.get("/profile", async (req, res) => {
  try {
    const profile = await getOrCreateProfile();
    res.json(formatProfile(profile));
  } catch (err) {
    req.log.error({ err }, "Failed to get profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const body = UpdateProfileBody.parse(req.body);
    const existing = await getOrCreateProfile();
    const [updated] = await db.update(userProfileTable)
      .set({
        name: body.name,
        age: body.age,
        gender: body.gender,
        weight: body.weight,
        height: body.height,
        existingConditions: JSON.stringify(body.existingConditions),
        familyHistory: JSON.stringify(body.familyHistory),
      })
      .returning();
    res.json(formatProfile(updated));
  } catch (err) {
    req.log.error({ err }, "Failed to update profile");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
