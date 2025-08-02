import React from 'react';
import { Button, CircularProgress } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import GoogleIcon from '@mui/icons-material/Google';

const LoginButton: React.FC = () => {
  const { signIn, loading } = useAuth();

  const handleLogin = async () => {
    try {
      const { error } = await signIn();
      if (error) {
        console.error('Login error:', error);
        // Handle error (show toast, etc.)
      }
    } catch (err) {
      console.error('Unexpected error during login:', err);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleLogin}
      disabled={loading}
      startIcon={loading ? <CircularProgress size={20} /> : <GoogleIcon />}
      sx={{
        backgroundColor: '#4285F4',
        color: 'white',
        '&:hover': {
          backgroundColor: '#357ABD',
        },
      }}
    >
      {loading ? 'Signing in...' : 'Continue with Google'}
    </Button>
  );
};

export default LoginButton;
