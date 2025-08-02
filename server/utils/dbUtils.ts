import mongoose, { Types } from 'mongoose';
import { Session, TimeTransaction, Notification } from '../models';
import { ISession } from '../models/Session';
import User, { IUser } from '../models/User';
import { Document } from 'mongoose';

/**
 * Start a database transaction session
 */
export const startSession = async () => {
  const session = await mongoose.startSession();
  session.startTransaction();
  return session;
};

/**
 * Commit a transaction
 */
export const commitTransaction = async (session: any) => {
  await session.commitTransaction();
  session.endSession();
};

/**
 * Abort a transaction
 */
export const abortTransaction = async (session: any) => {
  await session.abortTransaction();
  session.endSession();
};

/**
 * Create a new time transaction between users
 */
export const createTimeTransaction = async ({
  fromUserId,
  toUserId,
  amount,
  sessionId,
  type,
  description,
  metadata = {}
}: {
  fromUserId: Types.ObjectId | string;
  toUserId: Types.ObjectId | string;
  amount: number;
  sessionId?: Types.ObjectId | string;
  type: 'session' | 'transfer' | 'system' | 'adjustment';
  description?: string;
  metadata?: Record<string, any>;
}) => {
  const transaction = new TimeTransaction({
    fromUser: fromUserId,
    toUser: toUserId,
    amount,
    session: sessionId,
    type,
    description,
    metadata,
    status: 'completed'
  });

  await transaction.save();
  return transaction;
};

/**
 * Create a notification for a user
 */
export const createNotification = async ({
  recipientId,
  senderId,
  type,
  title,
  message,
  relatedEntityType,
  relatedEntityId
}: {
  recipientId: Types.ObjectId | string;
  senderId?: Types.ObjectId | string;
  type: 'session_request' | 'session_accepted' | 'session_rejected' | 'session_reminder' | 'message' | 'time_received' | 'system';
  title: string;
  message: string;
  relatedEntityType?: 'session' | 'chat' | 'user' | 'transaction';
  relatedEntityId?: Types.ObjectId | string;
}) => {
  const notification = new Notification({
    recipient: recipientId,
    sender: senderId,
    type,
    title,
    message,
    ...(relatedEntityType && relatedEntityId && {
      relatedEntity: {
        type: relatedEntityType,
        id: relatedEntityId
      }
    })
  });

  await notification.save();
  return notification;
};

/**
 * Update user's time balance
 */
export const updateUserTimeBalance = async (
  userId: Types.ObjectId | string, 
  amount: number,
  session?: any
) => {
  const update = { $inc: { timeBalance: amount } };
  const options = session ? { session } : {};
  
  const user = await User.findByIdAndUpdate(
    userId,
    update,
    { new: true, ...options }
  );
  
  return user;
};

/**
 * Check if a user has enough time balance
 */
export const hasEnoughTimeBalance = async (
  userId: Types.ObjectId | string, 
  requiredAmount: number
): Promise<boolean> => {
  const user = await User.findById(userId).select('timeBalance');
  if (!user) return false;
  
  return user.timeBalance >= requiredAmount;
};

/**
 * Get user's available time balance
 */
export const getUserTimeBalance = async (
  userId: Types.ObjectId | string
): Promise<number> => {
  const user = await User.findById(userId).select('timeBalance');
  return user?.timeBalance || 0;
};

/**
 * Create a new session with transaction handling
 */
export const createSessionWithTransaction = async (sessionData: {
  teacher: Types.ObjectId | string;
  student: Types.ObjectId | string;
  skill: string;
  [key: string]: any;
}) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Create the session
    const newSession = new Session({
      ...sessionData,
      status: 'pending'
    });
    
    const savedSession = await newSession.save({ session });
    
    // Create notification for the student
    await createNotification({
      recipientId: sessionData.teacher,
      senderId: sessionData.student,
      type: 'session_request',
      title: 'New Session Request',
      message: `You have a new session request for "${sessionData.skill}"`,
      relatedEntityType: 'session',
      relatedEntityId: (savedSession as unknown as Document & { _id: Types.ObjectId })._id.toString()
    });
    
    await session.commitTransaction();
    return newSession;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Accept a session request
 */
export const acceptSessionRequest = async (sessionId: string, userId: string) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Update session status
    const updatedSession = await Session.findByIdAndUpdate(
      sessionId,
      { status: 'confirmed' },
      { new: true, session }
    );
    
    if (!updatedSession) {
      throw new Error('Session not found');
    }
    
    // Create notification for the student
    await createNotification({
      recipientId: updatedSession.student,
      senderId: userId,
      type: 'session_accepted',
      title: 'Session Accepted',
      message: `Your session for "${updatedSession.skill}" has been accepted`,
      relatedEntityType: 'session',
      relatedEntityId: updatedSession._id
    });
    
    await session.commitTransaction();
    return updatedSession;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
