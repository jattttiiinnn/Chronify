import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  TextField, 
  IconButton, 
  Paper, 
  Typography, 
  Avatar, 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Divider,
  CircularProgress
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { getSessionMessages, sendMessage as sendMessageApi } from '../../services/sessionService';

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface SessionChatProps {
  sessionId: string;
  onNewMessage?: () => void;
}

const SessionChat: React.FC<SessionChatProps> = ({ sessionId, onNewMessage }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAuth();

  // Fetch messages when the component mounts or sessionId changes
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const data = await getSessionMessages(sessionId);
        setMessages(data.messages || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to load messages');
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchMessages();
    }
  }, [sessionId]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      const messageContent = newMessage.trim();
      
      // Optimistically add the message to the UI
      const tempId = `temp-${Date.now()}`;
      const tempMessage: Message = {
        _id: tempId,
        content: messageContent,
        sender: {
          _id: currentUser?.uid || '',
          name: currentUser?.displayName || 'You',
          profilePicture: currentUser?.photoURL || '',
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage('');
      
      // Send the message to the server
      const response = await sendMessageApi(sessionId, messageContent);
      
      // Replace the temporary message with the one from the server
      setMessages(prev => 
        prev.map(msg => msg._id === tempId ? response.message : msg)
      );
      
      // Notify parent component of new message
      if (onNewMessage) {
        onNewMessage();
      }
      
      // Scroll to bottom after sending
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
      
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => !msg._id.startsWith('temp-')));
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={2} textAlign="center">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      height="100%"
      bgcolor="background.paper"
      borderRadius={1}
      overflow="hidden"
    >
      {/* Messages container */}
      <Box 
        flex={1} 
        p={2} 
        overflow="auto"
        bgcolor="background.default"
      >
        {messages.length === 0 ? (
          <Box 
            display="flex" 
            justifyContent="center" 
            alignItems="center" 
            height="100%"
            textAlign="center"
            color="text.secondary"
          >
            <Typography variant="body2">
              No messages yet. Send a message to start the conversation.
            </Typography>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {messages.map((message, index) => {
              const isCurrentUser = message.sender._id === currentUser?.uid;
              const showHeader = index === 0 || 
                messages[index - 1].sender._id !== message.sender._id ||
                (new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime()) > 5 * 60 * 1000; // 5 minutes
              
              return (
                <React.Fragment key={message._id}>
                  {showHeader && index > 0 && <Divider sx={{ my: 1 }} />}
                  
                  <ListItem 
                    alignItems="flex-start"
                    sx={{
                      flexDirection: isCurrentUser ? 'row-reverse' : 'row',
                      textAlign: isCurrentUser ? 'right' : 'left',
                      pl: isCurrentUser ? 2 : 1,
                      pr: isCurrentUser ? 1 : 2,
                    }}
                  >
                    {!isCurrentUser && showHeader && (
                      <ListItemAvatar>
                        <Avatar 
                          alt={message.sender.name} 
                          src={message.sender.profilePicture}
                          sx={{ width: 32, height: 32 }}
                        />
                      </ListItemAvatar>
                    )}
                    
                    <Box 
                      sx={{
                        maxWidth: '70%',
                        ml: isCurrentUser ? 0 : 1,
                        mr: isCurrentUser ? 1 : 0,
                      }}
                    >
                      {showHeader && !isCurrentUser && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          display="block"
                          textAlign={isCurrentUser ? 'right' : 'left'}
                          mb={0.5}
                        >
                          {message.sender.name}
                        </Typography>
                      )}
                      
                      <Paper
                        elevation={0}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: isCurrentUser ? 'primary.main' : 'grey.100',
                          color: isCurrentUser ? 'primary.contrastText' : 'text.primary',
                          display: 'inline-block',
                          textAlign: 'left',
                        }}
                      >
                        <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                          {message.content}
                        </Typography>
                        
                        <Typography 
                          variant="caption" 
                          display="block" 
                          textAlign="right"
                          mt={0.5}
                          sx={{
                            color: isCurrentUser ? 'rgba(255, 255, 255, 0.7)' : 'text.secondary',
                            fontSize: '0.65rem',
                          }}
                        >
                          {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                        </Typography>
                      </Paper>
                    </Box>
                  </ListItem>
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>
      
      {/* Message input */}
      <Box 
        component="form" 
        onSubmit={handleSendMessage}
        sx={{ 
          p: 2, 
          borderTop: '1px solid', 
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box display="flex" alignItems="center">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 4,
                pr: 1,
              },
            }}
            disabled={sending}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            multiline
            maxRows={4}
          />
          
          <IconButton 
            color="primary" 
            type="submit" 
            disabled={!newMessage.trim() || sending}
            sx={{ ml: 1 }}
          >
            {sending ? <CircularProgress size={24} /> : <Send />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default SessionChat;
