import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff } from 'lucide-react';
import io from 'socket.io-client';
import { Socket } from 'socket.io-client';

interface VideoCallProps {
  chatId: string;
  otherParticipant?: { _id: string; name: string };
  onClose: () => void;
}

export default function VideoCall({ chatId, otherParticipant, onClose }: VideoCallProps) {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isInitiator, setIsInitiator] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);
    console.log('VideoCall: Socket created for chat:', chatId);

    newSocket.emit('join-chat', chatId);
    console.log('VideoCall: Joined chat room:', chatId);

    newSocket.on('connect', () => {
      console.log('VideoCall: Socket connected');
      // Initialize WebRTC after socket connects
      initializeWebRTC();
    });

    newSocket.on('video-call-offer', handleOffer);
    newSocket.on('video-call-answer', handleAnswer);
    newSocket.on('ice-candidate', handleIceCandidate);

    return () => {
      cleanup();
      newSocket.disconnect();
      console.log('VideoCall: Socket disconnected and cleaned up');
    };
  }, [chatId]);

  const initializeWebRTC = async () => {
    console.log('VideoCall: Initializing WebRTC...');
    try {
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      console.log('VideoCall: Got user media stream');
      
      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Create peer connection
      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });
      console.log('VideoCall: Created peer connection');

      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
        console.log('VideoCall: Added track to peer connection:', track.kind);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        console.log('VideoCall: Received remote track:', event.track.kind);
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
          setIsConnected(true);
          console.log('VideoCall: Remote video stream set, connection established');
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate && socket) {
          console.log('VideoCall: Sending ICE candidate');
          socket.emit('ice-candidate', {
            chatId,
            candidate: event.candidate
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        console.log('VideoCall: Connection state changed to:', peerConnection.connectionState);
        if (peerConnection.connectionState === 'connected') {
          setIsConnected(true);
        } else if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'disconnected') {
          setIsConnected(false);
        }
      };

      // Set as initiator and create offer after a short delay
      setIsInitiator(true);
      setTimeout(createOffer, 1000);

    } catch (error) {
      console.error('Error initializing WebRTC:', error);
      alert('Could not access camera/microphone. Please check permissions.');
    }
  };

  const createOffer = async () => {
    console.log('VideoCall: Creating offer...');
    try {
      if (!peerConnectionRef.current || !socket) return;

      const offer = await peerConnectionRef.current.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await peerConnectionRef.current.setLocalDescription(offer);
      console.log('VideoCall: Local description set, sending offer');
      
      socket.emit('video-call-offer', {
        chatId,
        offer
      });
    } catch (error) {
      console.error('VideoCall: Error creating offer:', error);
    }
  };

  const handleOffer = async (data: any) => {
    console.log('VideoCall: Received offer, creating answer...');
    try {
      if (!peerConnectionRef.current) return;

      await peerConnectionRef.current.setRemoteDescription(data.offer);
      console.log('VideoCall: Remote description set');
      
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      console.log('VideoCall: Local description set, sending answer');

      if (socket) {
        socket.emit('video-call-answer', {
          chatId,
          answer
        });
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  };

  const handleAnswer = async (data: any) => {
    console.log('VideoCall: Received answer, setting remote description...');
    try {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.setRemoteDescription(data.answer);
      console.log('VideoCall: Remote description set from answer');
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  };

  const handleIceCandidate = async (data: any) => {
    console.log('VideoCall: Received ICE candidate');
    try {
      if (!peerConnectionRef.current) return;
      await peerConnectionRef.current.addIceCandidate(data.candidate);
      console.log('VideoCall: ICE candidate added successfully');
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOn(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioOn(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    cleanup();
    onClose();
  };

  const cleanup = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      console.log('VideoCall: Local stream tracks stopped');
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      console.log('VideoCall: Peer connection closed');
    }
  };

  return (
    <div className="h-full bg-gray-900 relative">
      {/* Remote Video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />
      
      {/* Local Video */}
      <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden">
        <video
          ref={localVideoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Connecting to {otherParticipant?.name}...</p>
          <p className="text-sm mt-2 opacity-75">
            {isInitiator ? 'Initiating call...' : 'Joining call...'}
          </p>
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        <button
          onClick={toggleVideo}
          className={`p-4 rounded-full ${
            isVideoOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          } text-white transition-colors`}
        >
          {isVideoOn ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
        </button>
        
        <button
          onClick={toggleAudio}
          className={`p-4 rounded-full ${
            isAudioOn ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
          } text-white transition-colors`}
        >
          {isAudioOn ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
        </button>
        
        <button
          onClick={endCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <PhoneOff className="h-6 w-6" />
        </button>
      </div>

      {/* Participant Info */}
      <div className="absolute top-4 left-4 text-white">
        <h3 className="text-lg font-semibold">{otherParticipant?.name}</h3>
        <p className="text-sm opacity-75">
          {isConnected ? 'Connected' : 'Connecting...'}
        </p>
        <p className="text-xs opacity-50">
          Role: {isInitiator ? 'Caller' : 'Receiver'}
        </p>
      </div>
    </div>
  );
}