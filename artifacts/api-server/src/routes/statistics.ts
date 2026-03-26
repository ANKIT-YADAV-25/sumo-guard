import { Router, type IRouter } from "express";
import { db, sleepLogsTable, habitLogsTable } from "@workspace/db";
import { desc, gte, lte, and } from "drizzle-orm";
import { format, subDays, subMonths, subYears, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, startOfWeek, endOfWeek } from "date-fns";

const router: IRouter = Router();

function formatSleepLog(log: typeof sleepLogsTable.$inferSelect) {
  return { ...log, createdAt: log.createdAt.toISOString() };
}
function formatHabitLog(log: typeof habitLogsTable.$inferSelect) {
  return { ...log, createdAt: log.createdAt.toISOString() };
}

router.get("/statistics", async (req, res) => {
  try {
    const period = (req.query.period as string) || "month";
    const refDateStr = (req.query.date as string) || format(new Date(), "yyyy-MM-dd");
    const refDate = new Date(refDateStr + "T12:00:00Z");

    let fromDate: Date;
    let toDate = refDate;

    if (period === "day") {
      fromDate = subDays(refDate, 6);
    } else if (period === "week") {
      fromDate = subDays(refDate, 27);
    } else if (period === "year") {
      fromDate = subYears(refDate, 1);
    } else {
      fromDate = subMonths(refDate, 1);
    }

    const fromStr = format(fromDate, "yyyy-MM-dd");
    const toStr = format(toDate, "yyyy-MM-dd");

    const [sleepLogs, habitLogs] = await Promise.all([
      db.select().from(sleepLogsTable)
        .where(and(gte(sleepLogsTable.date, fromStr), lte(sleepLogsTable.date, toStr)))
        .orderBy(sleepLogsTable.date),
      db.select().from(habitLogsTable)
        .where(and(gte(habitLogsTable.date, fromStr), lte(habitLogsTable.date, toStr)))
        .orderBy(habitLogsTable.date),
    ]);

    // Build sleep data points
    const sleepMap = new Map(sleepLogs.map(l => [l.date, l]));
    const habitMap = new Map(habitLogs.map(l => [l.date, l]));

    // Generate date range
    const days = eachDayOfInterval({ start: fromDate, end: toDate });

    const sleepData = days.map(d => {
      const dateStr = format(d, "yyyy-MM-dd");
      const log = sleepMap.get(dateStr);
      const label = period === "year"
        ? format(d, "MMM")
        : period === "week" || period === "month"
          ? format(d, "d MMM")
          : format(d, "EEE");
      return {
        label,
        date: dateStr,
        hours: log?.durationHours ?? 0,
        quality: log?.quality ?? "none",
        bedtime: log ? format(new Date(log.bedtime), "HH:mm") : "--:--",
        wakeTime: log ? format(new Date(log.wakeTime), "HH:mm") : "--:--",
      };
    });

    // For year period, group by month
    let finalSleepData = sleepData;
    if (period === "year") {
      const monthMap = new Map<string, { hours: number[]; quality: string[]; label: string; date: string }>();
      for (const point of sleepData) {
        const monthKey = point.date.slice(0, 7);
        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, { hours: [], quality: [], label: point.label, date: point.date });
        }
        if (point.hours > 0) monthMap.get(monthKey)!.hours.push(point.hours);
        if (point.quality !== "none") monthMap.get(monthKey)!.quality.push(point.quality);
      }
      finalSleepData = Array.from(monthMap.values()).map(m => ({
        label: m.label,
        date: m.date,
        hours: m.hours.length > 0 ? Math.round((m.hours.reduce((a, b) => a + b, 0) / m.hours.length) * 10) / 10 : 0,
        quality: m.quality.length > 0 ? m.quality[Math.floor(m.quality.length / 2)] : "none",
        bedtime: "--:--",
        wakeTime: "--:--",
      }));
    }

    const habitData = days.map(d => {
      const dateStr = format(d, "yyyy-MM-dd");
      const log = habitMap.get(dateStr);
      const label = period === "year"
        ? format(d, "MMM")
        : period === "week" || period === "month"
          ? format(d, "d MMM")
          : format(d, "EEE");
      return {
        label,
        date: dateStr,
        exerciseMinutes: log?.exerciseMinutes ?? 0,
        waterGlasses: log?.waterGlasses ?? 0,
        stressLevel: log?.stressLevel ?? 0,
        smokingCigarettes: log?.smokingCigarettes ?? 0,
        alcoholDrinks: log?.alcoholDrinks ?? 0,
        meditationMinutes: log?.meditationMinutes ?? 0,
      };
    });

    // Averages
    const activeSleepLogs = sleepLogs.filter(l => l.durationHours > 0);
    const activeHabitLogs = habitLogs;
    const avgSleepHours = activeSleepLogs.length > 0
      ? Math.round((activeSleepLogs.reduce((s, l) => s + l.durationHours, 0) / activeSleepLogs.length) * 10) / 10 : 0;
    const avgExerciseMinutes = activeHabitLogs.length > 0
      ? Math.round(activeHabitLogs.reduce((s, l) => s + l.exerciseMinutes, 0) / activeHabitLogs.length) : 0;
    const avgStressLevel = activeHabitLogs.length > 0
      ? Math.round((activeHabitLogs.reduce((s, l) => s + l.stressLevel, 0) / activeHabitLogs.length) * 10) / 10 : 0;
    const avgWaterGlasses = activeHabitLogs.length > 0
      ? Math.round((activeHabitLogs.reduce((s, l) => s + l.waterGlasses, 0) / activeHabitLogs.length) * 10) / 10 : 0;
    const avgSmoking = activeHabitLogs.length > 0
      ? Math.round((activeHabitLogs.reduce((s, l) => s + l.smokingCigarettes, 0) / activeHabitLogs.length) * 10) / 10 : 0;
    const avgAlcohol = activeHabitLogs.length > 0
      ? Math.round((activeHabitLogs.reduce((s, l) => s + l.alcoholDrinks, 0) / activeHabitLogs.length) * 10) / 10 : 0;

    const qualityDist = { poor: 0, fair: 0, good: 0, excellent: 0 };
    for (const l of sleepLogs) {
      if (l.quality in qualityDist) qualityDist[l.quality as keyof typeof qualityDist]++;
    }

    // Monthly review — group into weeks
    const monthStart = startOfMonth(refDate);
    const monthEnd = endOfMonth(refDate);
    const monthSleepLogs = await db.select().from(sleepLogsTable)
      .where(and(gte(sleepLogsTable.date, format(monthStart, "yyyy-MM-dd")), lte(sleepLogsTable.date, format(monthEnd, "yyyy-MM-dd"))))
      .orderBy(sleepLogsTable.date);
    const monthHabitLogs = await db.select().from(habitLogsTable)
      .where(and(gte(habitLogsTable.date, format(monthStart, "yyyy-MM-dd")), lte(habitLogsTable.date, format(monthEnd, "yyyy-MM-dd"))))
      .orderBy(habitLogsTable.date);

    const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd });
    const monthlyReview = weeks.map((weekStart, i) => {
      const weekEnd = endOfWeek(weekStart);
      const wStart = format(weekStart, "yyyy-MM-dd");
      const wEnd = format(weekEnd, "yyyy-MM-dd");
      const wSleep = monthSleepLogs.filter(l => l.date >= wStart && l.date <= wEnd);
      const wHabit = monthHabitLogs.filter(l => l.date >= wStart && l.date <= wEnd);
      return {
        week: `Week ${i + 1}`,
        avgSleep: wSleep.length > 0 ? Math.round((wSleep.reduce((s, l) => s + l.durationHours, 0) / wSleep.length) * 10) / 10 : 0,
        avgStress: wHabit.length > 0 ? Math.round((wHabit.reduce((s, l) => s + l.stressLevel, 0) / wHabit.length) * 10) / 10 : 0,
        avgExercise: wHabit.length > 0 ? Math.round(wHabit.reduce((s, l) => s + l.exerciseMinutes, 0) / wHabit.length) : 0,
      };
    });

    res.json({
      period,
      sleepData: finalSleepData,
      habitData,
      averages: {
        avgSleepHours,
        avgExerciseMinutes,
        avgStressLevel,
        avgWaterGlasses,
        avgSmoking,
        avgAlcohol,
        sleepQualityDistribution: qualityDist,
      },
      monthlyReview,
    });
  } catch (err) {
    req.log.error({ err }, "Statistics failed");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
