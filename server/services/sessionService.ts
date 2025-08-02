import { Types } from 'mongoose';
import Session, { ISession } from '../models/Session';
import User from '../models/User';

interface StartSessionParams {
  sessionId: string;
  userId: string;
  roomId: string;
}

export const startSession = async ({ sessionId, userId, roomId }: StartSessionParams) => {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const isTeacher = session.teacher.toString() === userId;
  const isStudent = session.student.toString() === userId;
  
  if (!isTeacher && !isStudent) {
    throw new Error('Unauthorized to start this session');
  }

  const update: Partial<ISession> = {
    status: 'in-progress',
    roomId,
    startTime: new Date(),
    callStartedAt: new Date(),
  };

  // Update participant join time
  const participantRole = isTeacher ? 'teacher' : 'student';
  update[`participants.${participantRole}.joinedAt`] = new Date();

  const updatedSession = await Session.findByIdAndUpdate(
    sessionId,
    { $set: update },
    { new: true }
  );

  return updatedSession;
};

interface EndSessionParams {
  sessionId: string;
  userId: string;
}

export const endSession = async ({ sessionId, userId }: EndSessionParams) => {
  const session = await Session.findById(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }

  const isTeacher = session.teacher.toString() === userId;
  const isStudent = session.student.toString() === userId;
  
  if (!isTeacher && !isStudent) {
    throw new Error('Unauthorized to end this session');
  }

  const now = new Date();
  const participantRole = isTeacher ? 'teacher' : 'student';
  const update: any = {
    $set: {
      [`participants.${participantRole}.leftAt`]: now,
      callEndedAt: now,
      endTime: now
    }
  };

  // Calculate time spent in minutes
  const joinedAt = session.participants[participantRole].joinedAt;
  if (joinedAt) {
    const timeSpentMs = now.getTime() - new Date(joinedAt).getTime();
    const timeSpentMinutes = Math.ceil(timeSpentMs / (1000 * 60));
    
    update.$inc = {
      'actualDuration': timeSpentMinutes,
      [`participants.${participantRole}.timeSpent`]: timeSpentMinutes
    };
  }

  // If both participants have left, finalize the session
  const otherRole = isTeacher ? 'student' : 'teacher';
  if (session.participants[otherRole]?.leftAt) {
    update.$set.status = 'completed';
    
    // Calculate and update time credits if this is the teacher ending the session
    if (isTeacher && session.actualDuration) {
      const timeCreditEarned = Math.round((session.actualDuration / 60) * 10) / 10; // 0.1 per 10 minutes
      
      // Update teacher's balance
      await User.findByIdAndUpdate(
        session.teacher,
        { $inc: { timeBalance: timeCreditEarned } }
      );

      // Update session with final time credit
      update.$set.timeCredit = timeCreditEarned;
    }
  }

  const updatedSession = await Session.findByIdAndUpdate(
    sessionId,
    update,
    { new: true }
  );

  return updatedSession;
};

export const getUserSessions = async (userId: string, status?: string) => {
  const query: any = {
    $or: [
      { teacher: new Types.ObjectId(userId) },
      { student: new Types.ObjectId(userId) }
    ]
  };

  if (status) {
    query.status = status;
  }

  return Session.find(query)
    .populate('teacher', 'name profilePicture')
    .populate('student', 'name profilePicture')
    .sort({ scheduledTime: -1 });
};
