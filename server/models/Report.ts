import mongoose, { Document, Schema, Model, Types } from 'mongoose';

export type ReportType = 'spam' | 'inappropriate' | 'scam' | 'fake_profile' | 'other';
export type ReportStatus = 'open' | 'in_progress' | 'resolved' | 'dismissed';

export interface IReport extends Document {
  reporter: Types.ObjectId;
  reportedUser?: Types.ObjectId;
  reportedSession?: Types.ObjectId;
  reportType: ReportType;
  description: string;
  status: ReportStatus;
  adminNotes?: string;
  resolvedAt?: Date;
  resolvedBy?: Types.ObjectId;
  createdAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporter: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true 
    },
    reportedUser: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      index: true 
    },
    reportedSession: { 
      type: Schema.Types.ObjectId, 
      ref: 'Session',
      index: true 
    },
    reportType: { 
      type: String, 
      enum: ['spam', 'inappropriate', 'scam', 'fake_profile', 'other'],
      required: true,
      index: true 
    },
    description: { 
      type: String, 
      required: true,
      trim: true 
    },
    status: { 
      type: String, 
      enum: ['open', 'in_progress', 'resolved', 'dismissed'],
      default: 'open',
      index: true 
    },
    adminNotes: { 
      type: String,
      trim: true 
    },
    resolvedAt: { 
      type: Date 
    },
    resolvedBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User' 
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
reportSchema.index({ status: 1, createdAt: 1 });
reportSchema.index({ reportedUser: 1, status: 1 });
reportSchema.index({ reportedSession: 1, status: 1 });

// Virtual for populating related user details
reportSchema.virtual('reporterDetails', {
  ref: 'User',
  localField: 'reporter',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email' }
});

reportSchema.virtual('reportedUserDetails', {
  ref: 'User',
  localField: 'reportedUser',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email' }
});

// Virtual for populating resolved by user details
reportSchema.virtual('resolvedByDetails', {
  ref: 'User',
  localField: 'resolvedBy',
  foreignField: '_id',
  justOne: true,
  options: { select: 'name email' }
});

// Virtual for populating reported session details
reportSchema.virtual('reportedSessionDetails', {
  ref: 'Session',
  localField: 'reportedSession',
  foreignField: '_id',
  justOne: true,
  options: { select: 'title skill scheduledTime status' }
});

// Middleware to set resolvedAt when status changes to resolved
reportSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  next();
});

const Report: Model<IReport> = 
  mongoose.models.Report || 
  mongoose.model<IReport>('Report', reportSchema);

export default Report;
