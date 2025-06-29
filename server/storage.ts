import { 
  storageUnits, 
  items, 
  activities,
  type StorageUnit, 
  type Item, 
  type Activity,
  type InsertStorageUnit, 
  type InsertItem, 
  type InsertActivity 
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, ilike, or, sql } from "drizzle-orm";

export interface IStorage {
  // Storage Units
  getStorageUnit(id: number): Promise<StorageUnit | undefined>;
  getStorageUnitByQrCode(qrCode: string): Promise<StorageUnit | undefined>;
  getStorageUnits(): Promise<StorageUnit[]>;
  createStorageUnit(storageUnit: InsertStorageUnit): Promise<StorageUnit>;
  updateStorageUnit(id: number, updates: Partial<InsertStorageUnit>): Promise<StorageUnit | undefined>;
  deleteStorageUnit(id: number): Promise<boolean>;

  // Items
  getItem(id: number): Promise<Item | undefined>;
  getItemsByStorageUnit(storageUnitId: number): Promise<Item[]>;
  getItems(): Promise<Item[]>;
  searchItems(query: string): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  createItems(items: InsertItem[]): Promise<Item[]>;
  updateItem(id: number, updates: Partial<InsertItem>): Promise<Item | undefined>;
  deleteItem(id: number): Promise<boolean>;

  // Activities
  getActivities(limit?: number): Promise<Activity[]>;
  getActivitiesByStorageUnit(storageUnitId: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Stats
  getStats(): Promise<{
    totalStorageUnits: number;
    totalItems: number;
    lastActivity: Activity | null;
  }>;
}

export class DatabaseStorage implements IStorage {
  async getStorageUnit(id: number): Promise<StorageUnit | undefined> {
    const [storageUnit] = await db
      .select()
      .from(storageUnits)
      .where(eq(storageUnits.id, id));
    return storageUnit || undefined;
  }

  async getStorageUnitByQrCode(qrCode: string): Promise<StorageUnit | undefined> {
    const [storageUnit] = await db
      .select()
      .from(storageUnits)
      .where(eq(storageUnits.qrCode, qrCode));
    return storageUnit || undefined;
  }

  async getStorageUnits(): Promise<StorageUnit[]> {
    return await db
      .select()
      .from(storageUnits)
      .orderBy(desc(storageUnits.updatedAt));
  }

  async createStorageUnit(storageUnit: InsertStorageUnit): Promise<StorageUnit> {
    const [created] = await db
      .insert(storageUnits)
      .values({
        ...storageUnit,
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async updateStorageUnit(id: number, updates: Partial<InsertStorageUnit>): Promise<StorageUnit | undefined> {
    const [updated] = await db
      .update(storageUnits)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(storageUnits.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteStorageUnit(id: number): Promise<boolean> {
    const result = await db
      .delete(storageUnits)
      .where(eq(storageUnits.id, id));
    return result.rowCount > 0;
  }

  async getItem(id: number): Promise<Item | undefined> {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));
    return item || undefined;
  }

  async getItemsByStorageUnit(storageUnitId: number): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(eq(items.storageUnitId, storageUnitId))
      .orderBy(desc(items.createdAt));
  }

  async getItems(): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .orderBy(desc(items.createdAt));
  }

  async searchItems(query: string): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(
        or(
          ilike(items.name, `%${query}%`),
          ilike(items.description, `%${query}%`),
          ilike(items.category, `%${query}%`)
        )
      )
      .orderBy(desc(items.createdAt));
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [created] = await db
      .insert(items)
      .values({
        ...item,
        updatedAt: new Date(),
      })
      .returning();
    return created;
  }

  async createItems(itemsList: InsertItem[]): Promise<Item[]> {
    const created = await db
      .insert(items)
      .values(
        itemsList.map(item => ({
          ...item,
          updatedAt: new Date(),
        }))
      )
      .returning();
    return created;
  }

  async updateItem(id: number, updates: Partial<InsertItem>): Promise<Item | undefined> {
    const [updated] = await db
      .update(items)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteItem(id: number): Promise<boolean> {
    const result = await db
      .delete(items)
      .where(eq(items.id, id));
    return result.rowCount > 0;
  }

  async getActivities(limit = 50): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async getActivitiesByStorageUnit(storageUnitId: number): Promise<Activity[]> {
    return await db
      .select()
      .from(activities)
      .where(eq(activities.storageUnitId, storageUnitId))
      .orderBy(desc(activities.createdAt));
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [created] = await db
      .insert(activities)
      .values(activity)
      .returning();
    return created;
  }

  async getStats(): Promise<{
    totalStorageUnits: number;
    totalItems: number;
    lastActivity: Activity | null;
  }> {
    const [storageUnitCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(storageUnits);

    const [itemCount] = await db
      .select({ count: sql<number>`count(*)` })
      .from(items);

    const [lastActivity] = await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(1);

    return {
      totalStorageUnits: storageUnitCount.count,
      totalItems: itemCount.count,
      lastActivity: lastActivity || null,
    };
  }
}

export const storage = new DatabaseStorage();
