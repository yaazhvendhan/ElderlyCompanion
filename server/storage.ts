import { 
  type UserProfile, type InsertUserProfile,
  type Reminder, type InsertReminder,
  type Memory, type InsertMemory,
  type ChatMessage, type InsertChatMessage,
  type EmergencyContact, type InsertEmergencyContact,
  type Medication, type InsertMedication
} from "@shared/schema";

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

export class MemoryStorage implements IStorage {
  private data = {
    userProfiles: new Map<number, UserProfile>(),
    reminders: new Map<number, Reminder>(),
    memories: new Map<number, Memory>(),
    chatMessages: new Map<number, ChatMessage>(),
    emergencyContacts: new Map<number, EmergencyContact>(),
    medications: new Map<number, Medication>(),
  };
  
  private nextId = 1;
  private defaultUserId = 1;

  constructor() {
    this.initializeData();
  }

  private createId(): number {
    return this.nextId++;
  }

  private initializeData() {
    // Default user profile
    const defaultProfile: UserProfile = {
      id: 1,
      name: "Welcome User",
      age: 75,
      photo: null,
      address: null,
      emergencyContact: "Emergency Services",
      emergencyPhone: "911",
      medicalInfo: null,
      caregiverCode: "1234",
      preferences: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.userProfiles.set(1, defaultProfile);

    // Emergency contacts
    const contacts = [
      { name: "Emergency Services", phone: "911", relationship: "Emergency", isPrimary: true },
      { name: "Family Doctor", phone: "(555) 123-4567", relationship: "Doctor", isPrimary: false },
      { name: "Sarah Johnson", phone: "(555) 234-5678", relationship: "Daughter", isPrimary: false },
      { name: "Neighbor Mary", phone: "(555) 345-6789", relationship: "Neighbor", isPrimary: false }
    ];

    contacts.forEach((contact, index) => {
      const emergencyContact: EmergencyContact = {
        id: index + 1,
        userId: 1,
        name: contact.name,
        phone: contact.phone,
        relationship: contact.relationship,
        isPrimary: contact.isPrimary
      };
      this.data.emergencyContacts.set(index + 1, emergencyContact);
    });

    // Memories
    const memories = [
      { content: "Remember to water the plants on the balcony every Tuesday and Friday. They need extra care during winter months.", category: "important" },
      { content: "Sarah visited last Sunday and brought homemade cookies. She mentioned planning a family reunion for Thanksgiving.", category: "family" },
      { content: "Dr. Martinez said to walk 30 minutes daily and keep track of blood pressure readings.", category: "medical" }
    ];

    memories.forEach((memory, index) => {
      const memoryEntry: Memory = {
        id: index + 1,
        userId: 1,
        content: memory.content,
        category: memory.category,
        createdAt: new Date()
      };
      this.data.memories.set(index + 1, memoryEntry);
    });

    // Medications
    const medications = [
      { name: "Blood Pressure Medicine", dosage: "10mg", frequency: "daily", timeSlots: ["8:00"], instructions: "Take with breakfast, avoid dairy" },
      { name: "Vitamin D", dosage: "1000 IU", frequency: "daily", timeSlots: ["8:00"], instructions: "Take with morning meal" }
    ];

    medications.forEach((medication, index) => {
      const medicationEntry: Medication = {
        id: index + 1,
        userId: 1,
        name: medication.name,
        dosage: medication.dosage,
        frequency: medication.frequency,
        timeSlots: JSON.stringify(medication.timeSlots),
        instructions: medication.instructions,
        isActive: true,
        createdAt: new Date()
      };
      this.data.medications.set(index + 1, medicationEntry);
    });

    this.nextId = 10; // Start from 10 to avoid ID conflicts
  }

  // User Profile methods
  async getUserProfile(id = this.defaultUserId): Promise<UserProfile | undefined> {
    return this.data.userProfiles.get(id);
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const newProfile: UserProfile = {
      id: this.createId(),
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.userProfiles.set(newProfile.id, newProfile);
    return newProfile;
  }

  async updateUserProfile(id: number, updates: Partial<UserProfile>): Promise<UserProfile> {
    const existing = this.data.userProfiles.get(id);
    if (!existing) throw new Error("Profile not found");
    
    const updated: UserProfile = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.data.userProfiles.set(id, updated);
    return updated;
  }

  // Reminder methods
  async getReminders(userId = this.defaultUserId): Promise<Reminder[]> {
    return Array.from(this.data.reminders.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async getTodayReminders(userId = this.defaultUserId): Promise<Reminder[]> {
    return Array.from(this.data.reminders.values())
      .filter(r => r.userId === userId && r.isActive)
      .sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }

  async createReminder(reminder: InsertReminder, userId = this.defaultUserId): Promise<Reminder> {
    const newReminder: Reminder = {
      id: this.createId(),
      userId,
      ...reminder,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.data.reminders.set(newReminder.id, newReminder);
    return newReminder;
  }

  async updateReminder(id: number, updates: Partial<Reminder>): Promise<Reminder> {
    const existing = this.data.reminders.get(id);
    if (!existing) throw new Error("Reminder not found");
    
    const updated: Reminder = {
      ...existing,
      ...updates,
      updatedAt: new Date()
    };
    this.data.reminders.set(id, updated);
    return updated;
  }

  async deleteReminder(id: number): Promise<void> {
    this.data.reminders.delete(id);
  }

  // Memory methods
  async getMemories(userId = this.defaultUserId): Promise<Memory[]> {
    return Array.from(this.data.memories.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));
  }

  async createMemory(memory: InsertMemory, userId = this.defaultUserId): Promise<Memory> {
    const newMemory: Memory = {
      id: this.createId(),
      userId,
      ...memory,
      createdAt: new Date()
    };
    this.data.memories.set(newMemory.id, newMemory);
    return newMemory;
  }

  async deleteMemory(id: number): Promise<void> {
    this.data.memories.delete(id);
  }

  // Chat message methods
  async getChatMessages(userId = this.defaultUserId): Promise<ChatMessage[]> {
    return Array.from(this.data.chatMessages.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => (a.createdAt?.getTime() || 0) - (b.createdAt?.getTime() || 0));
  }

  async createChatMessage(message: InsertChatMessage, userId = this.defaultUserId): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      id: this.createId(),
      userId,
      ...message,
      createdAt: new Date()
    };
    this.data.chatMessages.set(newMessage.id, newMessage);
    return newMessage;
  }

  async clearChatHistory(userId = this.defaultUserId): Promise<void> {
    Array.from(this.data.chatMessages.entries()).forEach(([id, message]) => {
      if (message.userId === userId) {
        this.data.chatMessages.delete(id);
      }
    });
  }

  // Emergency contact methods
  async getEmergencyContacts(userId = this.defaultUserId): Promise<EmergencyContact[]> {
    return Array.from(this.data.emergencyContacts.values())
      .filter(c => c.userId === userId)
      .sort((a, b) => {
        if (a.isPrimary !== b.isPrimary) return (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0);
        return a.name.localeCompare(b.name);
      });
  }

  async createEmergencyContact(contact: InsertEmergencyContact, userId = this.defaultUserId): Promise<EmergencyContact> {
    const newContact: EmergencyContact = {
      id: this.createId(),
      userId,
      ...contact
    };
    this.data.emergencyContacts.set(newContact.id, newContact);
    return newContact;
  }

  async updateEmergencyContact(id: number, updates: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const existing = this.data.emergencyContacts.get(id);
    if (!existing) throw new Error("Emergency contact not found");
    
    const updated: EmergencyContact = {
      ...existing,
      ...updates
    };
    this.data.emergencyContacts.set(id, updated);
    return updated;
  }

  async deleteEmergencyContact(id: number): Promise<void> {
    this.data.emergencyContacts.delete(id);
  }

  // Medication methods
  async getMedications(userId = this.defaultUserId): Promise<Medication[]> {
    return Array.from(this.data.medications.values())
      .filter(m => m.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async createMedication(medication: InsertMedication, userId = this.defaultUserId): Promise<Medication> {
    const newMedication: Medication = {
      id: this.createId(),
      userId,
      ...medication,
      createdAt: new Date()
    };
    this.data.medications.set(newMedication.id, newMedication);
    return newMedication;
  }

  async updateMedication(id: number, updates: Partial<Medication>): Promise<Medication> {
    const existing = this.data.medications.get(id);
    if (!existing) throw new Error("Medication not found");
    
    const updated: Medication = {
      ...existing,
      ...updates
    };
    this.data.medications.set(id, updated);
    return updated;
  }

  async deleteMedication(id: number): Promise<void> {
    this.data.medications.delete(id);
  }
}

export const storage = new MemoryStorage();