import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './User';
import Session from './Session';
import Chat from './Chat';
import Message from './Message';
import TimeTransaction from './TimeTransaction';
import Notification from './Notification';
import Report from './Report';

// Load environment variables
dotenv.config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timebank';

// MongoDB connection options
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
} as mongoose.ConnectOptions;

// Connect to MongoDB
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI, options);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    // Exit process with failure
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to DB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

// Handle process termination
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('Mongoose connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

// Export models and connection function
export {
  connectDB,
  User,
  Session,
  Chat,
  Message,
  TimeTransaction,
  Notification,
  Report,
  mongoose
};

export default {
  connectDB,
  User,
  Session,
  Chat,
  Message,
  TimeTransaction,
  Notification,
  Report,
  mongoose
};
