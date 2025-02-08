import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { insertMessageSchema, insertConversationSchema } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function registerRoutes(app: Express): Server {
  app.get("/api/conversations", async (_req, res) => {
    const conversations = await storage.getConversations();
    res.json(conversations);
  });

  app.post("/api/conversations", async (_req, res) => {
    const conversation = await storage.createConversation({
      title: "New Chat",
    });
    res.json(conversation);
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    const conversationId = parseInt(req.params.id);
    const messages = await storage.getMessages(conversationId);
    res.json(messages);
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const conversationId = parseInt(req.params.id);
      const userMessage = insertMessageSchema.parse({
        conversationId,
        role: "user",
        content: req.body.content,
      });
      await storage.createMessage(userMessage);

      const messages = await storage.getMessages(conversationId);
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: messages.map(m => ({
          role: m.role as any,
          content: m.content,
        })),
      });

      const assistantMessage = {
        conversationId,
        role: "assistant",
        content: response.choices[0].message.content || "",
      };
      const savedMessage = await storage.createMessage(assistantMessage);
      res.json(savedMessage);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}