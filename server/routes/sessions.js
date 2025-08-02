import express from 'express';
import Session from '../models/Session.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Create new session
router.post('/create', auth, async (req, res) => {
  try {
    const { skillName, description, dateTime, duration, providerId, meetLink } = req.body;
    
    // Check if provider exists and has enough time balance if they're the requester
    const provider = await User.findById(providerId);
    if (!provider) {
      return res.status(404).json({ message: 'Provider not found' });
    }

    const session = new Session({
      skillName,
      description,
      dateTime: new Date(dateTime),
      duration,
      requesterId: req.user._id,
      providerId,
      meetLink: meetLink || ''
    });

    await session.save();
    await session.populate(['requesterId', 'providerId'], 'name email');
    
    res.status(201).json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's sessions
router.get('/my', auth, async (req, res) => {
  try {
    const sessions = await Session.find({
      $or: [
        { requesterId: req.user._id },
        { providerId: req.user._id }
      ]
    })
    .populate('requesterId', 'name email')
    .populate('providerId', 'name email')
    .sort({ dateTime: -1 });
    
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Complete session and transfer credits
router.post('/:sessionId/complete', auth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    if (session.providerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the provider can mark session as complete' });
    }
    
    if (session.status === 'completed') {
      return res.status(400).json({ message: 'Session already completed' });
    }

    // Update session status
    session.status = 'completed';
    await session.save();

    // Transfer time credits
    const provider = await User.findById(session.providerId);
    const requester = await User.findById(session.requesterId);

    provider.timeBalance += session.duration;
    provider.totalEarned += session.duration;
    
    requester.timeBalance -= session.duration;
    requester.totalSpent += session.duration;

    await provider.save();
    await requester.save();

    res.json({ message: 'Session completed and credits transferred', session });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export { router };