import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IChatParticipant {
  userId: Types.ObjectId;
  lastRead: Date;
}

export interface ILastMessage {
  content: string;
  sender: Types.ObjectId;
  timestamp: Date;
  readBy: Types.ObjectId[];
}

export interface IGroupInfo {
  name: string;
  admin: Types.ObjectId;
  description?: string;
  picture?: string;
}

export interface IChat extends Document {
  participants: IChatParticipant[];
  sessionId?: Types.ObjectId;
  lastMessage?: ILastMessage;
  isGroup: boolean;
  groupInfo?: IGroupInfo;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    participants: [{
      userId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      lastRead: { 
        type: Date, 
        default: Date.now 
      }
    }],
    sessionId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Session' 
    },
    lastMessage: {
      content: { 
        type: String, 
        required: true 
      },
      sender: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      timestamp: { 
        type: Date, 
        default: Date.now 
      },
      readBy: [{ 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
      }]
    },
    isGroup: { 
      type: Boolean, 
      default: false 
    },
    groupInfo: {
      name: { 
        type: String, 
        required: function() {
          return (this as any).isGroup === true;
        } 
      },
      admin: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        required: function() {
          return (this as any).isGroup === true;
        } 
      },
      description: String,
      picture: String
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for common queries
chatSchema.index({ 'participants.userId': 1 });
chatSchema.index({ sessionId: 1 });
chatSchema.index({ 'lastMessage.timestamp': -1 });

// Virtual for populating participants
chatSchema.virtual('participantDetails', {
  ref: 'User',
  localField: 'participants.userId',
  foreignField: '_id',
  justOne: false,
  options: { select: 'name email profilePicture' }
});

// Virtual for populating session details
chatSchema.virtual('sessionDetails', {
  ref: 'Session',
  localField: 'sessionId',
  foreignField: '_id',
  justOne: true,
  options: { select: 'title skill scheduledTime status' }
});

const Chat: Model<IChat> = mongoose.models.Chat || mongoose.model<IChat>('Chat', chatSchema);

export default Chat;
