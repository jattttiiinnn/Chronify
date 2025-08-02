import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Paper, 
  Tabs, 
  Tab, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  ListItemSecondaryAction,
  Button,
  Chip,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  AccessTime, 
  Person, 
  CalendarToday, 
  VideoCall,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  EventAvailable,
  History as HistoryIcon
} from '@mui/icons-material';
import { format, isFuture, isToday, parseISO, isBefore, isAfter } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getUserSessions } from '../../services/sessionService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
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
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
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

const SessionHistory: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        let status = '';
        
        if (tabValue === 0) {
          // Upcoming sessions
          status = 'upcoming';
        } else if (tabValue === 1) {
          // Completed sessions
          status = 'completed';
        } else if (tabValue === 2) {
          // All sessions
          status = '';
        }
        
        const data = await getUserSessions(status);
        setSessions(data.sessions || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching sessions:', err);
        setError('Failed to load sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [tabValue]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewSession = (sessionId: string) => {
    navigate(`/sessions/${sessionId}`);
  };

  const getSessionStatus = (session: any) => {
    const now = new Date();
    const startTime = new Date(session.scheduledTime);
    const endTime = new Date(startTime.getTime() + session.duration * 60000);
    
    if (session.status === 'cancelled') {
      return 'Cancelled';
    }
    
    if (session.status === 'completed') {
      return 'Completed';
    }
    
    if (isBefore(now, startTime)) {
      return 'Upcoming';
    }
    
    if (isAfter(now, startTime) && isBefore(now, endTime)) {
      return 'In Progress';
    }
    
    if (isAfter(now, endTime)) {
      return 'Ended';
    }
    
    return 'Scheduled';
  };

  const getStatusChip = (session: any) => {
    const status = getSessionStatus(session);
    
    switch (status.toLowerCase()) {
      case 'upcoming':
        return (
          <Chip 
            icon={<EventAvailable />} 
            label="Upcoming" 
            color="primary" 
            size="small" 
            variant="outlined"
          />
        );
      case 'in progress':
        return (
          <Chip 
            icon={<VideoCall />} 
            label="In Progress" 
            color="secondary" 
            size="small"
          />
        );
      case 'completed':
        return (
          <Chip 
            icon={<CheckCircle />} 
            label="Completed" 
            color="success" 
            size="small"
            variant="outlined"
          />
        );
      case 'cancelled':
        return (
          <Chip 
            icon={<Cancel />} 
            label="Cancelled" 
            color="error" 
            size="small"
            variant="outlined"
          />
        );
      case 'ended':
        return (
          <Chip 
            icon={<HistoryIcon />} 
            label="Ended" 
            color="default" 
            size="small"
            variant="outlined"
          />
        );
      default:
        return (
          <Chip 
            icon={<HourglassEmpty />} 
            label={status} 
            size="small"
            variant="outlined"
          />
        );
    }
  };

  const getSessionTime = (session: any) => {
    const date = new Date(session.scheduledTime);
    const isTodaySession = isToday(date);
    
    return (
      <Box>
        <Typography variant="body2" color="textSecondary">
          {isTodaySession ? 'Today' : format(date, 'PPP')}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {format(date, 'h:mm a')} - {format(new Date(date.getTime() + session.duration * 60000), 'h:mm a')}
        </Typography>
      </Box>
    );
  };

  const getSessionAction = (session: any) => {
    const status = getSessionStatus(session).toLowerCase();
    const isTeacher = currentUser?.uid === session.teacher._id;
    
    if (status === 'in progress' && session.roomId) {
      return (
        <Button 
          variant="contained" 
          color="primary" 
          size="small"
          startIcon={<VideoCall />}
          onClick={() => handleViewSession(session._id)}
        >
          Join Now
        </Button>
      );
    }
    
    if (status === 'upcoming' && isTeacher) {
      const sessionTime = new Date(session.scheduledTime);
      const now = new Date();
      const canStartEarly = sessionTime.getTime() - now.getTime() <= 15 * 60 * 1000; // 15 minutes before
      
      if (canStartEarly) {
        return (
          <Button 
            variant="outlined" 
            color="primary" 
            size="small"
            onClick={() => handleViewSession(session._id)}
          >
            Start Early
          </Button>
        );
      }
    }
    
    return (
      <Button 
        variant="outlined" 
        size="small"
        onClick={() => handleViewSession(session._id)}
      >
        View Details
      </Button>
    );
  };

  const renderSessionItem = (session: any) => {
    const sessionDate = parseISO(session.startTime);
    const isUpcoming = isFuture(sessionDate) || isToday(sessionDate);
    const isActive = isUpcoming && isBefore(new Date(), new Date(session.endTime));
    const isTeacher = currentUser?.uid === session.teacher?._id;
    const otherUser = isTeacher ? session.student : session.teacher;
    
    return (
      <React.Fragment key={session._id}>
        <ListItem 
          alignItems="flex-start"
          sx={{
            bgcolor: isActive ? 'action.hover' : 'background.paper',
            borderRadius: 1,
            mb: 1,
            '&:hover': {
              bgcolor: isActive ? 'action.selected' : 'action.hover',
            },
            transition: 'background-color 0.2s',
          }}
        >
          <ListItemAvatar>
            <Avatar 
              src={otherUser?.profilePicture} 
              alt={otherUser?.name}
              sx={{ width: 56, height: 56 }}
            />
          </ListItemAvatar>
          
          <ListItemText
            primary={
              <Box display="flex" alignItems="center" flexWrap="wrap">
                <Typography 
                  variant="subtitle1" 
                  component="span" 
                  sx={{ 
                    mr: 1,
                    fontWeight: isActive ? 600 : 'normal',
                  }}
                >
                  {session.title || `${isTeacher ? 'Teaching' : 'Learning'} ${session.skill}`}
                </Typography>
                {getStatusChip(session)}
              </Box>
            }
            secondary={
              <React.Fragment>
                <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} mt={0.5}>
                  <Box display="flex" alignItems="center" mr={isMobile ? 0 : 2} mb={isMobile ? 1 : 0}>
                    <Person color="action" fontSize="small" sx={{ mr: 0.5 }} />
                    <Typography variant="body2" color="text.secondary">
                      {otherUser?.name || 'Unknown User'}
                    </Typography>
                  </Box>
                  
                  <Box display="flex" alignItems="center">
                    <CalendarToday color="action" fontSize="small" sx={{ mr: 0.5 }} />
                    {getSessionTime(session)}
                  </Box>
                </Box>
                
                {session.description && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mt: 1,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {session.description}
                  </Typography>
                )}
              </React.Fragment>
            }
          />
          
          <ListItemSecondaryAction sx={{ right: 16, bottom: 16 }}>
            {getSessionAction(session)}
          </ListItemSecondaryAction>
        </ListItem>
        <Divider component="li" sx={{ my: 1 }} />
      </React.Fragment>
    );
  };

  return (
    <Paper elevation={0} sx={{ width: '100%', bgcolor: 'background.default' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="session history tabs"
          variant={isMobile ? 'fullWidth' : 'standard'}
        >
          <Tab label="Upcoming" {...a11yProps(0)} />
          <Tab label="Completed" {...a11yProps(1)} />
          <Tab label="All Sessions" {...a11yProps(2)} />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box textAlign="center" p={4}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        ) : sessions.length === 0 ? (
          <Box textAlign="center" p={4}>
            <EventAvailable color="disabled" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Upcoming Sessions
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              You don't have any upcoming sessions scheduled.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/find-teachers')}
            >
              Find a Teacher
            </Button>
          </Box>
        ) : (
          <List disablePadding>
            {sessions.map(renderSessionItem)}
          </List>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box textAlign="center" p={4}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        ) : sessions.length === 0 ? (
          <Box textAlign="center" p={4}>
            <HistoryIcon color="disabled" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Completed Sessions
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Your completed sessions will appear here.
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {sessions.map(renderSessionItem)}
          </List>
        )}
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box textAlign="center" p={4}>
            <Typography color="error">{error}</Typography>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => window.location.reload()}
              sx={{ mt: 2 }}
            >
              Retry
            </Button>
          </Box>
        ) : sessions.length === 0 ? (
          <Box textAlign="center" p={4}>
            <EventAvailable color="disabled" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h6" color="textSecondary" gutterBottom>
              No Sessions Found
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              You don't have any sessions scheduled yet.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => navigate('/find-teachers')}
            >
              Find a Teacher
            </Button>
          </Box>
        ) : (
          <List disablePadding>
            {sessions.map(renderSessionItem)}
          </List>
        )}
      </TabPanel>
    </Paper>
  );
};

export default SessionHistory;
