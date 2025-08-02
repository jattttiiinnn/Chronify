import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export interface ISession extends Document {
  title: string;
  description?: string;
  skill: string;
  category: string;
  teacher: Types.ObjectId;
  student: Types.ObjectId;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'disputed';
  duration: number; // in minutes
  actualDuration?: number; // actual time spent in call (in minutes)
  timeCredit: number; // in timebank minutes
  scheduledTime: Date;
  startTime?: Date; // when the session actually started
  endTime?: Date; // when the session actually ended
  roomId?: string; // for video call room
  callStartedAt?: Date;
  callEndedAt?: Date;
  participants: {
    student: {
      joinedAt?: Date;
      leftAt?: Date;
      timeSpent: number; // in minutes
    };
    teacher: {
      joinedAt?: Date;
      leftAt?: Date;
      timeSpent: number; // in minutes
    };
  };
  location: {
    type: 'online' | 'in-person';
    address?: string;
    meetingLink?: string;
  };
  cancellation?: {
    cancelledBy: Types.ObjectId;
    reason?: string;
    timestamp: Date;
  };
  rating?: {
    byTeacher?: number;
    byStudent?: number;
    teacherComment?: string;
    studentComment?: string;
  };
  attachments?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema<ISession>(
  {
    title: { 
      type: String, 
      required: true, 
      trim: true 
    },
    description: { 
      type: String, 
      trim: true 
    },
    skill: { 
      type: String, 
      required: true,
      index: true
    },
    category: { 
      type: String, 
      required: true 
    },
    teacher: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    student: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'disputed'],
      default: 'pending' 
    },
    duration: { 
      type: Number, 
      required: true,
      min: 1 
    },
    actualDuration: { 
      type: Number, 
      min: 0,
      default: 0 
    },
    timeCredit: { 
      type: Number, 
      required: true,
      min: 0 
    },
    scheduledTime: { 
      type: Date, 
      required: true 
    },
    startTime: { 
      type: Date 
    },
    endTime: { 
      type: Date 
    },
    roomId: { 
      type: String,
      index: true 
    },
    callStartedAt: { 
      type: Date 
    },
    callEndedAt: { 
      type: Date 
    },
    participants: {
      student: {
        joinedAt: { type: Date },
        leftAt: { type: Date },
        timeSpent: { type: Number, default: 0 }
      },
      teacher: {
        joinedAt: { type: Date },
        leftAt: { type: Date },
        timeSpent: { type: Number, default: 0 }
      }
    },
    location: {
      type: { 
        type: String, 
        enum: ['online', 'in-person'], 
        required: true 
      },
      address: {
        type: String,
        required: function() {
          return (this as any).location?.type === 'in-person';
        }
      },
      meetingLink: {
        type: String,
        required: function() {
          return (this as any).location?.type === 'online';
        }
      }
    },
    cancellation: {
      cancelledBy: { 
        type: Schema.Types.ObjectId, 
        ref: 'User' 
      },
      reason: String,
      timestamp: { 
        type: Date, 
        default: Date.now 
      }
    },
    rating: {
      byTeacher: { 
        type: Number, 
        min: 1, 
        max: 5 
      },
      byStudent: { 
        type: Number, 
        min: 1, 
        max: 5 
      },
      teacherComment: String,
      studentComment: String
    },
    attachments: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String, required: true },
      size: { type: Number, required: true }
    }]
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for common queries
sessionSchema.index({ teacher: 1, status: 1 });
sessionSchema.index({ student: 1, status: 1 });
sessionSchema.index({ skill: 1, status: 1 });
sessionSchema.index({ scheduledTime: 1, status: 1 });

// Virtual for populating teacher and student details
sessionSchema.virtual('teacherDetails', {
  ref: 'User',
  localField: 'teacher',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email profilePicture' }
});

sessionSchema.virtual('studentDetails', {
  ref: 'User',
  localField: 'student',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email profilePicture' }
});

// Pre-save hook to set endTime based on duration
sessionSchema.pre('save', function(next) {
  if (this.isModified('scheduledTime') || this.isModified('duration')) {
    const endTime = new Date(this.scheduledTime);
    endTime.setMinutes(endTime.getMinutes() + this.duration);
    this.endTime = endTime;
  }
  next();
});

const Session: Model<ISession> = mongoose.models.Session || mongoose.model<ISession>('Session', sessionSchema);

export default Session;
