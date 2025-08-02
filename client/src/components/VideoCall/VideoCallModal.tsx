import React from 'react';
import { Modal, Box, IconButton, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import VideoCall from './VideoCall';

interface VideoCallModalProps {
  open: boolean;
  onClose: () => void;
  roomId: string;
  sessionId: string;
  userId: string;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  open,
  onClose,
  roomId,
  sessionId,
  userId,
}) => {
  return (
    <Modal
      open={open}
      onClose={onClose}
      aria-labelledby="video-call-modal"
      aria-describedby="video-call-interface"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        outline: 'none',
      }}
      disableEscapeKeyDown
    >
      <Box
        sx={{
          position: 'relative',
          width: '95vw',
          height: '90vh',
          maxWidth: 1600,
          maxHeight: 900,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography variant="h6">Video Call</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Video Call Component */}
        <Box sx={{ flex: 1, position: 'relative', backgroundColor: '#1a1a1a' }}>
          <VideoCall roomId={roomId} userId={userId} onEndCall={onClose} />
        </Box>

        {/* Footer */}
        <Box
          sx={{
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            textAlign: 'center',
          }}
        >
          <Typography variant="caption" color="textSecondary">
            Session ID: {sessionId} • Room: {roomId}
          </Typography>
        </Box>
      </Box>
    </Modal>
  );
};

export { VideoCallModal };
