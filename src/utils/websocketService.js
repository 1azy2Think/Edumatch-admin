// src/utils/websocketService.js - Updated version
import { useState, useEffect, useRef } from 'react';

const useWebSocketService = (userId = null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [stats, setStats] = useState({
    connectionCount: 0,
    activeUsers: 0,
    activeCourses: 0
  });
  const [recentInteractions, setRecentInteractions] = useState([]);
  const [scoreChanges, setScoreChanges] = useState([]);
  const webSocketRef = useRef(null);
  const heartbeatInterval = useRef(null);

  useEffect(() => {
    // Generate anonymous ID if none provided
    const clientId = userId || `anonymous-${Math.random().toString(36).substring(2, 10)}`;
    
    // Important: Use hardcoded URL for development to ensure correct connection
    // When in production, you can use relative paths
    const wsUrl = `ws://localhost:8080/user?userId=${clientId}`;
    
    console.log(`Attempting to connect to: ${wsUrl}`);
    
    // Create WebSocket connection
    const ws = new WebSocket(wsUrl);
    webSocketRef.current = ws;
    
    // Connection opened
    ws.addEventListener('open', () => {
      console.log('WebSocket connection established successfully');
      setIsConnected(true);
      setConnectionError(null);
      
      // Send initial connection message
      ws.send(JSON.stringify({
        type: 'connect',
        data: {
          platform: 'admin-dashboard',
          role: 'admin'
        }
      }));
      
      // Start heartbeat
      startHeartbeat();
    });
    
    // Listen for messages
    ws.addEventListener('message', (event) => {
      console.log('Received message from WebSocket:', event.data);
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'init':
            console.log('Received init message:', message);
            if (message.stats) {
              setStats({
                connectionCount: message.stats.connectionCount || 0,
                activeUsers: message.stats.activeUsers || 0,
                activeCourses: message.stats.activeCourses || 0
              });
              setRecentInteractions(message.stats.recentInteractions || []);
              setScoreChanges(message.stats.recentScoreChanges || []);
            }
            break;
            
          case 'stats_update':
            console.log('Received stats update:', message);
            setStats({
              connectionCount: message.connectionCount || 0,
              activeUsers: message.activeUsers || 0,
              activeCourses: message.activeCourses || 0
            });
            break;
            
          case 'interaction_update':
            console.log('Received interaction update:', message);
            if (message.data) {
              setRecentInteractions(prevInteractions => {
                const updatedInteractions = [message.data, ...prevInteractions];
                return updatedInteractions.slice(0, 50); // Keep only the most recent 50
              });
            }
            break;
            
          case 'score_changes_update':
            console.log('Received score changes update:', message);
            if (message.data) {
              setScoreChanges(prevChanges => {
                const updatedChanges = [message.data, ...prevChanges];
                return updatedChanges.slice(0, 50); // Keep only the most recent 50
              });
            }
            break;
            
          default:
            console.log('Unknown message type:', message.type);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    // Connection closed
    ws.addEventListener('close', (event) => {
      console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
      setIsConnected(false);
      
      // Stop heartbeat
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
      
      // Try to reconnect after a delay if this wasn't a normal closure
      if (event.code !== 1000) {
        console.log('Abnormal closure. Attempting to reconnect in 5 seconds...');
        setTimeout(() => {
          console.log('Attempting to reconnect...');
          // Force component re-mount to attempt reconnection
          setConnectionError('Connection lost. Reconnecting...');
        }, 5000);
      }
    });
    
    // Connection error
    ws.addEventListener('error', (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
      setConnectionError('Failed to connect to WebSocket server. Please check if the server is running.');
    });
    
    // Clean up on unmount
    return () => {
      console.log('Cleaning up WebSocket connection');
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
        ws.close(1000, 'Component unmounted');
      }
      if (heartbeatInterval.current) {
        clearInterval(heartbeatInterval.current);
      }
    };
  }, [userId, connectionError]); // Added connectionError to dependencies to force reconnect
  
  // Heartbeat to keep connection alive
  const startHeartbeat = () => {
    heartbeatInterval.current = setInterval(() => {
      if (webSocketRef.current && webSocketRef.current.readyState === WebSocket.OPEN) {
        console.log('Sending heartbeat');
        webSocketRef.current.send(JSON.stringify({ type: 'heartbeat' }));
      }
    }, 30000); // 30 seconds interval
  };
  
  return {
    isConnected,
    connectionError,
    stats,
    recentInteractions,
    scoreChanges
  };
};

export default useWebSocketService;