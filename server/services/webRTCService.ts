import { Server as SocketIOServer, Socket } from 'socket.io';
import { Types } from 'mongoose';

interface PeerConnection {
  socketId: string;
  userId: Types.ObjectId;
}

interface Room {
  peers: Map<string, PeerConnection>;
}

class WebRTCService {
  private io: SocketIOServer;
  private rooms: Map<string, Room> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log('New client connected:', socket.id);

      socket.on('join-room', async ({ roomId, userId }) => {
        try {
          if (!this.rooms.has(roomId)) {
            this.rooms.set(roomId, { peers: new Map() });
          }

          const room = this.rooms.get(roomId)!;
          
          // Add user to room
          room.peers.set(socket.id, {
            socketId: socket.id,
            userId: new Types.ObjectId(userId)
          });

          // Join the socket room
          await socket.join(roomId);
          
          // Notify other users in the room
          socket.to(roomId).emit('user-connected', { userId, socketId: socket.id });

          // Send list of existing users to the new user
          const users = Array.from(room.peers.entries())
            .filter(([id]) => id !== socket.id)
            .map(([_, peer]) => ({
              userId: peer.userId,
              socketId: peer.socketId
            }));

          socket.emit('users-in-room', { users });
        } catch (error) {
          console.error('Error joining room:', error);
          socket.emit('error', { message: 'Failed to join room' });
        }
      });

      // Handle WebRTC signaling
      socket.on('signal', ({ to, signal }) => {
        socket.to(to).emit('signal', {
          signal,
          from: socket.id
        });
      });

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove user from all rooms
        this.rooms.forEach((room, roomId) => {
          if (room.peers.has(socket.id)) {
            const peer = room.peers.get(socket.id)!;
            room.peers.delete(socket.id);
            
            // Notify other users in the room
            socket.to(roomId).emit('user-disconnected', {
              userId: peer.userId,
              socketId: socket.id
            });
          }
        });
      });
    });
  }
}

export default WebRTCService;
