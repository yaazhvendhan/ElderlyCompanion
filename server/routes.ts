import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserProfileSchema, insertReminderSchema, insertMemorySchema, 
  insertChatMessageSchema, insertEmergencyContactSchema, insertMedicationSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // User Profile
  app.get("/api/profile", async (req, res) => {
    try {
      const profile = await storage.getUserProfile();
      res.json(profile);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", async (req, res) => {
    try {
      const validatedData = insertUserProfileSchema.parse(req.body);
      const profile = await storage.createUserProfile(validatedData);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Invalid profile data" });
    }
  });

  app.patch("/api/profile/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const profile = await storage.updateUserProfile(id, req.body);
      res.json(profile);
    } catch (error) {
      res.status(400).json({ message: "Failed to update profile" });
    }
  });

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
          "I'm here to listen. Tell me more about what's on your mind.",
          "Your well-being is important to me. How can I assist you today?",
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

  app.delete("/api/chat", async (req, res) => {
    try {
      await storage.clearChatHistory();
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to clear chat history" });
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

  app.post("/api/emergency-contacts", async (req, res) => {
    try {
      const validatedData = insertEmergencyContactSchema.parse(req.body);
      const contact = await storage.createEmergencyContact(validatedData);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Invalid emergency contact data" });
    }
  });

  app.patch("/api/emergency-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contact = await storage.updateEmergencyContact(id, req.body);
      res.json(contact);
    } catch (error) {
      res.status(400).json({ message: "Failed to update emergency contact" });
    }
  });

  app.delete("/api/emergency-contacts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteEmergencyContact(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete emergency contact" });
    }
  });

  // Medications
  app.get("/api/medications", async (req, res) => {
    try {
      const medications = await storage.getMedications();
      res.json(medications);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medications" });
    }
  });

  app.post("/api/medications", async (req, res) => {
    try {
      const validatedData = insertMedicationSchema.parse(req.body);
      const medication = await storage.createMedication(validatedData);
      res.json(medication);
    } catch (error) {
      res.status(400).json({ message: "Invalid medication data" });
    }
  });

  app.patch("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const medication = await storage.updateMedication(id, req.body);
      res.json(medication);
    } catch (error) {
      res.status(400).json({ message: "Failed to update medication" });
    }
  });

  app.delete("/api/medications/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMedication(id);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete medication" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
