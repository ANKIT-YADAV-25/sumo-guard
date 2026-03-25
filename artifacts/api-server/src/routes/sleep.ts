import { Router, type IRouter } from "express";
import { db, sleepLogsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { CreateSleepLogBody, DeleteSleepLogParams } from "@workspace/api-zod";

const router: IRouter = Router();

function calcDuration(bedtime: string, wakeTime: string): number {
  const bed = new Date(bedtime).getTime();
  const wake = new Date(wakeTime).getTime();
  let diff = wake - bed;
  if (diff < 0) diff += 24 * 60 * 60 * 1000;
  return Math.round((diff / (1000 * 60 * 60)) * 10) / 10;
}

function formatLog(log: typeof sleepLogsTable.$inferSelect) {
  return {
    ...log,
    createdAt: log.createdAt.toISOString(),
  };
}

router.get("/sleep", async (req, res) => {
  try {
    const logs = await db.select().from(sleepLogsTable).orderBy(desc(sleepLogsTable.createdAt)).limit(50);
    res.json(logs.map(formatLog));
  } catch (err) {
    req.log.error({ err }, "Failed to get sleep logs");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/sleep", async (req, res) => {
  try {
    const body = CreateSleepLogBody.parse(req.body);
    const durationHours = calcDuration(body.bedtime, body.wakeTime);
    const [log] = await db.insert(sleepLogsTable).values({
      bedtime: body.bedtime,
      wakeTime: body.wakeTime,
      durationHours,
      quality: body.quality,
      notes: body.notes ?? null,
      date: body.date,
    }).returning();
    res.status(201).json(formatLog(log));
  } catch (err) {
    req.log.error({ err }, "Failed to create sleep log");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/sleep/:id", async (req, res) => {
  try {
    const { id } = DeleteSleepLogParams.parse({ id: req.params.id });
    await db.delete(sleepLogsTable).where(eq(sleepLogsTable.id, id));
    res.json({ success: true, message: "Sleep log deleted" });
  } catch (err) {
    req.log.error({ err }, "Failed to delete sleep log");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
