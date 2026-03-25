import { pgTable, serial, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const userProfileTable = pgTable("user_profile", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().default("User"),
  age: integer("age").notNull().default(30),
  gender: text("gender").notNull().default("male"),
  weight: real("weight").notNull().default(70),
  height: real("height").notNull().default(170),
  existingConditions: text("existing_conditions").notNull().default("[]"),
  familyHistory: text("family_history").notNull().default("[]"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserProfileSchema = createInsertSchema(userProfileTable).omit({ id: true, createdAt: true });
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfileTable.$inferSelect;
