import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthContext from '../../contexts/AuthContext';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  Avatar, 
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Rating,
  useMediaQuery,
  useTheme,
  Grid // Using stable Grid component
} from '@mui/material';
import { VideoCallModal } from '../VideoCall/VideoCallModal'; // Named import for VideoCallModal
import { 
  AccessTime, 
  Person, 
  CalendarToday, 
  VideoCall, 
  ArrowBack,
  Info,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  LocationOn,
  InsertDriveFile,
  Refresh
} from '@mui/icons-material';
import { format } from 'date-fns';
// Remove duplicate import
import { getSession, startSession as startSessionCall } from '../../services/sessionService';

interface StartSessionParams {
  sessionId: string;
  roomId: string;
}

interface SessionDetailProps {
  sessionId: string;
  onSessionUpdated?: (updatedSession: any) => void;
}

const SessionDetail: React.FC<SessionDetailProps> = ({ sessionId, onSessionUpdated }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const { currentUser } = useContext(AuthContext) || {};
  const navigate = useNavigate();

  useEffect(() => {
    const loadSession = async () => {
      try {
        setLoading(true);
        const data = await getSession(sessionId);
        setSession(data);
        setError(null);
      } catch (err) {
        console.error('Error loading session:', err);
        setError('Failed to load session details');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [sessionId]);

  const handleStartSession = async () => {
    try {
      setLoading(true);
      // Generate a unique room ID for the video call
      const roomId = `room-${sessionId}-${Date.now()}`;
      const updatedSession = await startSessionCall({ sessionId, roomId });
      setSession(updatedSession);
      setShowVideoCall(true);
      
      // Notify parent component about the session update
      if (onSessionUpdated) {
        onSessionUpdated(updatedSession);
      }
    } catch (err) {
      console.error('Error starting session:', err);
      setError('Failed to start the session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndCall = useCallback(() => {
    setShowVideoCall(false);
    // Refresh session data after call ends
    if (sessionId) {
      getSession(sessionId).then(updatedSession => {
        setSession(updatedSession);
      });
    }
  }, [sessionId]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip icon={<HourglassEmpty />} label="Pending" color="default" size="small" />;
      case 'confirmed':
        return <Chip icon={<CheckCircle />} label="Confirmed" color="primary" size="small" />;
      case 'in-progress':
        return <Chip icon={<VideoCall />} label="In Progress" color="secondary" size="small" />;
      case 'completed':
        return <Chip icon={<CheckCircle />} label="Completed" color="success" size="small" />;
      case 'cancelled':
        return <Chip icon={<Cancel />} label="Cancelled" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  if (loading && !session) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" p={4}>
        <Typography color="error" variant="h6" gutterBottom>
          {error}
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => window.location.reload()}
          startIcon={<Refresh />}
        >
          Refresh
        </Button>
      </Box>
    );
  }

  if (!session) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6">Session not found</Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate(-1)}
          startIcon={<ArrowBack />}
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Box>
    );
  }

  const isTeacher = currentUser?.uid === session?.teacher?._id;
  const isStudent = currentUser?.uid === session?.student?._id;
  const canJoinCall = (isTeacher || isStudent) && 
                     session?.status && 
                     ['confirmed', 'in-progress'].includes(session.status) &&
                     new Date(session.scheduledTime) <= new Date();
  const isInProgress = session?.status === 'in-progress';
  const canStartSession = isTeacher && session?.status === 'confirmed';
  const otherUser = isTeacher ? session?.student : session?.teacher;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ maxWidth: 1200, margin: '0 auto', p: 3 }}>
      <Box mb={3} display="flex" alignItems="center">
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Session Details
        </Typography>
        <Box ml="auto">
          {getStatusChip(session.status)}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        <Box sx={{ flex: 2 }}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {session.title}
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              {session.description || 'No description provided.'}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <Person color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Student:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                    {session.student.name}
                  </Typography>
                </Box>

                <Box display="flex" alignItems="center" mb={2}>
                  <AccessTime color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Duration:
                  </Typography>
                  <Typography variant="body2" sx={{ ml: 1, fontWeight: 'medium' }}>
                    {session.duration} minutes
                  </Typography>
                </Box>
              </Box>
              
              <Box>
                <Box display="flex" alignItems="center" mb={2}>
                  <Info color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Skill: {session.skill}
                  </Typography>
                </Box>
                
                {session.location?.type === 'online' && session.roomId && (
                  <Box display="flex" alignItems="center" mb={2}>
                    <VideoCall color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      Online Session
                    </Typography>
                  </Box>
                )}
                
                {session.location?.type === 'in-person' && session.location?.address && (
                  <Box display="flex" alignItems="center" mb={2}>
                    <LocationOn color="action" sx={{ mr: 1 }} />
                    <Typography variant="body2" color="textSecondary">
                      {session.location.address}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
            
            <Box mt={3} display="flex" gap={2} flexWrap="wrap">
              {canJoinCall && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<VideoCall />}
                  onClick={handleStartSession}
                  disabled={loading}
                >
                  {isInProgress ? 'Join Session' : 'Start Session'}
                </Button>
              )}
              
              {canStartSession && (
                <Tooltip title="Only the teacher can start the session">
                  <span>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<VideoCall />}
                      onClick={handleStartSession}
                      disabled={loading}
                    >
                      Start Session
                    </Button>
                  </span>
                </Tooltip>
              )}
              
              {session.status === 'completed' && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(`/sessions/${sessionId}/review`)}
                >
                  Leave a Review
                </Button>
              )}
            </Box>
          </Paper>
          
          {/* Session Notes & Materials Section */}
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Session Notes & Materials
            </Typography>
            
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 2 }}>
              {session.notes && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Session Notes
                  </Typography>
                  <Typography variant="body2">
                    {session.notes}
                  </Typography>
                </Paper>
              )}
              {session.feedback && (
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Feedback
                  </Typography>
                  <Typography variant="body2">
                    {session.feedback}
                  </Typography>
                </Paper>
              )}
            </Box>
            
            {session.attachments?.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {session.attachments.map((file: any) => (
                    <Button 
                      key={file._id} 
                      variant="outlined" 
                      size="small"
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      startIcon={<InsertDriveFile />}
                    >
                      {file.name}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}
            
            </Paper>
            
            {/* User Profile Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Box>
              <Box display="flex" alignItems="center" mb={2}>
                <Info color="action" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Skill: {session.skill}
                </Typography>
              </Box>
              <Avatar 
                src={otherUser?.profilePicture} 
                alt={otherUser?.name}
                sx={{ width: 100, height: 100, mb: 2 }}
              />
              <Typography variant="h6">
                {otherUser?.name || 'Unknown User'}
              </Typography>
              
              {otherUser?.rating && (
                <Box display="flex" alignItems="center" mt={1} mb={2}>
                  <Rating 
                    value={otherUser.rating} 
                    precision={0.5} 
                    readOnly 
                    size="small"
                  />
                  <Typography variant="body2" color="textSecondary" ml={1}>
                    ({otherUser.ratingCount || 0} reviews)
                  </Typography>
                </Box>
              )}
              
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => navigate(`/profile/${otherUser?._id}`)}
                startIcon={<Person />}
              >
                View Profile
              </Button>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Box>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                About {isTeacher ? 'Student' : 'Teacher'}:
              </Typography>
              <Typography variant="body2" paragraph>
                {otherUser?.bio || 'No bio provided.'}
              </Typography>
              
              {otherUser?.skills?.length > 0 && (
                <>
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    Skills:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                    {otherUser.skills.map((skill: any) => (
                      <Chip 
                        key={skill._id} 
                        label={`${skill.name} (${skill.level})`} 
                        size="small"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </>
              )}
            </Box>
          </Paper>
          
          {/* Session Actions */}
          {isTeacher && session.status === 'pending' && (
            <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Session Actions
              </Typography>
              
              <Box display="flex" gap={2} flexWrap="wrap">
                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={() => navigate(`/sessions/${sessionId}/reschedule`)}
                  fullWidth
                >
                  Reschedule
                </Button>
                
                <Button 
                  variant="outlined" 
                  color="error"
                  onClick={() => navigate(`/sessions/${sessionId}/cancel`)}
                  fullWidth
                >
                  Cancel Session
                </Button>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
      
      {/* Video Call Modal */}
      {showVideoCall && session?.roomId && (
        <VideoCallModal
          open={showVideoCall}
          onClose={handleEndCall}
          roomId={session.roomId}
          sessionId={session._id}
          userId={currentUser?.uid || ''}
        />
      )}
    </Box>
  );
};

export default SessionDetail;
