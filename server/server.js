import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import { router as authRoutes } from './routes/auth.js';
import { router as userRoutes } from './routes/users.js';
import { router as sessionRoutes } from './routes/sessions.js';
import { router as chatRoutes } from './routes/chat.js';
import Chat from './models/Chat.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'https://timebank-e67e2.web.app',
  'https://timebank-e67e2.firebaseapp.com'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

// Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://timebank-e67e2.web.app', 'https://timebank-e67e2.firebaseapp.com']
      : 'http://localhost:5173',
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  }
});
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/timebank';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/chat', chatRoutes);

// Socket.io for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat ${chatId}`);
  });

  socket.on('send-message', async (data) => {
    console.log('Server: Received send-message event:', data);
    try {
      const { chatId, senderId, content } = data;
      
      const chat = await Chat.findById(chatId);
      if (chat) {
        chat.messages.push({
          senderId,
          content,
          timestamp: new Date()
        });
        chat.lastActivity = new Date();
        await chat.save();
        
        await chat.populate('messages.senderId', 'name');
        const newMessage = chat.messages[chat.messages.length - 1];
        
        // Emit to chat room and also globally for notifications
        io.to(chatId).emit('new-message', newMessage);
        socket.broadcast.emit('new-message', { ...newMessage, chatId });
        console.log('Server: Message sent successfully');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Video call events
  socket.on('initiate-video-call', (data) => {
    console.log('Server: Video call initiated:', data);
    console.log('Server: Emitting to chat room:', data.chatId);
    console.log('Server: Sender socket ID:', socket.id);
    console.log('Server: Broadcasting to other users in room');
    socket.to(data.chatId).emit('incoming-video-call', {
      from: data.from,
      chatId: data.chatId,
      fromName: data.fromName || 'Unknown User'
    });
    console.log('Server: incoming-video-call event emitted');
  });

  socket.on('accept-video-call', (data) => {
    console.log('Server: Video call accepted:', data);
    console.log('Server: Notifying caller that call was accepted');
    socket.to(data.chatId).emit('call-accepted', {
      from: data.to
    });
  });

  socket.on('reject-video-call', (data) => {
    console.log('Server: Video call rejected:', data);
    console.log('Server: Notifying caller that call was rejected');
    socket.to(data.chatId).emit('call-rejected', {
      from: data.to
    });
  });

  socket.on('end-video-call', (data) => {
    console.log('Server: Video call ended:', data);
    socket.to(data.chatId).emit('call-ended');
  });

  socket.on('video-call-offer', (data) => {
    console.log('Server: Video call offer:', data);
    console.log('Server: Broadcasting offer to chat room:', data.chatId);
    socket.to(data.chatId).emit('video-call-offer', data);
  });

  socket.on('video-call-answer', (data) => {
    console.log('Server: Video call answer:', data);
    console.log('Server: Broadcasting answer to chat room:', data.chatId);
    socket.to(data.chatId).emit('video-call-answer', data);
  });

  socket.on('ice-candidate', (data) => {
    console.log('Server: ICE candidate received, broadcasting to chat room:', data.chatId);
    socket.to(data.chatId).emit('ice-candidate', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

app.get('/', (req, res) => {
  res.json({ message: 'TimeBank API is running!' });
});

const PORT = process.env.PORT || 5000;

// Start server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    console.log(`MongoDB connected: ${mongoURI}`);
  });
}

export { app, server, io }; // Export for testing