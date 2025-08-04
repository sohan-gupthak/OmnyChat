import { WebSocketMessage } from '../types';

export class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimeout: number | null = null;
  private messageHandlers: Map<string, ((payload: any) => void)[]> = new Map();
  private connectionStatusHandlers: ((isConnected: boolean) => void)[] = [];
  
  constructor(url?: string) {
    this.url = url || `${import.meta.env.VITE_WS_URL || 'ws://localhost:5000/ws'}`;
  }

  /**
   * Connect to the WebSocket server
   * @param token JWT token for authentication
   */
  connect(token: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        resolve(true);
        return;
      }

      this.token = token;
      this.socket = new WebSocket(this.url);

      this.socket.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Send authentication message
        this.send('connect', { token });
        
        // Notify connection status handlers
        this.notifyConnectionStatusChange(true);
        
        resolve(true);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket disconnected', event);
        
        // Notify connection status handlers
        this.notifyConnectionStatusChange(false);
        
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectTimeout = window.setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(token);
          }, 1000 * Math.pow(2, this.reconnectAttempts));
        }
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        reject(error);
      };

      this.socket.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.send('disconnect', {});
      this.socket.close();
      this.socket = null;
    }
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  /**
   * Send a message to the WebSocket server
   * @param type Message type
   * @param payload Message payload
   */
  send(type: string, payload: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message: WebSocketMessage = { type: type as any, payload };
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }

  /**
   * Register a handler for a specific message type
   * @param type Message type
   * @param handler Handler function
   */
  on(type: string, handler: (payload: any) => void): void {
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
  off(type: string, handler: (payload: any) => void): void {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type) || [];
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  /**
   * Check if the WebSocket is connected
   * @returns True if connected, false otherwise
   */
  isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
  
  /**
   * Register a handler for connection status changes
   * @param handler Handler function
   */
  onConnectionStatus(handler: (isConnected: boolean) => void): void {
    this.connectionStatusHandlers.push(handler);
    
    // Immediately notify with current status
    handler(this.isConnected());
  }
  
  /**
   * Remove a handler for connection status changes
   * @param handler Handler function to remove
   */
  offConnectionStatus(handler: (isConnected: boolean) => void): void {
    const index = this.connectionStatusHandlers.indexOf(handler);
    if (index !== -1) {
      this.connectionStatusHandlers.splice(index, 1);
    }
  }
  
  /**
   * Notify all connection status handlers of a change
   * @param isConnected Whether the connection is active
   */
  private notifyConnectionStatusChange(isConnected: boolean): void {
    this.connectionStatusHandlers.forEach(handler => handler(isConnected));
  }

  /**
   * Handle incoming WebSocket messages
   * @param message WebSocket message
   */
  private handleMessage(message: WebSocketMessage): void {
    const { type, payload } = message;
    
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type) || [];
      handlers.forEach(handler => handler(payload));
    }
  }
}

// Create singleton instance
const websocketService = new WebSocketService();
export default websocketService;
