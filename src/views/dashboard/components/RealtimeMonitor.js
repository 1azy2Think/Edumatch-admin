// Updated src/views/dashboard/components/RealtimeMonitor.js
import React, { useState } from 'react';
import { 
  Card, CardContent, Typography, Box, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab,
  Badge, Alert, IconButton, Collapse, List, ListItem, ListItemText,
  Divider, Grid
} from '@mui/material';
import { 
  IconChevronDown, 
  IconChevronUp 
} from '@tabler/icons-react';
import useWebSocketService from 'src/utils/websocketService';

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box p={2}>{children}</Box>}
    </div>
  );
};

// Row component for score changes - with expandable details
const ScoreChangeRow = ({ change }) => {
  const [open, setOpen] = useState(false);
  
  const formatNumber = (num) => {
    return typeof num === 'number' ? num.toFixed(2) : '0.00';
  };
  
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <IconChevronUp /> : <IconChevronDown />}
          </IconButton>
        </TableCell>
        <TableCell>{formatDateTime(change.timestamp)}</TableCell>
        <TableCell>{change.userId}</TableCell>
        <TableCell>{change.actionType}</TableCell>
        <TableCell>{change.changes?.length || 0} courses</TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Affected Courses
              </Typography>
              <Table size="small" aria-label="affected-courses">
                <TableHead>
                  <TableRow>
                    <TableCell>Course Name</TableCell>
                    <TableCell align="right">Old Score</TableCell>
                    <TableCell align="right">Change</TableCell>
                    <TableCell align="right">New Score</TableCell>
                    <TableCell>Reason</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {change.changes && change.changes.map((courseChange, idx) => (
                    <TableRow key={idx}>
                      <TableCell component="th" scope="row">
                        {courseChange.courseName || courseChange.courseId || 'Unknown Course'}
                      </TableCell>
                      <TableCell align="right">{formatNumber(courseChange.oldScore)}</TableCell>
                      <TableCell 
                        align="right"
                        sx={{ 
                          color: courseChange.scoreDelta > 0 ? 'success.main' : 'error.main',
                          fontWeight: 'bold' 
                        }}
                      >
                        {courseChange.scoreDelta > 0 ? '+' : ''}{formatNumber(courseChange.scoreDelta)}
                      </TableCell>
                      <TableCell align="right">{formatNumber(courseChange.newScore)}</TableCell>
                      <TableCell>{courseChange.reason || 'No reason provided'}</TableCell>
                    </TableRow>
                  ))}
                  {(!change.changes || change.changes.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No course details available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

const RealtimeMonitor = () => {
  const [tabValue, setTabValue] = useState(0);
  const { isConnected, stats, recentInteractions, scoreChanges } = useWebSocketService();
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">
            Realtime System Monitor
          </Typography>
          <Chip 
            label={isConnected ? 'Connected' : 'Disconnected'} 
            color={isConnected ? 'success' : 'error'} 
            size="small"
          />
        </Box>
        
        <Box display="flex" justifyContent="space-around" mb={3}>
          <Box textAlign="center">
            <Typography variant="h3">{stats.connectionCount}</Typography>
            <Typography variant="body2">Active Connections</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h3">{stats.activeUsers}</Typography>
            <Typography variant="body2">Active Users</Typography>
          </Box>
          <Box textAlign="center">
            <Typography variant="h3">{stats.activeCourses}</Typography>
            <Typography variant="body2">Active Courses</Typography>
          </Box>
        </Box>
        
        {!isConnected && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            WebSocket connection lost. Real-time updates are not available.
          </Alert>
        )}
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="realtime data tabs">
            <Tab 
              label={
                <Badge badgeContent={recentInteractions.length} color="primary">
                  <Typography>User Interactions</Typography>
                </Badge>
              } 
              id="tab-0" 
            />
            <Tab 
              label={
                <Badge badgeContent={scoreChanges.length} color="secondary">
                  <Typography>Score Changes</Typography>
                </Badge>
              } 
              id="tab-1" 
            />
          </Tabs>
        </Box>
        
        <TabPanel value={tabValue} index={0}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentInteractions.length > 0 ? (
                  recentInteractions.map((interaction, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {formatDateTime(interaction.timestamp)}
                      </TableCell>
                      <TableCell>{interaction.userId}</TableCell>
                      <TableCell>{interaction.interactionType || interaction.type}</TableCell>
                      <TableCell>{interaction.entityName || interaction.course}</TableCell>
                      <TableCell>{interaction.entityType || 'course'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No interaction data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell width="50px" /> {/* Empty cell for expand/collapse button */}
                  <TableCell>Time</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Affected</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {scoreChanges.length > 0 ? (
                  scoreChanges.map((change, index) => (
                    <ScoreChangeRow key={index} change={change} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No score change data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </CardContent>
    </Card>
  );
};

export default RealtimeMonitor;