import { Router, type IRouter } from "express";
import { db, sleepLogsTable, habitLogsTable, userProfileTable } from "@workspace/db";
import { desc, eq, lte } from "drizzle-orm";
import { analyzePredictions } from "../lib/predictions.js";
import { format, subDays } from "date-fns";

const router: IRouter = Router();

router.get("/predictions", async (req, res) => {
  try {
    const [sleepLogs, habitLogs, profiles] = await Promise.all([
      db.select().from(sleepLogsTable).orderBy(desc(sleepLogsTable.createdAt)).limit(30),
      db.select().from(habitLogsTable).orderBy(desc(habitLogsTable.createdAt)).limit(30),
      db.select().from(userProfileTable).limit(1),
    ]);

    const profile = profiles[0] ?? {
      age: 30,
      gender: "male",
      weight: 70,
      height: 170,
      existingConditions: "[]",
      familyHistory: "[]",
    };

    const parsedProfile = {
      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,
      existingConditions: JSON.parse(profile.existingConditions || "[]"),
      familyHistory: JSON.parse(profile.familyHistory || "[]"),
    };

    const result = analyzePredictions(sleepLogs, habitLogs, parsedProfile);

    res.json({
      ...result,
      riskAssessmentDate: new Date().toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get predictions");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/dashboard", async (req, res) => {
  try {
    const selectedDate = (req.query.date as string) || format(new Date(), "yyyy-MM-dd");
    const trendFrom = format(subDays(new Date(selectedDate + "T12:00:00Z"), 13), "yyyy-MM-dd");

    const [sleepLogs, habitLogs, profiles] = await Promise.all([
      db.select().from(sleepLogsTable).orderBy(desc(sleepLogsTable.createdAt)).limit(30),
      db.select().from(habitLogsTable).orderBy(desc(habitLogsTable.createdAt)).limit(30),
      db.select().from(userProfileTable).limit(1),
    ]);

    const profile = profiles[0] ?? {
      age: 30,
      gender: "male",
      weight: 70,
      height: 170,
      existingConditions: "[]",
      familyHistory: "[]",
    };

    const parsedProfile = {
      age: profile.age,
      gender: profile.gender,
      weight: profile.weight,
      height: profile.height,
      existingConditions: JSON.parse(profile.existingConditions || "[]"),
      familyHistory: JSON.parse(profile.familyHistory || "[]"),
    };

    const result = analyzePredictions(sleepLogs, habitLogs, parsedProfile);

    const avgSleepHours = sleepLogs.length > 0
      ? Math.round((sleepLogs.reduce((s, l) => s + l.durationHours, 0) / sleepLogs.length) * 10) / 10
      : 0;

    const avgExerciseMinutes = habitLogs.length > 0
      ? Math.round(habitLogs.reduce((s, l) => s + l.exerciseMinutes, 0) / habitLogs.length)
      : 0;

    const avgStressLevel = habitLogs.length > 0
      ? Math.round((habitLogs.reduce((s, l) => s + l.stressLevel, 0) / habitLogs.length) * 10) / 10
      : 0;

    const avgWaterGlasses = habitLogs.length > 0
      ? Math.round((habitLogs.reduce((s, l) => s + l.waterGlasses, 0) / habitLogs.length) * 10) / 10
      : 0;

    // Trend: last 14 days from selected date
    const trendLogs = sleepLogs
      .filter(l => l.date >= trendFrom && l.date <= selectedDate)
      .sort((a, b) => a.date.localeCompare(b.date));

    const sleepTrend = trendLogs.map(l => ({
      date: l.date,
      hours: l.durationHours,
      quality: l.quality,
    }));

    const recentHabitLogs = habitLogs.slice(0, 7).map(l => ({
      ...l,
      createdAt: l.createdAt.toISOString(),
    }));

    // Selected date specific data
    const selectedDateSleep = sleepLogs.find(l => l.date === selectedDate);
    const selectedDateHabit = habitLogs.find(l => l.date === selectedDate);

    res.json({
      healthScore: result.overallHealthScore,
      avgSleepHours,
      avgExerciseMinutes,
      avgStressLevel,
      avgWaterGlasses,
      totalSleepLogs: sleepLogs.length,
      totalHabitLogs: habitLogs.length,
      topRisks: result.diseases.slice(0, 3),
      sleepTrend,
      recentLogs: recentHabitLogs,
      selectedDate,
      selectedDateSleep: selectedDateSleep
        ? { ...selectedDateSleep, createdAt: selectedDateSleep.createdAt.toISOString() }
        : null,
      selectedDateHabit: selectedDateHabit
        ? { ...selectedDateHabit, createdAt: selectedDateHabit.createdAt.toISOString() }
        : null,
    });
  } catch (err) {
    req.log.error({ err }, "Failed to get dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
