import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  messageType: {
    type: String,
    enum: ['text', 'system'],
    default: 'text'
  }
});

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  messages: [messageSchema],
  lastActivity: {
    type: Date,
    default: Date.now
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }
}, {
  timestamps: true
});

export default mongoose.model('Chat', chatSchema);