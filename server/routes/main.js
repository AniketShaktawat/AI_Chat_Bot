import express from 'express';
import Message from '../models/Message.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    if (!req.session.sessionId) {
      req.session.sessionId = crypto.randomUUID();
    }
    
    const messages = await Message.find().sort('timestamp');
    const sessions = messages.reduce((acc, message) => {
      if (!acc[message.sessionId]) {
        acc[message.sessionId] = [];
      }
      acc[message.sessionId].push(message);
      return acc;
    }, {});

    res.render('index', { 
      sessions,
      currentSessionId: req.session.sessionId,
      moment: require('moment')
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

export default router;
