import { 
  type Message, 
  type InsertMessage,
  type Conversation,
  type InsertConversation 
} from "@shared/schema";

export interface IStorage {
  getConversations(): Promise<Conversation[]>;
  getMessages(conversationId: number): Promise<Message[]>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class MemStorage implements IStorage {
  private conversations: Conversation[];
  private messages: Message[];
  private currentConversationId: number;
  private currentMessageId: number;

  constructor() {
    this.conversations = [];
    this.messages = [];
    this.currentConversationId = 1;
    this.currentMessageId = 1;
  }

  async getConversations(): Promise<Conversation[]> {
    return this.conversations;
  }

  async getMessages(conversationId: number): Promise<Message[]> {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.currentConversationId++,
      ...insertConversation,
      createdAt: new Date(),
    };
    this.conversations.push(conversation);
    return conversation;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const message: Message = {
      id: this.currentMessageId++,
      ...insertMessage,
      timestamp: new Date(),
    };
    this.messages.push(message);
    return message;
  }
}

export const storage = new MemStorage();