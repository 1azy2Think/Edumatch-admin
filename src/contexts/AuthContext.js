import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../utils/firebase';

// Create auth context
const AuthContext = createContext();

// Context provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear any previous errors when performing a new auth action
  const clearError = () => setError(null);

  // Login with email and password
  const login = async (email, password) => {
    clearError();
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      setError(formatAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Register a new user
  const register = async (email, password) => {
    clearError();
    try {
      setLoading(true);
      await createUserWithEmailAndPassword(auth, email, password);
      return true;
    } catch (err) {
      setError(formatAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Log out
  const logout = async () => {
    clearError();
    try {
      setLoading(true);
      await signOut(auth);
      return true;
    } catch (err) {
      setError(formatAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    clearError();
    try {
      setLoading(true);
      await sendPasswordResetEmail(auth, email);
      return true;
    } catch (err) {
      setError(formatAuthError(err));
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Format firebase auth errors into user-friendly messages
  const formatAuthError = (error) => {
    const errorCode = error.code;
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
        return 'No user found with this email address.';
      case 'auth/wrong-password':
        return 'Incorrect password.';
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/weak-password':
        return 'The password is too weak.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return error.message || 'An unknown error occurred.';
    }
  };

  // Subscribe to auth state changes when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};