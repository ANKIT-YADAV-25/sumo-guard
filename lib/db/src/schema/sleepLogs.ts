import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sleepLogsTable = pgTable("sleep_logs", {
  id: serial("id").primaryKey(),
  bedtime: text("bedtime").notNull(),
  wakeTime: text("wake_time").notNull(),
  durationHours: real("duration_hours").notNull(),
  quality: text("quality").notNull(),
  notes: text("notes"),
  date: text("date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSleepLogSchema = createInsertSchema(sleepLogsTable).omit({ id: true, createdAt: true, durationHours: true });
export type InsertSleepLog = z.infer<typeof insertSleepLogSchema>;
export type SleepLog = typeof sleepLogsTable.$inferSelect;
