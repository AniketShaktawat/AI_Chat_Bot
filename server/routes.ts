import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import OpenAI from "openai";
import { insertMessageSchema } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export function registerRoutes(app: Express): Server {
  app.get("/api/messages", async (_req, res) => {
    const messages = await storage.getMessages();
    res.json(messages);
  });

  app.delete("/api/messages/:sessionId", async (req, res) => {
    const { sessionId } = req.params;
    await storage.deleteSessionMessages(sessionId);
    res.json({ success: true });
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const userMessage = insertMessageSchema.parse({
        role: "user",
        content: req.body.content,
        sessionId: req.body.sessionId,
      });
      await storage.createMessage(userMessage);

      const messages = await storage.getMessages();
      const sessionMessages = messages.filter(m => m.sessionId === userMessage.sessionId);

      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: sessionMessages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      });

      const assistantMessage = {
        role: "assistant",
        content: response.choices[0].message.content || "",
        sessionId: userMessage.sessionId,
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