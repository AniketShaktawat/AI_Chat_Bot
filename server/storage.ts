import { messages, type Message, type InsertMessage } from "@shared/schema";
import { db } from "./db";
import { asc, eq } from "drizzle-orm";

export interface IStorage {
  getMessages(): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearMessages(): Promise<void>;
  deleteSessionMessages(sessionId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getMessages(): Promise<Message[]> {
    return await db.select().from(messages).orderBy(asc(messages.timestamp));
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async clearMessages(): Promise<void> {
    await db.delete(messages);
  }

  async deleteSessionMessages(sessionId: string): Promise<void> {
    await db.delete(messages).where(eq(messages.sessionId, sessionId));
  }
}

export const storage = new DatabaseStorage();