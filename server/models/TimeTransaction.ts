import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ITimeTransaction extends Document {
  fromUser: Types.ObjectId;
  toUser: Types.ObjectId;
  amount: number; // in minutes
  session?: Types.ObjectId;
  type: 'session' | 'transfer' | 'system' | 'adjustment';
  status: 'pending' | 'completed' | 'failed' | 'reversed';
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const timeTransactionSchema = new Schema<ITimeTransaction>(
  {
    fromUser: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    toUser: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    amount: { 
      type: Number, 
      required: true,
      min: 0.01 // Minimum 1 minute
    },
    session: { 
      type: Schema.Types.ObjectId, 
      ref: 'Session' 
    },
    type: { 
      type: String, 
      enum: ['session', 'transfer', 'system', 'adjustment'],
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'completed', 'failed', 'reversed'],
      default: 'pending',
      index: true 
    },
    description: String,
    metadata: {
      type: Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for common queries
timeTransactionSchema.index({ fromUser: 1, createdAt: -1 });
timeTransactionSchema.index({ toUser: 1, createdAt: -1 });
timeTransactionSchema.index({ session: 1 });

// Virtual for populating user details
timeTransactionSchema.virtual('fromUserDetails', {
  ref: 'User',
  localField: 'fromUser',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email profilePicture' }
});

timeTransactionSchema.virtual('toUserDetails', {
  ref: 'User',
  localField: 'toUser',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email profilePicture' }
});

// Virtual for populating session details
timeTransactionSchema.virtual('sessionDetails', {
  ref: 'Session',
  localField: 'session',
  foreignField: '_id',
  justOne: true,
  options: { select: 'title skill scheduledTime' }
});

// Middleware to update user time balance when a transaction is completed
timeTransactionSchema.post('save', async function(doc) {
  if (doc.status === 'completed') {
    const User = mongoose.model('User');
    
    // Deduct time from sender
    await User.findByIdAndUpdate(doc.fromUser, {
      $inc: { timeBalance: -doc.amount }
    });
    
    // Add time to receiver
    await User.findByIdAndUpdate(doc.toUser, {
      $inc: { timeBalance: doc.amount }
    });
  }
});

const TimeTransaction: Model<ITimeTransaction> = 
  mongoose.models.TimeTransaction || 
  mongoose.model<ITimeTransaction>('TimeTransaction', timeTransactionSchema);

export default TimeTransaction;
