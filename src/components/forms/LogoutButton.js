import React from 'react';
import { Button, IconButton, Tooltip } from '@mui/material';
import { IconLogout } from '@tabler/icons-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LogoutButton = ({ variant = 'icon' }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  // Render an icon button version
  if (variant === 'icon') {
    return (
      <Tooltip title="Logout">
        <IconButton color="primary" onClick={handleLogout}>
          <IconLogout size="18" />
        </IconButton>
      </Tooltip>
    );
  }

  // Render a text button version
  return (
    <Button 
      color="primary" 
      variant="outlined" 
      startIcon={<IconLogout size="18" />}
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;