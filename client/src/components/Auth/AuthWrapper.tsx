import React from 'react';
import { Box, Container, Paper, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import LoginButton from './LoginButton';
import UserProfile from './UserProfile';

interface AuthWrapperProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, requireAuth = true }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  // If authentication is required but user is not logged in
  if (requireAuth && !currentUser) {
    return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
            <Typography component="h1" variant="h5" gutterBottom>
              Sign in to continue
            </Typography>
            <Box mt={4}>
              <LoginButton />
            </Box>
          </Paper>
        </Box>
      </Container>
    );
  }

  // If user is logged in or auth is not required, render children
  return <>{children}</>;
};

export default AuthWrapper;
