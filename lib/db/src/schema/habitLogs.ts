import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const habitLogsTable = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  exerciseMinutes: integer("exercise_minutes").notNull().default(0),
  waterGlasses: integer("water_glasses").notNull().default(0),
  fruitVeggieServings: integer("fruit_veggie_servings").notNull().default(0),
  screenTimeHours: real("screen_time_hours").notNull().default(0),
  stressLevel: integer("stress_level").notNull().default(5),
  smokingCigarettes: integer("smoking_cigarettes").notNull().default(0),
  alcoholDrinks: integer("alcohol_drinks").notNull().default(0),
  meditationMinutes: integer("meditation_minutes").notNull().default(0),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertHabitLogSchema = createInsertSchema(habitLogsTable).omit({ id: true, createdAt: true });
export type InsertHabitLog = z.infer<typeof insertHabitLogSchema>;
export type HabitLog = typeof habitLogsTable.$inferSelect;
