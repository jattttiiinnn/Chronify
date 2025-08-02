import express from 'express';
import User from '../models/User.js';
import auth from '../middleware/auth.js';

const router = express.Router();

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { skillsOffered, skillsLearning } = req.body;
    
    req.user.skillsOffered = skillsOffered || [];
    req.user.skillsLearning = skillsLearning || [];
    await req.user.save();
    
    res.json({ 
      message: 'Profile updated successfully', 
      user: {
        skillsOffered: req.user.skillsOffered,
        skillsLearning: req.user.skillsLearning
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add skill to user profile
router.post('/skills', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    req.user.skillsOffered.push({ name, description });
    await req.user.save();
    
    res.json({ message: 'Skill added successfully', skills: req.user.skillsOffered });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users with skills
router.get('/providers', auth, async (req, res) => {
  try {
    const { skill } = req.query;
    
    let query = { _id: { $ne: req.user._id } };
    if (skill) {
      query['skillsOffered.name'] = { $regex: skill, $options: 'i' };
    }
    
    const users = await User.find(query)
      .select('name email skillsOffered rating reviewsCount')
      .limit(20);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export { router };