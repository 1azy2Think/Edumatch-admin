import React from 'react';
import DashboardCard from '../../../components/shared/DashboardCard';
import {
  Timeline,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
  TimelineDot,
  TimelineConnector,
  TimelineContent,
  timelineOppositeContentClasses,
} from '@mui/lab';
import { Link, Typography, Box, Chip } from '@mui/material';

const RecentChats = ({ chatSessions }) => {
  // Sort chat sessions by last update timestamp (newest first) if available
  const sortedChats = [...chatSessions].sort((a, b) => {
    if (a.updatedAt && b.updatedAt) {
      return b.updatedAt._seconds - a.updatedAt._seconds;
    }
    return 0; // If no timestamp, keep original order
  });

  // Take only the 5 most recent chats
  const recentChats = sortedChats.slice(0, 5);

  // Function to safely format timestamp to readable date/time
  const formatTimestamp = (timestamp) => {
    if (!timestamp || !timestamp._seconds) return 'Unknown date';
    
    try {
      // Convert Firestore timestamp to JS Date
      const date = new Date(timestamp._seconds * 1000);
      
      // Check if date is valid before formatting
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      // Format the date in a simpler way to avoid date-fns issues
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Date error';
    }
  };

  // Function to truncate message content
  const truncateMessage = (message, maxLength = 60) => {
    if (!message) return 'No message';
    return message.length > maxLength
      ? `${message.substring(0, maxLength)}...`
      : message;
  };

  // Function to get avatar color based on model name
  const getModelColor = (model) => {
    if (!model) return 'primary';
    
    const modelLower = model.toLowerCase();
    if (modelLower.includes('claude')) return 'primary';
    if (modelLower.includes('gemini')) return 'secondary'; 
    if (modelLower.includes('mistral')) return 'success';
    if (modelLower.includes('deepseek')) return 'warning';
    return 'info';
  };

  return (
    <DashboardCard title="Recent Chat Sessions">
      <>
        <Timeline
          className="theme-timeline"
          nonce={undefined}
          onResize={undefined}
          onResizeCapture={undefined}
          sx={{
            p: 0,
            mb: '-40px',
            '& .MuiTimelineConnector-root': {
              width: '1px',
              backgroundColor: '#efefef'
            },
            [`& .${timelineOppositeContentClasses.root}`]: {
              flex: 0.2,
              paddingLeft: 0,
            },
          }}
        >
          {recentChats.length > 0 ? (
            recentChats.map((chat, index) => {
              // Get model name from the last AI message if available
              const lastAiMessage = chat.messages?.find(msg => msg.sender === 'ai');
              const modelName = lastAiMessage?.model || 'Unknown';

              return (
                <TimelineItem key={chat.id || index}>
                  <TimelineOppositeContent>
                    {chat.updatedAt ? formatTimestamp(chat.updatedAt) : 'Unknown'}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getModelColor(modelName)} variant="outlined" />
                    {index < recentChats.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Typography fontWeight="600">
                        {chat.title || 'Untitled Chat'}
                      </Typography>
                      {lastAiMessage?.model && (
                        <Chip 
                          label={lastAiMessage.model.split('/').pop()} 
                          size="small" 
                          color={getModelColor(lastAiMessage.model)}
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                    <Typography variant="body2" color="textSecondary">
                      {truncateMessage(chat.lastMessage)}
                    </Typography>
                    <Link href={`/chat/${chat.id}`} underline="hover" sx={{ fontSize: '0.8rem' }}>
                      View Session
                    </Link>
                  </TimelineContent>
                </TimelineItem>
              );
            })
          ) : (
            <TimelineItem>
              <TimelineContent>
                <Typography variant="body2" color="textSecondary">
                  No recent chat sessions found.
                </Typography>
              </TimelineContent>
            </TimelineItem>
          )}
        </Timeline>
      </>
    </DashboardCard>
  );
};

export default RecentChats;