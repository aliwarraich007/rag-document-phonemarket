import { pgTable, text, jsonb, timestamp, vector } from "drizzle-orm/pg-core";

export const documentChunks = pgTable("document_chunk", {
  id: text("id").primaryKey(),
  content: text("content").notNull(),
  embedding: vector("embedding", {
    dimensions: 1536,
  }).notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at", {
    withTimezone: false,
  })
    .defaultNow()
    .notNull(),
});
