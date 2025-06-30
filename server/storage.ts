import { 
  reminders, memories, chatMessages, emergencyContacts,
  type Reminder, type InsertReminder,
  type Memory, type InsertMemory,
  type ChatMessage, type InsertChatMessage,
  type EmergencyContact, type InsertEmergencyContact
} from "@shared/schema";

export interface IStorage {
  // Reminders
  getReminders(): Promise<Reminder[]>;
  getTodayReminders(): Promise<Reminder[]>;
  createReminder(reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: number, reminder: Partial<Reminder>): Promise<Reminder>;
  deleteReminder(id: number): Promise<void>;
  
  // Memories
  getMemories(): Promise<Memory[]>;
  createMemory(memory: InsertMemory): Promise<Memory>;
  deleteMemory(id: number): Promise<void>;
  
  // Chat Messages
  getChatMessages(): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  clearChatHistory(): Promise<void>;
  
  // Emergency Contacts
  getEmergencyContacts(): Promise<EmergencyContact[]>;
  createEmergencyContact(contact: InsertEmergencyContact): Promise<EmergencyContact>;
  updateEmergencyContact(id: number, contact: Partial<EmergencyContact>): Promise<EmergencyContact>;
  deleteEmergencyContact(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private reminders: Map<number, Reminder>;
  private memories: Map<number, Memory>;
  private chatMessages: Map<number, ChatMessage>;
  private emergencyContacts: Map<number, EmergencyContact>;
  private currentId: number;

  constructor() {
    this.reminders = new Map();
    this.memories = new Map();
    this.chatMessages = new Map();
    this.emergencyContacts = new Map();
    this.currentId = 1;
    
    // Initialize with default emergency contacts
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    const defaultContacts: InsertEmergencyContact[] = [
      { name: "Emergency Services", phone: "911", relationship: "Emergency" },
      { name: "Sarah", phone: "(555) 123-4567", relationship: "Granddaughter" },
      { name: "Dr. Smith", phone: "(555) 456-7890", relationship: "Doctor" },
    ];

    defaultContacts.forEach(contact => {
      const id = this.currentId++;
      const fullContact: EmergencyContact = { 
        ...contact, 
        id,
      };
      this.emergencyContacts.set(id, fullContact);
    });
  }

  // Reminders
  async getReminders(): Promise<Reminder[]> {
    return Array.from(this.reminders.values()).sort((a, b) => 
      new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
    );
  }

  async getTodayReminders(): Promise<Reminder[]> {
    const today = new Date().toISOString().split('T')[0];
    const currentTime = new Date();
    
    return Array.from(this.reminders.values()).filter(reminder => {
      if (!reminder.isActive) return false;
      
      if (reminder.frequency === 'once') {
        return reminder.date === today;
      } else if (reminder.frequency === 'daily') {
        return true;
      } else if (reminder.frequency === 'weekly') {
        const dayOfWeek = currentTime.getDay();
        // For demo, show weekly reminders on specific day (can be enhanced)
        return dayOfWeek === 1; // Mondays
      }
      return false;
    }).sort((a, b) => a.time.localeCompare(b.time));
  }

  async createReminder(insertReminder: InsertReminder): Promise<Reminder> {
    const id = this.currentId++;
    const reminder: Reminder = {
      ...insertReminder,
      id,
      isCompleted: false,
      isActive: true,
      createdAt: new Date(),
    };
    this.reminders.set(id, reminder);
    return reminder;
  }

  async updateReminder(id: number, update: Partial<Reminder>): Promise<Reminder> {
    const reminder = this.reminders.get(id);
    if (!reminder) throw new Error("Reminder not found");
    
    const updated = { ...reminder, ...update };
    this.reminders.set(id, updated);
    return updated;
  }

  async deleteReminder(id: number): Promise<void> {
    this.reminders.delete(id);
  }

  // Memories
  async getMemories(): Promise<Memory[]> {
    return Array.from(this.memories.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async createMemory(insertMemory: InsertMemory): Promise<Memory> {
    const id = this.currentId++;
    const memory: Memory = {
      ...insertMemory,
      id,
      createdAt: new Date(),
    };
    this.memories.set(id, memory);
    return memory;
  }

  async deleteMemory(id: number): Promise<void> {
    this.memories.delete(id);
  }

  // Chat Messages
  async getChatMessages(): Promise<ChatMessage[]> {
    return Array.from(this.chatMessages.values()).sort((a, b) => 
      new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
    );
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = this.currentId++;
    const message: ChatMessage = {
      ...insertMessage,
      id,
      createdAt: new Date(),
    };
    this.chatMessages.set(id, message);
    return message;
  }

  async clearChatHistory(): Promise<void> {
    this.chatMessages.clear();
  }

  // Emergency Contacts
  async getEmergencyContacts(): Promise<EmergencyContact[]> {
    return Array.from(this.emergencyContacts.values());
  }

  async createEmergencyContact(insertContact: InsertEmergencyContact): Promise<EmergencyContact> {
    const id = this.currentId++;
    const contact: EmergencyContact = {
      ...insertContact,
      id,
    };
    this.emergencyContacts.set(id, contact);
    return contact;
  }

  async updateEmergencyContact(id: number, update: Partial<EmergencyContact>): Promise<EmergencyContact> {
    const contact = this.emergencyContacts.get(id);
    if (!contact) throw new Error("Emergency contact not found");
    
    const updated = { ...contact, ...update };
    this.emergencyContacts.set(id, updated);
    return updated;
  }

  async deleteEmergencyContact(id: number): Promise<void> {
    this.emergencyContacts.delete(id);
  }
}

export const storage = new MemStorage();
