import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStorageUnitSchema, insertItemSchema, insertActivitySchema } from "@shared/schema";
import { analyzeStoragePhoto, generateItemSummary } from "./services/openai";
import { generateQRCode, validateQRCode, generateStorageUnitName } from "./services/qr";
import multer from "multer";
import { z } from "zod";

// Configure multer for photo uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Storage Units routes
  app.get("/api/storage-units", async (req, res) => {
    try {
      const units = await storage.getStorageUnits();
      res.json(units);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch storage units" });
    }
  });

  app.get("/api/storage-units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const unit = await storage.getStorageUnit(id);
      if (!unit) {
        return res.status(404).json({ message: "Storage unit not found" });
      }
      res.json(unit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch storage unit" });
    }
  });

  app.get("/api/storage-units/qr/:qrCode", async (req, res) => {
    try {
      const qrCode = req.params.qrCode;
      if (!validateQRCode(qrCode)) {
        return res.status(400).json({ message: "Invalid QR code format" });
      }
      
      const unit = await storage.getStorageUnitByQrCode(qrCode);
      if (!unit) {
        return res.status(404).json({ message: "Storage unit not found" });
      }
      res.json(unit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch storage unit" });
    }
  });

  app.post("/api/storage-units", async (req, res) => {
    try {
      const data = insertStorageUnitSchema.parse(req.body);
      
      // Generate QR code if not provided
      if (!data.qrCode) {
        data.qrCode = generateQRCode();
      }
      
      // Generate name if not provided
      if (!data.name && data.location) {
        data.name = generateStorageUnitName(data.location, data.qrCode);
      }
      
      const unit = await storage.createStorageUnit(data);
      
      // Log activity
      await storage.createActivity({
        type: "create_unit",
        description: `Created storage unit: ${unit.name}`,
        storageUnitId: unit.id,
      });
      
      res.status(201).json(unit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create storage unit" });
    }
  });

  app.put("/api/storage-units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertStorageUnitSchema.partial().parse(req.body);
      
      const unit = await storage.updateStorageUnit(id, data);
      if (!unit) {
        return res.status(404).json({ message: "Storage unit not found" });
      }
      
      res.json(unit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update storage unit" });
    }
  });

  app.delete("/api/storage-units/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStorageUnit(id);
      if (!success) {
        return res.status(404).json({ message: "Storage unit not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete storage unit" });
    }
  });

  // Items routes
  app.get("/api/items", async (req, res) => {
    try {
      const { search, storageUnitId } = req.query;
      
      let items;
      if (search) {
        items = await storage.searchItems(search as string);
      } else if (storageUnitId) {
        items = await storage.getItemsByStorageUnit(parseInt(storageUnitId as string));
      } else {
        items = await storage.getItems();
      }
      
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const item = await storage.getItem(id);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch item" });
    }
  });

  app.post("/api/items", async (req, res) => {
    try {
      const data = insertItemSchema.parse(req.body);
      const item = await storage.createItem(data);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create item" });
    }
  });

  app.put("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const data = insertItemSchema.partial().parse(req.body);
      
      const item = await storage.updateItem(id, data);
      if (!item) {
        return res.status(404).json({ message: "Item not found" });
      }
      
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update item" });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteItem(id);
      if (!success) {
        return res.status(404).json({ message: "Item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  // AI Photo Analysis route
  app.post("/api/analyze-photos", upload.array('photos', 10), async (req, res) => {
    try {
      const { storageUnitId } = req.body;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No photos provided" });
      }
      
      if (!storageUnitId) {
        return res.status(400).json({ message: "Storage unit ID is required" });
      }
      
      const unitId = parseInt(storageUnitId);
      const unit = await storage.getStorageUnit(unitId);
      if (!unit) {
        return res.status(404).json({ message: "Storage unit not found" });
      }
      
      // Update storage unit status to "updating"
      await storage.updateStorageUnit(unitId, { status: "updating" });
      
      // ⚡ Bolt: Parallelize photo analysis
      // Process all photos concurrently instead of sequentially
      const analysisPromises = files.map(async (file) => {
        const base64Image = file.buffer.toString('base64');
        try {
          return await analyzeStoragePhoto(base64Image);
        } catch (error) {
          console.error("Failed to analyze photo:", error);
          // Return empty array to continue with other photos even if one fails
          return [];
        }
      });

      const results = await Promise.all(analysisPromises);
      const allAnalyzedItems = results.flat();
      
      if (allAnalyzedItems.length === 0) {
        await storage.updateStorageUnit(unitId, { status: "active" });
        return res.status(400).json({ message: "No items could be identified in the photos" });
      }
      
      // Create items in database
      const itemsToCreate = allAnalyzedItems.map(item => ({
        name: item.name,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        storageUnitId: unitId,
        aiConfidence: item.confidence,
      }));
      
      const createdItems = await storage.createItems(itemsToCreate);
      
      // Generate summary
      const summary = await generateItemSummary(allAnalyzedItems);
      
      // Log activity
      await storage.createActivity({
        type: "add_items",
        description: `AI analyzed photos and added ${createdItems.length} items`,
        storageUnitId: unitId,
        metadata: {
          itemCount: createdItems.length,
          summary: summary,
          photosAnalyzed: files.length,
        },
      });
      
      // Update storage unit status back to active
      await storage.updateStorageUnit(unitId, { status: "active" });
      
      res.json({
        success: true,
        itemsAdded: createdItems.length,
        items: createdItems,
        summary: summary,
      });
      
    } catch (error) {
      console.error("Photo analysis error:", error);
      res.status(500).json({ 
        message: "Failed to analyze photos", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Activities routes
  app.get("/api/activities", async (req, res) => {
    try {
      const { limit, storageUnitId } = req.query;
      
      let activities;
      if (storageUnitId) {
        activities = await storage.getActivitiesByStorageUnit(parseInt(storageUnitId as string));
      } else {
        activities = await storage.getActivities(limit ? parseInt(limit as string) : undefined);
      }
      
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Stats route
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // QR Code generation route
  app.post("/api/generate-qr", async (req, res) => {
    try {
      const qrCode = generateQRCode();
      res.json({ qrCode });
    } catch (error) {
      res.status(500).json({ message: "Failed to generate QR code" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
