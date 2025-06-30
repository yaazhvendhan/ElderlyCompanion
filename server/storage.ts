import { 
  userProfiles, reminders, memories, chatMessages, emergencyContacts, medications,
  type UserProfile, type InsertUserProfile,
  type Reminder, type InsertReminder,
  type Memory, type InsertMemory,
  type ChatMessage, type InsertChatMessage,
  type EmergencyContact, type InsertEmergencyContact,
  type Medication, type InsertMedication
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User Profile
  getUserProfile(id?: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(id: number, profile: Partial<UserProfile>): Promise<UserProfile>;
  
  // Reminders
  getReminders(userId?: number): Promise<Reminder[]>;
  getTodayReminders(userId?: number): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder, userId?: number): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<Reminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;
  
  // Memories
  getMemories(userId?: number): Promise<Memory[]>;
  createMemory(memory: InsertMemory, userId?: number): Promise<Memory>;
  deleteMemory(id: number): Promise<void>;
  
  // Chat Messages
  getChatMessages(userId?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage, userId?: number): Promise<ChatMessage>;
  clearChatHistory(userId?: number): Promise<void>;
  
  // Emergency Contacts
  getEmergencyContacts(userId?: number): Promise<EmergencyContact[]>;
  createEmergencyContact(contact: InsertEmergencyContact, userId?: number): Promise<EmergencyContact>;
  updateEmergencyContact(id: number, contact: Partial<EmergencyContact>): Promise<EmergencyContact>;
  deleteEmergencyContact(id: number): Promise<void>;
  
  // Medications
  getMedications(userId?: number): Promise<Medication[]>;
  createMedication(medication: InsertMedication, userId?: number): Promise<Medication>;
  updateMedication(id: number, medication: Partial<Medication>): Promise<Medication>;
  deleteMedication(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  private defaultUserId = 1; // Default user for single-user mode

  // User Profile
  async getUserProfile(id = this.defaultUserId): Promise<UserProfile | undefined> {
    const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.id, id));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles).values(profile).returning();
    return newProfile;
  }

  async updateUserProfile(id: number, profile: Partial<UserProfile>): Promise<UserProfile> {
    const [updated] = await db.update(userProfiles)
      .set(profile)
      .where(eq(userProfiles.id, id))
      .returning();
    if (!updated) throw new Error("Profile not found");
    return updated;
  }

  // Reminders
  async getReminders(userId = this.defaultUserId): Promise<Reminder[]> {
    return await db.select().from(reminders)
      .where(eq(reminders.userId, userId))
      .orderBy(desc(reminders.createdAt));
  }

  async getTodayReminders(userId = this.defaultUserId): Promise<Reminder[]> {
    const today = new Date().toISOString().split('T')[0];
    
    return await db.select().from(reminders)
      .where(and(
        eq(reminders.userId, userId),
        eq(reminders.isActive, true)
      ))
      .orderBy(reminders.time);
  }

  async createReminder(reminder: InsertReminder, userId = this.defaultUserId): Promise<Reminder> {
    const [newReminder] = await db.insert(reminders)
      .values({ ...reminder, userId })
      .returning();
    return newReminder;
  }

  async updateReminder(id: number, reminder: Partial<Reminder>): Promise<Reminder> {
    const [updated] = await db.update(reminders)
      .set(reminder)
      .where(eq(reminders.id, id))
      .returning();
    if (!updated) throw new Error("Reminder not found");
    return updated;
  }

  async deleteReminder(id: number): Promise<void> {
    await db.delete(reminders).where(eq(reminders.id, id));
  }

  // Memories
  async getMemories(userId = this.defaultUserId): Promise<Memory[]> {
    return await db.select().from(memories)
      .where(eq(memories.userId, userId))
      .orderBy(desc(memories.createdAt));
  }

  async createMemory(memory: InsertMemory, userId = this.defaultUserId): Promise<Memory> {
    const [newMemory] = await db.insert(memories)
      .values({ ...memory, userId })
      .returning();
    return newMemory;
  }

  async deleteMemory(id: number): Promise<void> {
    await db.delete(memories).where(eq(memories.id, id));
  }

  // Chat Messages
  async getChatMessages(userId = this.defaultUserId): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.userId, userId))
      .orderBy(chatMessages.createdAt);
  }

  async createChatMessage(message: InsertChatMessage, userId = this.defaultUserId): Promise<ChatMessage> {
    const [newMessage] = await db.insert(chatMessages)
      .values({ ...message, userId })
      .returning();
    return newMessage;
  }

  async clearChatHistory(userId = this.defaultUserId): Promise<void> {
    await db.delete(chatMessages).where(eq(chatMessages.userId, userId));
  }

  // Emergency Contacts
  async getEmergencyContacts(userId = this.defaultUserId): Promise<EmergencyContact[]> {
    return await db.select().from(emergencyContacts)
      .where(eq(emergencyContacts.userId, userId));
  }

  async createEmergencyContact(contact: InsertEmergencyContact, userId = this.defaultUserId): Promise<EmergencyContact> {
    const [newContact] = await db.insert(emergencyContacts)
      .values({ ...contact, userId })
      .returning();
    return newContact;
  }

  async updateEmergencyContact(id: number, contact: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const [updated] = await db.update(emergencyContacts)
      .set(contact)
      .where(eq(emergencyContacts.id, id))
      .returning();
    if (!updated) throw new Error("Emergency contact not found");
    return updated;
  }

  async deleteEmergencyContact(id: number): Promise<void> {
    await db.delete(emergencyContacts).where(eq(emergencyContacts.id, id));
  }

  // Medications
  async getMedications(userId = this.defaultUserId): Promise<Medication[]> {
    return await db.select().from(medications)
      .where(and(
        eq(medications.userId, userId),
        eq(medications.isActive, true)
      ))
      .orderBy(medications.name);
  }

  async createMedication(medication: InsertMedication, userId = this.defaultUserId): Promise<Medication> {
    const [newMedication] = await db.insert(medications)
      .values({ ...medication, userId })
      .returning();
    return newMedication;
  }

  async updateMedication(id: number, medication: Partial<Medication>): Promise<Medication> {
    const [updated] = await db.update(medications)
      .set(medication)
      .where(eq(medications.id, id))
      .returning();
    if (!updated) throw new Error("Medication not found");
    return updated;
  }

  async deleteMedication(id: number): Promise<void> {
    await db.update(medications)
      .set({ isActive: false })
      .where(eq(medications.id, id));
  }
}

export const storage = new DatabaseStorage();
