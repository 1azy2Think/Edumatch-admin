// src/routes/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const ProtectedRoute = () => {
  const { currentUser, loading, userRole } = useAuth();
  const location = useLocation();

  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height="100vh"
      >
        <CircularProgress size={60} />
        <Typography variant="h6" mt={2}>
          Checking authentication...
        </Typography>
      </Box>
    );
  }

  // If not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If trying to access /admin and not an admin, redirect to dashboard
  if (location.pathname === '/admin' && userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // User is authenticated and authorized for the route
  return <Outlet />;
};

export default ProtectedRoute;