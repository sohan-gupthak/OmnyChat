import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../store';
import webrtcService from '../../services/webrtc.service';
import websocketService from '../../services/websocket.service';
import './Chat.css';

/**
 * ConnectionStatus component
 * 
 * Displays the current connection status (P2P or server) for the active chat
 */
const ConnectionStatus: React.FC = () => {
  const [connectionType, setConnectionType] = useState<'p2p' | 'server' | 'offline'>('server');
  const { selectedContact } = useAppSelector(state => state.contacts);
  
  useEffect(() => {
    if (!selectedContact) {
      setConnectionType('offline');
      return;
    }
    
    // Check if WebRTC connection exists for the selected contact
    const checkConnectionStatus = () => {
      const hasP2PConnection = webrtcService.hasActiveConnection(selectedContact.contactId);
      const isServerConnected = websocketService.isConnected();
      
      if (hasP2PConnection) {
        setConnectionType('p2p');
      } else if (isServerConnected) {
        setConnectionType('server');
      } else {
        setConnectionType('offline');
      }
    };
    
    // Initial check
    checkConnectionStatus();
    
    // Set up event listeners for connection changes
    const handleWebRTCStatusChange = (peerId: number, isConnected: boolean) => {
      if (peerId === selectedContact.contactId) {
        setConnectionType(isConnected ? 'p2p' : 'server');
      }
    };
    
    const handleServerStatusChange = (isConnected: boolean) => {
      if (!webrtcService.hasActiveConnection(selectedContact.contactId)) {
        setConnectionType(isConnected ? 'server' : 'offline');
      }
    };
    
    // Subscribe to connection status events
    webrtcService.on('connection-status', handleWebRTCStatusChange);
    websocketService.on('connection-status', handleServerStatusChange);
    
    // Check status periodically
    const intervalId = setInterval(checkConnectionStatus, 10000);
    
    return () => {
      webrtcService.off('connection-status', handleWebRTCStatusChange);
      websocketService.off('connection-status', handleServerStatusChange);
      clearInterval(intervalId);
    };
  }, [selectedContact]);
  
  if (!selectedContact) return null;
  
  return (
    <div className="connection-status">
      {connectionType === 'p2p' && (
        <div className="status p2p" title="End-to-end encrypted P2P connection">
          <i className="fas fa-lock"></i>
          <span>P2P</span>
        </div>
      )}
      
      {connectionType === 'server' && (
        <div className="status server" title="Server-relayed encrypted connection">
          <i className="fas fa-server"></i>
          <span>Server</span>
        </div>
      )}
      
      {connectionType === 'offline' && (
        <div className="status offline" title="No connection available">
          <i className="fas fa-exclamation-triangle"></i>
          <span>Offline</span>
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;
