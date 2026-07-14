import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const chatRoomsTable = pgTable("chat_rooms", {
  id: serial("id").primaryKey(),
  nickname: text("nickname").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const chatMessagesTable = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  roomId: serial("room_id").notNull().references(() => chatRoomsTable.id),
  sender: text("sender").notNull(),
  text: text("text").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertChatRoomSchema = createInsertSchema(chatRoomsTable).omit({ id: true, createdAt: true });
export type InsertChatRoom = z.infer<typeof insertChatRoomSchema>;
export type ChatRoom = typeof chatRoomsTable.$inferSelect;

export const insertChatMessageSchema = createInsertSchema(chatMessagesTable).omit({ id: true, createdAt: true });
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessagesTable.$inferSelect;
