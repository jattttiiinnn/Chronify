import mongoose, { Document, Schema, Model } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string;
  bio?: string;
  profilePicture?: string;
  skills: Array<{
    name: string;
    level: 'beginner' | 'intermediate' | 'expert';
    category: string;
  }>;
  timeBalance: number;
  rating: number;
  reviews: Array<{
    reviewerId: mongoose.Types.ObjectId;
    rating: number;
    comment?: string;
    createdAt: Date;
  }>;
  location?: {
    type: string;
    coordinates: [number, number];
    address?: string;
  };
  verification: {
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    verificationToken?: string;
    verificationTokenExpires?: Date;
  };
  settings: {
    notifications: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'connections' | 'private';
      skillVisibility: 'public' | 'connections' | 'private';
    };
  };
  lastActive?: Date;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      trim: true, 
      lowercase: true 
    },
    password: { 
      type: String, 
      required: true, 
      select: false 
    },
    name: { 
      type: String, 
      required: true, 
      trim: true 
    },
    bio: { 
      type: String, 
      trim: true 
    },
    profilePicture: String,
    skills: [{
      name: { type: String, required: true },
      level: { 
        type: String, 
        enum: ['beginner', 'intermediate', 'expert'],
        required: true 
      },
      category: { type: String, required: true }
    }],
    timeBalance: { 
      type: Number, 
      default: 0 
    },
    rating: { 
      type: Number, 
      min: 0, 
      max: 5, 
      default: 0 
    },
    reviews: [{
      reviewerId: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      },
      rating: { 
        type: Number, 
        min: 1, 
        max: 5, 
        required: true 
      },
      comment: String,
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }],
    location: {
      type: { 
        type: String, 
        default: 'Point' 
      },
      coordinates: { 
        type: [Number],
        index: '2dsphere'
      },
      address: String
    },
    verification: {
      isEmailVerified: { 
        type: Boolean, 
        default: false 
      },
      isPhoneVerified: { 
        type: Boolean, 
        default: false 
      },
      verificationToken: String,
      verificationTokenExpires: Date
    },
    settings: {
      notifications: {
        email: { 
          type: Boolean, 
          default: true 
        },
        push: { 
          type: Boolean, 
          default: true 
        },
        sms: { 
          type: Boolean, 
          default: false 
        }
      },
      privacy: {
        profileVisibility: { 
          type: String, 
          enum: ['public', 'connections', 'private'], 
          default: 'public' 
        },
        skillVisibility: { 
          type: String, 
          enum: ['public', 'connections', 'private'], 
          default: 'public' 
        }
      }
    },
    lastActive: Date,
    status: { 
      type: String, 
      enum: ['active', 'inactive', 'suspended'], 
      default: 'active' 
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: function(doc, ret) {
        delete ret.password;
        delete ret.verification;
        return ret;
      }
    }
  }
);

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ 'skills.name': 1 });
userSchema.index({ 'location.coordinates': '2dsphere' });
userSchema.index({ status: 1 });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
