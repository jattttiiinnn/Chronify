import { useState, useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface UserVideo {
  userId: string;
  stream: MediaStream;
}

const useVideoCall = (roomId: string, userId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<UserVideo[]>([]);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<{ [key: string]: RTCPeerConnection }>({});
  const userVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<{ userId: string; socketId: string }[]>([]);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000');
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Get user media
  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      if (userVideoRef.current) {
        userVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setError('Could not access camera/microphone');
      return null;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((socketId: string, userId: string) => {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        // Add TURN servers here if needed
      ],
    });

    // Add local stream to peer connection
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      setRemoteStreams((prevStreams) => {
        // Check if we already have a stream for this user
        if (!prevStreams.some((stream) => stream.userId === userId)) {
          return [...prevStreams, { userId, stream: event.streams[0] }];
        }
        return prevStreams;
      });
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('signal', {
          to: socketId,
          signal: {
            candidate: event.candidate,
            userId,
          },
        });
      }
    };

    peerConnections.current[socketId] = peerConnection;
    return peerConnection;
  }, [localStream]);

  // Join room and set up signaling
  const joinRoom = useCallback(async () => {
    if (!socketRef.current) return;

    try {
      const stream = await getLocalStream();
      if (!stream) return;

      setIsLoading(true);
      setError(null);

      // Join the room
      socketRef.current.emit('join-room', { roomId, userId });

      // Handle incoming users
      socketRef.current.on('user-connected', async ({ userId: newUserId, socketId }) => {
        // Create a new peer connection for the new user
        const peerConnection = createPeerConnection(socketId, newUserId);
        
        // Create an offer
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);

        // Send the offer to the new user
        socketRef.current?.emit('signal', {
          to: socketId,
          signal: {
            sdp: peerConnection.localDescription,
            userId,
          },
        });
      });

      // Handle incoming signals
      socketRef.current.on('signal', async ({ signal, from }) => {
        const peerConnection = peerConnections.current[from] || createPeerConnection(from, '');

        if (signal.sdp) {
          // This is an offer or answer
          await peerConnection.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          
          // If it's an offer, create an answer
          if (signal.sdp.type === 'offer') {
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);
            
            socketRef.current?.emit('signal', {
              to: from,
              signal: {
                sdp: peerConnection.localDescription,
                userId,
              },
            });
          }
        } else if (signal.candidate) {
          // This is an ICE candidate
          try {
            await peerConnection.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } catch (err) {
            console.error('Error adding ICE candidate:', err);
          }
        }
      });

      // Handle user disconnection
      socketRef.current.on('user-disconnected', ({ userId: disconnectedUserId, socketId }) => {
        if (peerConnections.current[socketId]) {
          peerConnections.current[socketId].close();
          delete peerConnections.current[socketId];
        }
        
        setRemoteStreams((prevStreams) => 
          prevStreams.filter((stream) => stream.userId !== disconnectedUserId)
        );
      });

      // Get existing users in the room
      socketRef.current.on('users-in-room', ({ users }) => {
        users.forEach(async (user: { userId: string; socketId: string }) => {
          if (user.socketId === socketRef.current?.id) return;
          
          const peerConnection = createPeerConnection(user.socketId, user.userId);
          
          // Create an offer for each existing user
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          
          socketRef.current?.emit('signal', {
            to: user.socketId,
            signal: {
              sdp: peerConnection.localDescription,
              userId,
            },
          });
        });
      });

      setIsCallActive(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error joining room:', err);
      setError('Failed to join the call');
      setIsLoading(false);
    }
  }, [roomId, userId, createPeerConnection, getLocalStream]);

  // Leave the call and clean up
  const leaveCall = useCallback(() => {
    // Stop all tracks in the local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    Object.values(peerConnections.current).forEach(pc => pc.close());
    peerConnections.current = {};
    
    // Reset state
    setLocalStream(null);
    setRemoteStreams([]);
    setIsCallActive(false);
    
    // Notify server we're leaving
    if (socketRef.current) {
      socketRef.current.emit('leave-room', { roomId, userId });
    }
  }, [localStream, roomId, userId]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      leaveCall();
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [leaveCall]);

  return {
    localStream,
    remoteStreams,
    isCallActive,
    isLoading,
    error,
    userVideoRef,
    joinCall: joinRoom,
    leaveCall,
  };
};

export default useVideoCall;
