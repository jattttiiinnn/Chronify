import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useVideoCall from '../../hooks/useVideoCall';
import { Box, Button, Typography, CircularProgress, IconButton, Paper, Grid } from '@mui/material';
import { CallEnd, Mic, MicOff, Videocam, VideocamOff } from '@mui/icons-material';

export interface UserVideo {
  userId: string;
  stream: MediaStream;
}

interface VideoCallProps {
  roomId: string;
  userId: string;
  onEndCall: () => void;
}

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

const VideoCall: React.FC<VideoCallProps> = ({ roomId, userId, onEndCall }) => {
  const { currentUser } = useAuth();
  const {
    localStream,
    remoteStreams,
    isCallActive,
    isLoading,
    error,
    userVideoRef,
    joinCall,
    leaveCall,
  } = useVideoCall(roomId, userId);
  
  const [isMuted, setIsMuted] = React.useState(false);
  const [isVideoOff, setIsVideoOff] = React.useState(false);
  const remoteVideosRef = useRef<{[key: string]: HTMLVideoElement | null}>({});

  // Join the call when component mounts
  useEffect(() => {
    if (roomId && currentUser?.uid) {
      joinCall();
    }
    
    return () => {
      leaveCall();
    };
  }, [roomId, currentUser?.uid, joinCall, leaveCall]);

  // Handle muting audio
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Handle turning video on/off
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  // Set up remote video elements
  useEffect(() => {
    remoteStreams.forEach(({ userId, stream }) => {
      const video = remoteVideosRef.current[userId];
      if (video && stream) {
        video.srcObject = stream;
      }
    });
  }, [remoteStreams]);

  const handleEndCall = () => {
    leaveCall();
    onEndCall();
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Box textAlign="center">
          <CircularProgress />
          <Typography variant="h6" mt={2}>
            Joining call...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="error" variant="h6">
          Error: {error}
        </Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Main video area */}
      <Box sx={{ flex: 1, position: 'relative', backgroundColor: '#1a1a1a', borderRadius: 2, overflow: 'hidden' }}>
        {/* Remote videos */}
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: remoteStreams.length > 1 ? '1fr 1fr' : '1fr' }, gap: 2, p: 2, height: '100%' }}>
          {remoteStreams.map(({ userId }) => (
            <Box key={userId} sx={{ position: 'relative', height: '100%', minHeight: '200px' }}>
              <Paper sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
                <video
                  ref={el => remoteVideosRef.current[userId] = el}
                  autoPlay
                  playsInline
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Box 
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    color: 'white',
                    px: 1,
                    borderRadius: 1,
                  }}
                >
                  User {userId.substring(0, 6)}
                </Box>
              </Paper>
            </Box>
          ))}
          
          {/* Local video */}
          {isCallActive && (
            <Box
              sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                width: '25%',
                minWidth: 200,
                maxWidth: 300,
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 3,
                zIndex: 10,
              }}
            >
              <video
                ref={userVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', display: 'block' }}
              />
            </Box>
          )}
        </Box>
      </Box>
      
      {/* Call controls */}
      <Box sx={{ py: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
        <IconButton
          onClick={toggleMute}
          sx={{
            backgroundColor: isMuted ? '#ff4444' : '#f5f5f5',
            '&:hover': {
              backgroundColor: isMuted ? '#cc0000' : '#e0e0e0',
            },
          }}
        >
          {isMuted ? <MicOff /> : <Mic />}
        </IconButton>
        
        <IconButton
          onClick={handleEndCall}
          sx={{
            backgroundColor: '#ff4444',
            color: 'white',
            '&:hover': {
              backgroundColor: '#cc0000',
            },
            width: 56,
            height: 56,
          }}
        >
          <CallEnd />
        </IconButton>
        
        <IconButton
          onClick={toggleVideo}
          sx={{
            backgroundColor: isVideoOff ? '#ff4444' : '#f5f5f5',
            '&:hover': {
              backgroundColor: isVideoOff ? '#cc0000' : '#e0e0e0',
            },
          }}
        >
          {isVideoOff ? <VideocamOff /> : <Videocam />}
        </IconButton>
      </Box>
    </Box>
  );
};

export { VideoCall };
