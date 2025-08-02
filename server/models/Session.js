import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  skillName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dateTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true // in hours
  },
  requesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  meetLink: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'completed', 'cancelled'],
    default: 'pending'
  },
  feedback: {
    requesterRating: { type: Number, min: 1, max: 5 },
    providerRating: { type: Number, min: 1, max: 5 },
    requesterComment: String,
    providerComment: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Session', sessionSchema);