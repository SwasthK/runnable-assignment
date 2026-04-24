import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { TreeElementNode } from "@/types";

export const components = pgTable("components", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: text("source").notNull(),
  tree: jsonb("tree").$type<TreeElementNode | null>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
