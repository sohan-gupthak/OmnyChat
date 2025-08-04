import { SignalData } from '../types';
import websocketService from './websocket.service';

export class WebRTCService {
  private connections: Map<number, RTCPeerConnection> = new Map();
  private dataChannels: Map<number, RTCDataChannel> = new Map();
  private iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ];
  private messageHandlers: Map<string, ((data: any, peerId: number) => void)[]> = new Map();
  private connectionStatusHandlers: ((peerId: number, isConnected: boolean) => void)[] = [];

  constructor() {
    // Listen for signaling messages from WebSocket
    websocketService.on('signal', this.handleSignalMessage.bind(this));
  }

  /**
   * Initialize a WebRTC connection with a peer
   * @param peerId Peer user ID
   * @returns Promise that resolves when connection is established
   */
  async initConnection(peerId: number): Promise<RTCDataChannel> {
    // Validate peer ID
    if (!peerId || isNaN(peerId)) {
      throw new Error('Invalid peer ID');
    }
    // Check if connection already exists
    if (this.dataChannels.has(peerId)) {
      return this.dataChannels.get(peerId)!;
    }

    // Create new RTCPeerConnection
    const peerConnection = new RTCPeerConnection({
      iceServers: this.iceServers
    });

    // Store connection
    this.connections.set(peerId, peerConnection);

    // Create data channel
    const dataChannel = peerConnection.createDataChannel('chat', {
      ordered: true
    });

    // Set up data channel event handlers
    this.setupDataChannel(dataChannel, peerId);

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to peer via signaling server
        websocketService.send('signal', {
          recipient: peerId,
          type: 'ice-candidate',
          data: event.candidate
        });
      }
    };

    // Handle connection state changes
    peerConnection.onconnectionstatechange = () => {
      console.log(`Connection state with peer ${peerId}: ${peerConnection.connectionState}`);
      
      if (peerConnection.connectionState === 'connected') {
        this.notifyConnectionStatusChange(peerId, true);
      } else if (peerConnection.connectionState === 'failed' || peerConnection.connectionState === 'closed') {
        this.closeConnection(peerId);
        this.notifyConnectionStatusChange(peerId, false);
      }
    };

    // Handle incoming data channels
    peerConnection.ondatachannel = (event) => {
      const incomingDataChannel = event.channel;
      this.setupDataChannel(incomingDataChannel, peerId);
    };

    try {
      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      // Send offer to peer via signaling server
      websocketService.send('signal', {
        recipient: peerId,
        type: 'offer',
        data: offer
      });

      // Set up a timeout for the connection
      const connectionPromise = new Promise<RTCDataChannel>((resolve, reject) => {
        // Set a timeout for the connection
        const timeoutId = setTimeout(() => {
          reject(new Error('Data channel connection timeout'));
        }, 10000); // 10 seconds timeout
        
        // Set up one-time event listener for data channel open
        const onOpen = () => {
          clearTimeout(timeoutId);
          dataChannel.removeEventListener('open', onOpen);
          resolve(dataChannel);
        };
        
        // If the data channel is already open, resolve immediately
        if (dataChannel.readyState === 'open') {
          clearTimeout(timeoutId);
          resolve(dataChannel);
        } else {
          dataChannel.addEventListener('open', onOpen);
        }
      });
      
      // Store the data channel
      this.dataChannels.set(peerId, dataChannel);
      
      return connectionPromise;
    } catch (error) {
      console.error('Error creating WebRTC connection:', error);
      this.closeConnection(peerId);
      throw error;
    }
  }

  /**
   * Close a WebRTC connection with a peer
   * @param peerId Peer user ID
   */
  closeConnection(peerId: number): void {
    // Close data channel
    const dataChannel = this.dataChannels.get(peerId);
    if (dataChannel) {
      dataChannel.close();
      this.dataChannels.delete(peerId);
    }

    // Close peer connection
    const peerConnection = this.connections.get(peerId);
    if (peerConnection) {
      peerConnection.close();
      this.connections.delete(peerId);
      
      // Notify connection status handlers
      this.notifyConnectionStatusChange(peerId, false);
    }
  }
  
  /**
   * Check if there is an active WebRTC connection with a peer
   * @param peerId Peer user ID
   * @returns True if there is an active connection, false otherwise
   */
  hasActiveConnection(peerId: number): boolean {
    const connection = this.connections.get(peerId);
    const dataChannel = this.dataChannels.get(peerId);
    
    return !!connection && 
           !!dataChannel && 
           connection.connectionState === 'connected' && 
           dataChannel.readyState === 'open';
  }

  /**
   * Send a message to a peer via WebRTC data channel
   * @param peerId Peer user ID
   * @param type Message type
   * @param data Message data
   * @returns Promise that resolves when message is sent
   */
  async sendMessage(peerId: number, type: string, data: any): Promise<void> {
    // Validate peer ID
    if (!peerId || isNaN(peerId)) {
      throw new Error('Invalid peer ID');
    }
    let dataChannel = this.dataChannels.get(peerId);

    // If no data channel exists, create one
    if (!dataChannel) {
      try {
        dataChannel = await this.initConnection(peerId);
      } catch (error) {
        console.error('Failed to create data channel:', error);
        throw new Error('Failed to establish WebRTC connection');
      }
    }

    // Send message
    return new Promise((resolve, reject) => {
      try {
        const message = JSON.stringify({ type, data });
        
        if (dataChannel.readyState === 'open') {
          dataChannel.send(message);
          resolve();
        } else {
          // Wait for data channel to open with a timeout
          const timeoutId = setTimeout(() => {
            dataChannel.removeEventListener('open', onOpen);
            reject(new Error('Data channel connection timeout'));
          }, 5000); // 5 seconds timeout
          
          const onOpen = () => {
            clearTimeout(timeoutId);
            try {
              dataChannel.send(message);
              resolve();
            } catch (err) {
              reject(err);
            } finally {
              dataChannel.removeEventListener('open', onOpen);
            }
          };
          
          dataChannel.addEventListener('open', onOpen);
        }
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Register a handler for a specific message type
   * @param type Message type
   * @param handler Handler function
   */
  on(type: string, handler: (data: any, peerId: number) => void): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)?.push(handler);
  }

  /**
   * Remove a handler for a specific message type
   * @param type Message type
   * @param handler Handler function to remove
   */
  off(type: string, handler: (data: any, peerId: number) => void): void {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type) || [];
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  /**
   * Register a handler for connection status changes
   * @param handler Handler function
   */
  onConnectionStatus(handler: (peerId: number, isConnected: boolean) => void): void {
    this.connectionStatusHandlers.push(handler);
  }
  
  /**
   * Remove a handler for connection status changes
   * @param handler Handler function to remove
   */
  offConnectionStatus(handler: (peerId: number, isConnected: boolean) => void): void {
    const index = this.connectionStatusHandlers.indexOf(handler);
    if (index !== -1) {
      this.connectionStatusHandlers.splice(index, 1);
    }
  }
  
  /**
   * Notify all connection status handlers of a change
   * @param peerId Peer user ID
   * @param isConnected Whether the connection is active
   */
  private notifyConnectionStatusChange(peerId: number, isConnected: boolean): void {
    this.connectionStatusHandlers.forEach(handler => handler(peerId, isConnected));
  }

  /**
   * Handle incoming signaling messages from WebSocket
   * @param payload Signal payload
   */
  private async handleSignalMessage(payload: any): Promise<void> {
    const { sender, type, data } = payload;
    
    try {
      // Get or create peer connection
      let peerConnection = this.connections.get(sender);
      
      if (!peerConnection) {
        peerConnection = new RTCPeerConnection({
          iceServers: this.iceServers
        });
        
        // Store connection
        this.connections.set(sender, peerConnection);
        
        // Handle ICE candidates
        peerConnection.onicecandidate = (event) => {
          if (event.candidate) {
            websocketService.send('signal', {
              recipient: sender,
              type: 'ice-candidate',
              data: event.candidate
            });
          }
        };
        
        // Handle connection state changes
        peerConnection.onconnectionstatechange = () => {
          console.log(`Connection state with peer ${sender}: ${peerConnection!.connectionState}`);
          
          if (peerConnection!.connectionState === 'failed' || peerConnection!.connectionState === 'closed') {
            this.closeConnection(sender);
          }
        };
        
        // Handle incoming data channels
        peerConnection.ondatachannel = (event) => {
          const dataChannel = event.channel;
          this.setupDataChannel(dataChannel, sender);
        };
      }
      
      // Handle different signal types
      switch (type) {
        case 'offer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          websocketService.send('signal', {
            recipient: sender,
            type: 'answer',
            data: answer
          });
          break;
          
        case 'answer':
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
          break;
          
        case 'ice-candidate':
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
          break;
          
        default:
          console.warn('Unknown signal type:', type);
      }
    } catch (error) {
      console.error('Error handling signal:', error);
    }
  }

  /**
   * Set up event handlers for a data channel
   * @param dataChannel WebRTC data channel
   * @param peerId Peer user ID
   */
  private setupDataChannel(dataChannel: RTCDataChannel, peerId: number): void {
    // Store data channel
    this.dataChannels.set(peerId, dataChannel);
    
    dataChannel.onopen = () => {
      console.log(`Data channel with peer ${peerId} opened`);
    };
    
    dataChannel.onclose = () => {
      console.log(`Data channel with peer ${peerId} closed`);
    };
    
    dataChannel.onerror = (error) => {
      console.error(`Data channel error with peer ${peerId}:`, error);
    };
    
    dataChannel.onmessage = (event) => {
      try {
        const { type, data } = JSON.parse(event.data);
        
        // Call message handlers
        if (this.messageHandlers.has(type)) {
          const handlers = this.messageHandlers.get(type) || [];
          handlers.forEach(handler => handler(data, peerId));
        }
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };
  }
}

// Create singleton instance
const webrtcService = new WebRTCService();
export default webrtcService;
