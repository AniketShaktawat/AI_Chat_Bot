import express from 'express';
import Message from '../models/Message.js';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Get all messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find().sort('timestamp');
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new message
router.post('/', async (req, res) => {
  try {
    const { content } = req.body;
    const sessionId = req.session.sessionId;

    // Save user message
    const userMessage = await Message.create({
      role: 'user',
      content,
      sessionId
    });

    // Get session messages for context
    const sessionMessages = await Message.find({ sessionId }).sort('timestamp');
    
    // Get AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: sessionMessages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });

    // Save AI response
    const assistantMessage = await Message.create({
      role: 'assistant',
      content: response.choices[0].message.content,
      sessionId
    });

    res.json(assistantMessage);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete session messages
router.delete('/:sessionId', async (req, res) => {
  try {
    await Message.deleteMany({ sessionId: req.params.sessionId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
