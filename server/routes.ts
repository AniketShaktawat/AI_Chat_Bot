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

      if (!req.body.content) {
        throw new Error("Message content is required");
      }

      const userMessage = insertMessageSchema.parse({
        conversationId,
        role: "user",
        content: req.body.content,
      });

      const savedUserMessage = await storage.createMessage(userMessage);

      let messages = await storage.getMessages(conversationId);

      try {
        const response = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: messages.map(m => ({
            role: m.role as any,
            content: m.content,
          })),
          temperature: 0.7,
          max_tokens: 1000,
        });

        const assistantMessage = {
          conversationId,
          role: "assistant",
          content: response.choices[0].message.content || "I apologize, but I couldn't generate a response.",
        };
        const savedAssistantMessage = await storage.createMessage(assistantMessage);
        res.json(savedAssistantMessage);
      } catch (error: any) {
        console.error("OpenAI API Error:", error);

        const errorMessage = {
          conversationId,
          role: "assistant",
          content: "I apologize, but I encountered an error while processing your request. Please try again.",
        };
        const savedErrorMessage = await storage.createMessage(errorMessage);
        res.json(savedErrorMessage);
      }
    } catch (error: any) {
      console.error("Request Error:", error);
      res.status(400).json({ 
        message: error.message || "An error occurred while processing your request" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}