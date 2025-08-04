import api from './api';
import { Message, ApiResponse } from '../types';
import websocketService from './websocket.service';
import webrtcService from './webrtc.service';
import cryptoService from './crypto.service';

export class MessageService {
  private messageHandlers: ((message: Message) => void)[] = [];

  constructor() {
    // Listen for messages from WebSocket
    websocketService.on('message', this.handleWebSocketMessage.bind(this));
    
    // Listen for messages from WebRTC
    webrtcService.on('message', this.handleWebRTCMessage.bind(this));
  }

  /**
   * Send a message to a recipient
   * @param recipientId Recipient user ID
   * @param content Message content
   * @param sharedKey Optional shared encryption key
   * @returns Promise with sent message
   */
  async sendMessage(recipientId: number, content: string, sharedKey?: CryptoKey): Promise<Message> {
    try {
      const timestamp = new Date().toISOString();
      let encryptedContent = content;
      let isEncrypted = false;
      
      // Encrypt message if shared key is provided
      if (sharedKey) {
        encryptedContent = await cryptoService.encryptMessage(content, sharedKey);
        isEncrypted = true;
      }
      
      // Create message object
      const message: Message = {
        senderId: parseInt(localStorage.getItem('userId') || '0'),
        recipientId,
        content: encryptedContent,
        timestamp,
        status: 'sent',
        isEncrypted
      };
      
      // Try to send via WebRTC first
      try {
        await webrtcService.sendMessage(recipientId, 'message', {
          content: encryptedContent,
          timestamp,
          isEncrypted
        });
        
        message.status = 'sent';
        return message;
      } catch (error) {
        console.log('WebRTC send failed, falling back to WebSocket');
        
        // Fall back to WebSocket
        websocketService.send('message', {
          recipient: recipientId,
          encryptedContent: encryptedContent,
          timestamp
        });
        
        return message;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw new Error('Failed to send message');
    }
  }

  /**
   * Get offline messages from the server
   * @returns Promise with list of messages
   */
  async getOfflineMessages(): Promise<ApiResponse<Message[]>> {
    try {
      const response = await api.get('/messages/offline');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get offline messages'
      };
    }
  }

  /**
   * Mark a message as read
   * @param messageId Message ID
   * @returns Promise with success status
   */
  async markAsRead(messageId: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.post(`/messages/${messageId}/read`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to mark message as read'
      };
    }
  }

  /**
   * Register a handler for incoming messages
   * @param handler Message handler function
   */
  onMessage(handler: (message: Message) => void): void {
    this.messageHandlers.push(handler);
  }

  /**
   * Remove a message handler
   * @param handler Message handler to remove
   */
  offMessage(handler: (message: Message) => void): void {
    const index = this.messageHandlers.indexOf(handler);
    if (index !== -1) {
      this.messageHandlers.splice(index, 1);
    }
  }

  /**
   * Handle incoming WebSocket messages
   * @param payload Message payload
   */
  private handleWebSocketMessage(payload: any): void {
    if (payload.sender && payload.encryptedContent) {
      const message: Message = {
        senderId: payload.sender,
        recipientId: parseInt(localStorage.getItem('userId') || '0'),
        content: payload.encryptedContent,
        timestamp: payload.timestamp || new Date().toISOString(),
        status: 'delivered',
        isEncrypted: true // Assume all WebSocket messages are encrypted
      };
      
      // Notify all handlers
      this.messageHandlers.forEach(handler => handler(message));
    } else if (payload.pendingMessages) {
      // Handle batch of offline messages
      payload.pendingMessages.forEach((msg: any) => {
        const message: Message = {
          id: msg.id,
          senderId: msg.sender,
          recipientId: parseInt(localStorage.getItem('userId') || '0'),
          content: msg.content,
          timestamp: msg.timestamp,
          status: 'delivered',
          isEncrypted: true // Assume all offline messages are encrypted
        };
        
        // Notify all handlers
        this.messageHandlers.forEach(handler => handler(message));
      });
    }
  }

  /**
   * Handle incoming WebRTC messages
   * @param data Message data
   * @param peerId Peer user ID
   */
  private handleWebRTCMessage(data: any, peerId: number): void {
    const message: Message = {
      senderId: peerId,
      recipientId: parseInt(localStorage.getItem('userId') || '0'),
      content: data.content,
      timestamp: data.timestamp || new Date().toISOString(),
      status: 'delivered',
      isEncrypted: data.isEncrypted || false
    };
    
    // Notify all handlers
    this.messageHandlers.forEach(handler => handler(message));
  }
}

// Create singleton instance
const messageService = new MessageService();
export default messageService;
