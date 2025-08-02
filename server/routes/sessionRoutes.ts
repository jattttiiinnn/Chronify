import express from 'express';
import authenticate from '../middleware/auth';
import { startSession, endSession, getUserSessions } from '../services/sessionService';

const router = express.Router();

// Start a session
router.post('/:id/start', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roomId } = req.body;
    const userId = req.user._id;

    const session = await startSession({
      sessionId: id,
      userId,
      roomId
    });

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// End a session
router.post('/:id/end', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const session = await endSession({
      sessionId: id,
      userId
    });

    res.json(session);
  } catch (error) {
    next(error);
  }
});

// Get user's sessions
router.get('/my-sessions', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;
    const sessions = await getUserSessions(req.user._id, status as string);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
});

export default router;
