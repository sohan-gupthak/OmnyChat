import api from './api';
import { Message, ApiResponse, OfflineMessagesResponse } from '../types';
import websocketService from './websocket.service';
import webrtcService from './webrtc.service';
import cryptoService from './crypto.service';

export class MessageService {
  private messageHandlers: ((message: Message) => void)[] = [];

  constructor() {
    websocketService.on('message', (payload: any) => this.handleWebSocketMessage(payload));
  }

  /**
   * Send a message to a recipient.
   * Order: encrypt -> persist (for offline) -> P2P via WebRTC -> fallback WS.
   */
  async sendMessage(
    recipientId: number,
    content: string,
    sharedKey?: CryptoKey
  ): Promise<Message> {
    const timestamp = new Date().toISOString();
    let encryptedContent = content;
    let isEncrypted = false;
    if (sharedKey) {
      encryptedContent = await cryptoService.encryptMessage(content, sharedKey);
      isEncrypted = true;
    }

    const senderId = parseInt(localStorage.getItem('userId') || '0');
    const clientMessageId =
      typeof crypto !== 'undefined' && (crypto as any).randomUUID
        ? (crypto as any).randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const message: Message = {
      senderId,
      recipientId,
      content: encryptedContent,
      timestamp,
      status: 'sent',
      isEncrypted,
      clientMessageId,
    };

    // Persist for offline delivery + dedup.
    try {
      const response = await api.post('/messages/store', {
        recipientId,
        encryptedContent,
        clientMessageId,
        timestamp,
      });
      const data = response.data?.data;
      if (data?.messageId) message.id = data.messageId;
    } catch (err) {
      console.error('Error storing message:', err);
    }

    // Try P2P first.
    try {
      await webrtcService.sendMessage(recipientId, 'message', {
        content: encryptedContent,
        timestamp,
        isEncrypted,
        id: message.id,
        clientMessageId,
      });
      message.status = 'sent';
      return message;
    } catch (err) {
      // Fall back to WebSocket live delivery.
      websocketService.send('message', {
        recipient: recipientId,
        encryptedContent,
        timestamp,
        clientMessageId,
        id: message.id,
      });
      return message;
    }
  }

  /**
   * Get offline messages from the server.
   */
  async getOfflineMessages(): Promise<ApiResponse<OfflineMessagesResponse>> {
    try {
      const response = await api.get('/messages/offline');
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get offline messages' };
    }
  }

  /**
   * Get chat history with a contact, paginated by ?before=ISO.
   */
  async getConversationHistory(
    contactId: number,
    options: { before?: string; limit?: number } = {}
  ): Promise<ApiResponse<OfflineMessagesResponse>> {
    try {
      const params = new URLSearchParams();
      if (options.before) params.set('before', options.before);
      if (options.limit) params.set('limit', String(options.limit));
      const query = params.toString();
      const response = await api.get(
        `/messages/conversation/${contactId}${query ? `?${query}` : ''}`
      );
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get conversation history' };
    }
  }

  /**
   * Mark a batch of messages as read.
   */
  async markAsRead(messageIds: number[]): Promise<ApiResponse<void>> {
    try {
      const response = await api.post('/messages/mark-read', { messageIds });
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to mark messages as read' };
    }
  }

  onMessage(handler: (message: Message) => void): void {
    this.messageHandlers.push(handler);
  }

  offMessage(handler: (message: Message) => void): void {
    const idx = this.messageHandlers.indexOf(handler);
    if (idx !== -1) this.messageHandlers.splice(idx, 1);
  }

  private handleWebSocketMessage(payload: any): void {
    const myId = parseInt(localStorage.getItem('userId') || '0');
    if (payload.sender && payload.encryptedContent) {
      const message: Message = {
        id: payload.id,
        senderId: payload.sender,
        recipientId: payload.recipient ?? myId,
        content: payload.encryptedContent,
        timestamp: payload.timestamp || new Date().toISOString(),
        status: 'delivered',
        isEncrypted: true,
        clientMessageId: payload.clientMessageId,
      };
      this.messageHandlers.forEach((h) => h(message));
    } else if (payload.pendingMessages) {
      for (const msg of payload.pendingMessages) {
        const message: Message = {
          id: msg.id,
          senderId: msg.sender,
          recipientId: msg.recipient ?? myId,
          content: msg.content,
          timestamp: msg.timestamp,
          status: 'delivered',
          isEncrypted: true,
          clientMessageId: msg.clientMessageId,
        };
        this.messageHandlers.forEach((h) => h(message));
      }
    }
  }
}

const messageService = new MessageService();
export default messageService;
