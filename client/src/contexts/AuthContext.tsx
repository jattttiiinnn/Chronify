import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { auth, signInWithGoogle, signOut } from '../config/firebase';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  signIn: () => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  signIn: async () => ({ user: null, error: null }),
  signOut: async () => ({ error: null }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Handle auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setCurrentUser(user);
      setLoading(false);
      
      // If user is logged in, you can also sync with your backend here
      if (user) {
        // Optionally sync user data with your backend
        syncUserWithBackend(user);
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { user, error } = await signInWithGoogle();
      return { user, error };
    } finally {
      setLoading(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await signOut();
      return { error };
    } finally {
      setLoading(false);
    }
  };

  // Sync user data with backend
  const syncUserWithBackend = async (user: User) => {
    try {
      const idToken = await user.getIdToken();
      // Call your backend API to sync user data
      await fetch(`${import.meta.env.VITE_API_URL}/api/users/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        })
      });
    } catch (error) {
      console.error('Error syncing user with backend:', error);
    }
  };

  const value = {
    currentUser,
    loading,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
