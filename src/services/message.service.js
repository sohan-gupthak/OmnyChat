import api from './api';
import websocketService from './websocket.service';
import webrtcService from './webrtc.service';
import cryptoService from './crypto.service';
export class MessageService {
    messageHandlers = [];
    constructor() {
        websocketService.on('message', (payload) => this.handleWebSocketMessage(payload));
    }
    /**
     * Send a message to a recipient.
     * Order: encrypt -> persist (for offline) -> P2P via WebRTC -> fallback WS.
     */
    async sendMessage(recipientId, content, sharedKey) {
        const timestamp = new Date().toISOString();
        const senderId = parseInt(localStorage.getItem('userId') || '0');
        const clientMessageId = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        // Encrypt only the wire payload. The local message keeps the plaintext so
        // the sender's own chat shows the text without depending on the
        // decryption effect racing the slice update.
        const wasEncrypted = !!sharedKey;
        const encryptedContent = wasEncrypted
            ? await cryptoService.encryptMessage(content, sharedKey)
            : content;
        const isEncrypted = wasEncrypted;
        const message = {
            senderId,
            recipientId,
            content, // local display: plaintext
            timestamp,
            status: 'sent',
            isEncrypted: false, // local copy: already plaintext
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
            if (data?.messageId)
                message.id = data.messageId;
        }
        catch (err) {
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
        }
        catch (err) {
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
    async getOfflineMessages() {
        try {
            const response = await api.get('/messages/offline');
            return response.data;
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || 'Failed to get offline messages' };
        }
    }
    /**
     * Get chat history with a contact, paginated by ?before=ISO.
     */
    async getConversationHistory(contactId, options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.before)
                params.set('before', options.before);
            if (options.limit)
                params.set('limit', String(options.limit));
            const query = params.toString();
            const response = await api.get(`/messages/conversation/${contactId}${query ? `?${query}` : ''}`);
            return response.data;
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || 'Failed to get conversation history' };
        }
    }
    /**
     * Mark a batch of messages as read.
     */
    async markAsRead(messageIds) {
        try {
            const response = await api.post('/messages/mark-read', { messageIds });
            return response.data;
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || 'Failed to mark messages as read' };
        }
    }
    onMessage(handler) {
        this.messageHandlers.push(handler);
    }
    offMessage(handler) {
        const idx = this.messageHandlers.indexOf(handler);
        if (idx !== -1)
            this.messageHandlers.splice(idx, 1);
    }
    handleWebSocketMessage(payload) {
        const myId = parseInt(localStorage.getItem('userId') || '0');
        if (payload.sender && payload.encryptedContent) {
            const message = {
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
        }
        else if (payload.pendingMessages) {
            for (const msg of payload.pendingMessages) {
                const message = {
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
