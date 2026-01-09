import { pgTable, text, serial, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const storageUnits = pgTable("storage_units", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  qrCode: text("qr_code").notNull().unique(),
  description: text("description"),
  status: text("status").notNull().default("active"), // active, updating, inactive
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const items = pgTable("items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"),
  quantity: integer("quantity").default(1).notNull(),
  storageUnitId: integer("storage_unit_id").references(() => storageUnits.id).notNull(),
  aiConfidence: integer("ai_confidence"), // 0-100 confidence score from AI
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  storageUnitIdIdx: index("items_storage_unit_id_idx").on(table.storageUnitId),
}));

export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // scan, add_items, update_items, create_unit
  description: text("description").notNull(),
  storageUnitId: integer("storage_unit_id").references(() => storageUnits.id),
  metadata: jsonb("metadata"), // additional data like item count, AI results
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  storageUnitIdIdx: index("activities_storage_unit_id_idx").on(table.storageUnitId),
}));

export const storageUnitsRelations = relations(storageUnits, ({ many }) => ({
  items: many(items),
  activities: many(activities),
}));

export const itemsRelations = relations(items, ({ one }) => ({
  storageUnit: one(storageUnits, {
    fields: [items.storageUnitId],
    references: [storageUnits.id],
  }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  storageUnit: one(storageUnits, {
    fields: [activities.storageUnitId],
    references: [storageUnits.id],
  }),
}));

export const insertStorageUnitSchema = createInsertSchema(storageUnits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertItemSchema = createInsertSchema(items).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export type StorageUnit = typeof storageUnits.$inferSelect;
export type Item = typeof items.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type InsertStorageUnit = z.infer<typeof insertStorageUnitSchema>;
export type InsertItem = z.infer<typeof insertItemSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
