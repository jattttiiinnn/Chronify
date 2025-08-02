import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Typography, 
  Paper, 
  CircularProgress, 
  Grid, 
  Avatar, 
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Rating
} from '@mui/material';
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
import { useAuth } from '../../contexts/AuthContext';
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
  const { currentUser } = useAuth();
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

  const handleEndCall = () => {
    setShowVideoCall(false);
    // Refresh session data after call ends
    if (sessionId) {
      getSession(sessionId).then(setSession);
    }
  };

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

  const isTeacher = currentUser?.uid === session.teacher._id;
  const isStudent = currentUser?.uid === session.student._id;
  const canJoinCall = (isTeacher || isStudent) && 
                     ['confirmed', 'in-progress'].includes(session.status) &&
                     new Date(session.scheduledTime) <= new Date();
  const isInProgress = session.status === 'in-progress';
  const canStartSession = isTeacher && session.status === 'confirmed';
  const otherUser = isTeacher ? session.student : session.teacher;
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));

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

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              {session.title}
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              {session.description || 'No description provided.'}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box display="flex" alignItems="center" mb={2}>
                  <Person color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    With: {otherUser?.name || 'Unknown User'}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <CalendarToday color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(session.scheduledTime), 'PPP p')}
                  </Typography>
                </Box>
                
                <Box display="flex" alignItems="center" mb={2}>
                  <AccessTime color="action" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    {session.duration} minutes • {session.timeCredit} credits
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
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
              </Grid>
            </Grid>
            
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
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Session Notes & Materials
            </Typography>
            
            {session.notes ? (
              <Typography variant="body1" color="textSecondary">
                {session.notes}
              </Typography>
            ) : (
              <Typography variant="body2" color="textSecondary" fontStyle="italic">
                No notes or materials have been added to this session yet.
              </Typography>
            )}
            
            {session.attachments?.length > 0 && (
              <Box mt={2}>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments:
                </Typography>
                <Grid container spacing={1}>
                  {session.attachments.map((file: any) => (
                    <Grid item key={file._id}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<InsertDriveFile />}
                      >
                        {file.name}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {isTeacher ? 'Student' : 'Teacher'} Details
            </Typography>
            
            <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
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
        </Grid>
      </Grid>
      
      {/* Video Call Modal */}
      {showVideoCall && session.roomId && (
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
