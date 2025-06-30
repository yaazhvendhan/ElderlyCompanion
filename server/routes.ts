import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertReminderSchema, insertMemorySchema, insertChatMessageSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Reminders
  app.get("/api/reminders", async (req, res) => {
    try {
      const reminders = await storage.getReminders();
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.get("/api/reminders/today", async (req, res) => {
    try {
      const reminders = await storage.getTodayReminders();
      res.json(reminders);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch today's reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    try {
      const validatedData = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(validatedData);
      res.json(reminder);
    } catch (error) {
      res.status(400).json({ message: "Invalid reminder data" });
    }
  });

  app.patch("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const reminder = await storage.updateReminder(id, req.body);
      res.json(reminder);
    } catch (error) {
      res.status(400).json({ message: "Failed to update reminder" });
    }
  });

  app.delete("/api/reminders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReminder(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete reminder" });
    }
  });

  // Memories
  app.get("/api/memories", async (req, res) => {
    try {
      const memories = await storage.getMemories();
      res.json(memories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch memories" });
    }
  });

  app.post("/api/memories", async (req, res) => {
    try {
      const validatedData = insertMemorySchema.parse(req.body);
      const memory = await storage.createMemory(validatedData);
      res.json(memory);
    } catch (error) {
      res.status(400).json({ message: "Invalid memory data" });
    }
  });

  app.delete("/api/memories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMemory(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete memory" });
    }
  });

  // Chat Messages
  app.get("/api/chat", async (req, res) => {
    try {
      const messages = await storage.getChatMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch chat messages" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      
      // Auto-respond with assistant message
      if (validatedData.isFromUser) {
        const responses = [
          "That's wonderful to hear! How are you feeling today?",
          "Thank you for sharing that with me. Is there anything I can help you with?",
          "I appreciate you telling me that. Would you like to hear a motivational quote?",
          "That sounds lovely! Remember to take care of yourself today.",
        ];
        const response = responses[Math.floor(Math.random() * responses.length)];
        
        const assistantMessage = await storage.createChatMessage({
          content: response,
          isFromUser: false,
        });
        
        res.json([message, assistantMessage]);
      } else {
        res.json([message]);
      }
    } catch (error) {
      res.status(400).json({ message: "Invalid message data" });
    }
  });

  // Emergency Contacts
  app.get("/api/emergency-contacts", async (req, res) => {
    try {
      const contacts = await storage.getEmergencyContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch emergency contacts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
