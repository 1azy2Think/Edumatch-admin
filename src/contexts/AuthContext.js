import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Create auth context
const AuthContext = createContext();

// Context provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clear any previous errors when performing a new auth action
  const clearError = () => setError(null);

  // Login with email and password
  const login = async (email, password) => {
    clearError();
    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Fetch user role from Firestore
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserRole(userData.role || 'user');
        
        // Check if account is active
        if (userData.active === false) {
          await signOut(auth);
          setError('This account has been deactivated');
          return false;
        }
        
        // Update last login
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          lastLogin: new Date()
        }, { merge: true });
      } else {
        // If user doc doesn't exist, create it with default role
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email,
          role: 'user',
          active: true,
          displayName: email.split('@')[0],
          created_at: new Date(),
          lastLogin: new Date()
        });
        setUserRole('user');
      }
      
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document with default user role
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        role: 'user',
        displayName: email.split('@')[0],
        active: true,
        permissions: ['view_content'],
        created_at: new Date()
      });
      
      setUserRole('user');
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
      setUserRole(null);
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

  // Check if user is admin
  const isAdmin = () => {
    return userRole === 'admin';
  };

  // Check if user has a specific role
  const hasRole = (role) => {
    return userRole === role;
  };

  // Subscribe to auth state changes when component mounts
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Fetch user role from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserRole(userData.role || 'user');
          } else {
            setUserRole('user');
          }
        } catch (err) {
          console.error('Error fetching user role:', err);
          setUserRole('user');
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    clearError,
    isAdmin,
    hasRole
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