import { Router, type IRouter } from "express";
import { db, habitLogsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { CreateHabitLogBody, DeleteHabitLogParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatLog(log: typeof habitLogsTable.$inferSelect) {
  return {
    ...log,
    createdAt: log.createdAt.toISOString(),
  };
}

router.get("/habits", async (req, res) => {
  try {
    const logs = await db.select().from(habitLogsTable).orderBy(desc(habitLogsTable.createdAt)).limit(50);
    res.json(logs.map(formatLog));
  } catch (err) {
    req.log.error({ err }, "Failed to get habit logs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/habits", async (req, res) => {
  try {
    const body = CreateHabitLogBody.parse(req.body);
    const [log] = await db.insert(habitLogsTable).values({
      date: body.date,
      exerciseMinutes: body.exerciseMinutes,
      waterGlasses: body.waterGlasses,
      fruitVeggieServings: body.fruitVeggieServings,
      screenTimeHours: body.screenTimeHours,
      stressLevel: body.stressLevel,
      smokingCigarettes: body.smokingCigarettes,
      alcoholDrinks: body.alcoholDrinks,
      meditationMinutes: body.meditationMinutes,
      notes: body.notes ?? null,
    }).returning();
    res.status(201).json(formatLog(log));
  } catch (err) {
    req.log.error({ err }, "Failed to create habit log");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/habits/:id", async (req, res) => {
  try {
    const { id } = DeleteHabitLogParams.parse({ id: req.params.id });
    await db.delete(habitLogsTable).where(eq(habitLogsTable.id, id));
    res.json({ success: true, message: "Habit log deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete habit log");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
