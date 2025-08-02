import express from 'express';
import Chat from '../models/Chat.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Get user's chats
router.get('/my', auth, async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id
    })
    .populate('participants', 'name email')
    .populate('sessionId', 'skillName status')
    .sort({ lastActivity: -1 });
    
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get specific chat
router.get('/:chatId', auth, async (req, res) => {
  try {
    const chat = await Chat.findOne({
      _id: req.params.chatId,
      participants: req.user._id
    })
    .populate('participants', 'name email')
    .populate('messages.senderId', 'name');
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create or get chat between users
router.post('/create', auth, async (req, res) => {
  try {
    const { participantId, sessionId } = req.body;
    
    // Check if chat already exists
    let chat = await Chat.findOne({
      participants: { $all: [req.user._id, participantId] }
    }).populate('participants', 'name email');
    
    if (!chat) {
      chat = new Chat({
        participants: [req.user._id, participantId],
        sessionId: sessionId || null
      });
      await chat.save();
      await chat.populate('participants', 'name email');
    }
    
    res.json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export { router };