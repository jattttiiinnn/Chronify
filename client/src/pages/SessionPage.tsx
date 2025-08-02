import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Grid, 
  Paper, 
  Tabs, 
  Tab, 
  Typography, 
  CircularProgress,
  useTheme,
  useMediaQuery,
  IconButton,
  Button,
  Avatar
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import SessionDetail from '../components/Session/SessionDetail';
import SessionChat from '../components/Session/SessionChat';
import SessionHistory from '../components/Session/SessionHistory';
import { getSession } from '../services/sessionService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  dir?: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`session-tabpanel-${index}`}
      aria-labelledby={`session-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && (
        <Box sx={{ p: 0, height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `session-tab-${index}`,
    'aria-controls': `session-tabpanel-${index}`,
  };
}

const SessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [tabValue, setTabValue] = useState(0);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      
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

    fetchSession();
  }, [sessionId]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSessionUpdated = (updatedSession: any) => {
    setSession(updatedSession);
  };

  const handleNewMessage = () => {
    // Refresh session data when a new message is sent
    if (sessionId) {
      getSession(sessionId).then(updatedSession => {
        setSession(updatedSession);
      });
    }
  };

  // If no sessionId is provided, show the session history
  if (!sessionId) {
    return <SessionHistory />;
  }

  if (loading) {
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
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (!session) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" gutterBottom>
          Session not found
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/sessions')}
        >
          Back to Sessions
        </Button>
      </Box>
    );
  }

  // Check if the current user is a participant in this session
  const isParticipant = currentUser && 
    (currentUser.uid === session.teacher._id || currentUser.uid === session.student._id);

  if (!isParticipant) {
    return (
      <Box textAlign="center" p={4}>
        <Typography variant="h6" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" paragraph>
          You don't have permission to view this session.
        </Typography>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => navigate('/sessions')}
        >
          Back to Your Sessions
        </Button>
      </Box>
    );
  }

  const isTeacher = currentUser?.uid === session.teacher._id;
  const otherUser = isTeacher ? session.student : session.teacher;

  return (
    <Box sx={{ width: '100%', height: '100%' }}>
      {/* Header */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Box display="flex" alignItems="center" p={2}>
          <IconButton 
            onClick={() => navigate(-1)} 
            size="large"
            sx={{ mr: 1 }}
          >
            <ArrowBack />
          </IconButton>
          
          <Typography variant="h5" component="h1">
            {session.title || `${isTeacher ? 'Teaching' : 'Learning'} ${session.skill}`}
          </Typography>
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="session tabs"
            sx={{ ml: 'auto' }}
            variant={isMobile ? 'fullWidth' : 'standard'}
          >
            <Tab label="Details" {...a11yProps(0)} />
            <Tab label="Chat" {...a11yProps(1)} />
          </Tabs>
        </Box>
      </Box>
      
      {/* Main Content */}
      <Box sx={{ height: 'calc(100% - 80px)' }}>
        <TabPanel value={tabValue} index={0}>
          <SessionDetail 
            sessionId={session._id} 
            onSessionUpdated={handleSessionUpdated} 
          />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ 
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.paper',
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
          }}>
            <Box 
              sx={{ 
                p: 2, 
                borderBottom: '1px solid', 
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Box display="flex" alignItems="center">
                <Avatar 
                  src={otherUser?.profilePicture} 
                  alt={otherUser?.name}
                  sx={{ width: 40, height: 40, mr: 2 }}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {otherUser?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {session.skill}
                  </Typography>
                </Box>
              </Box>
            </Box>
            
            <Box flex={1} overflow="auto">
              <SessionChat 
                sessionId={session._id} 
                onNewMessage={handleNewMessage}
              />
            </Box>
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
};

export default SessionPage;
