import { pgTable, uuid, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";

export const meetings = pgTable("meetings", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  title: text("title").notNull().default("Untitled Meeting"),
  rawNotes: text("raw_notes").notNull().default(""),
  enhancedNotes: text("enhanced_notes"),
  transcript: text("transcript").notNull().default(""),
  durationSeconds: integer("duration_seconds").notNull().default(0),
  folder: text("folder"),
  isEnhanced: boolean("is_enhanced").notNull().default(false),
  shareToken: text("share_token").unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Chat messages persisted per user + scope
// meetingId = null  →  "All Meetings" scope
// meetingId = <id>  →  specific meeting scope
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  meetingId: uuid("meeting_id").references(() => meetings.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const searchLogs = pgTable("search_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  query: text("query").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export type Meeting = typeof meetings.$inferSelect;
export type NewMeeting = typeof meetings.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type SearchLog = typeof searchLogs.$inferSelect;
export type NewSearchLog = typeof searchLogs.$inferInsert;
