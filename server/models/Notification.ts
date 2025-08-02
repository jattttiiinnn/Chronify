import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type NotificationType = 
  | 'session_request' 
  | 'session_accepted' 
  | 'session_rejected'
  | 'session_reminder' 
  | 'message' 
  | 'time_received' 
  | 'system';

export type RelatedEntityType = 'session' | 'chat' | 'user' | 'transaction';

export interface INotification extends Document {
  recipient: Types.ObjectId;
  sender?: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntity?: {
    type: RelatedEntityType;
    id: Types.ObjectId;
  };
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    sender: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
    },
    type: { 
      type: String, 
      enum: [
        'session_request', 'session_accepted', 'session_rejected',
        'session_reminder', 'message', 'time_received', 'system'
      ],
      required: true,
      index: true
    },
    title: { 
      type: String, 
      required: true,
      trim: true 
    },
    message: { 
      type: String, 
      required: true,
      trim: true 
    },
    relatedEntity: {
      type: { 
        type: String, 
        enum: ['session', 'chat', 'user', 'transaction'] 
      },
      id: { 
        type: Schema.Types.ObjectId,
        refPath: 'relatedEntity.type'
      }
    },
    isRead: { 
      type: Boolean, 
      default: false,
      index: true 
    },
    readAt: { 
      type: Date 
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
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

// Virtual for populating sender details
notificationSchema.virtual('senderDetails', {
  ref: 'User',
  localField: 'sender',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email profilePicture' }
});

// Middleware to set readAt when isRead is set to true
notificationSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

const Notification: Model<INotification> = 
  mongoose.models.Notification || 
  mongoose.model<INotification>('Notification', notificationSchema);

export default Notification;
