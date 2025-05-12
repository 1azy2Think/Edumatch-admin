// src/views/dashboard/components/RealtimeActivity.js - Updated version
import React from 'react';
import { Card, CardContent, Typography, Box, Chip, List, ListItem, ListItemText, Divider, Alert, Button } from '@mui/material';
import useWebSocketService from 'src/utils/websocketService';

const RealtimeActivity = () => {
  const { isConnected, connectionError, stats, recentInteractions, scoreChanges } = useWebSocketService();
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };
  
  // Force reconnect by refreshing the component
  const handleReconnect = () => {
    window.location.reload();
  };
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Realtime Activity
        </Typography>
        
        <Box mb={2} display="flex" alignItems="center" justifyContent="space-between">
          <Chip 
            label={isConnected ? 'Connected' : 'Disconnected'} 
            color={isConnected ? 'success' : 'error'} 
            size="small"
          />
          
          {!isConnected && (
            <Button 
              variant="outlined" 
              color="primary" 
              size="small"
              onClick={handleReconnect}
            >
              Reconnect
            </Button>
          )}
        </Box>
        
        {connectionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {connectionError}
          </Alert>
        )}
        
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="body2">
            <strong>Active Connections:</strong> {stats.connectionCount}
          </Typography>
          <Typography variant="body2">
            <strong>Active Users:</strong> {stats.activeUsers}
          </Typography>
          <Typography variant="body2">
            <strong>Active Courses:</strong> {stats.activeCourses}
          </Typography>
        </Box>
        
        <Typography variant="subtitle1" gutterBottom>
          Recent Interactions
        </Typography>
        
        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
          {recentInteractions.length > 0 ? (
            recentInteractions.map((interaction, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        <strong>{interaction.interactionType || interaction.type}</strong> - {interaction.entityName || interaction.course}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption">
                        User: {interaction.userId} • {formatTimestamp(interaction.timestamp)}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < recentInteractions.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary={isConnected ? "No recent interactions" : "Connect to see interactions"} />
            </ListItem>
          )}
        </List>
        
        <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
          Recent Score Changes
        </Typography>
        
        <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
          {scoreChanges.length > 0 ? (
            scoreChanges.map((change, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="body2">
                        <strong>{change.actionType}</strong> - Affected {change.affectedCourses} courses
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption">
                        User: {change.userId} • {formatTimestamp(change.timestamp)}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < scoreChanges.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary={isConnected ? "No recent score changes" : "Connect to see score changes"} />
            </ListItem>
          )}
        </List>
      </CardContent>
    </Card>
  );
};

export default RealtimeActivity;