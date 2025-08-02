import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface IAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

export interface IMessage extends Document {
  chatId: Types.ObjectId;
  sender: Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system' | 'call';
  attachments?: IAttachment[];
  readBy: Types.ObjectId[];
  deletedFor: Types.ObjectId[];
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Chat', 
      required: true,
      index: true 
    },
    sender: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    content: { 
      type: String, 
      required: true,
      trim: true 
    },
    messageType: { 
      type: String, 
      enum: ['text', 'image', 'file', 'system', 'call'],
      default: 'text' 
    },
    attachments: [{
      url: { 
        type: String, 
        required: true 
      },
      type: { 
        type: String, 
        required: true 
      },
      name: { 
        type: String, 
        required: true 
      },
      size: { 
        type: Number, 
        required: true 
      }
    }],
    readBy: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }],
    deletedFor: [{ 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    }]
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
messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: 1 });

// Virtual for populating sender details
messageSchema.virtual('senderDetails', {
  ref: 'User',
  localField: 'sender',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email profilePicture' }
});

// Middleware to update chat's last message when a new message is saved
messageSchema.post('save', async function(doc) {
  const Chat = mongoose.model('Chat');
  
  await Chat.findByIdAndUpdate(doc.chatId, {
    lastMessage: {
      content: doc.content,
      sender: doc.sender,
      timestamp: doc.createdAt,
      readBy: doc.readBy
    },
    updatedAt: new Date()
  });
});

const Message: Model<IMessage> = mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export default Message;
