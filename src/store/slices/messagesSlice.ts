import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Message, Conversation } from '../../types';
import messageService from '../../services/message.service';
import { KeyService, cryptoService } from '../../services';

// Define the state interface
interface MessagesState {
  conversations: Record<number, Conversation>;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: MessagesState = {
  conversations: {},
  isLoading: false,
  error: null
};

// Async thunks
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async ({ recipientId, content, sharedKey }: { recipientId: number; content: string; sharedKey?: CryptoKey }, { rejectWithValue }) => {
    try {
      const message = await messageService.sendMessage(recipientId, content, sharedKey);
      return message;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to send message');
    }
  }
);

export const fetchOfflineMessages = createAsyncThunk(
  'messages/fetchOfflineMessages',
  async (_, { rejectWithValue, getState }) => {
    try {
      const response = await messageService.getOfflineMessages();
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to fetch offline messages');
      }
      
      // Group messages by sender
      const messagesBySender: Record<number, Message[]> = {};
      response.data.forEach(message => {
        if (!messagesBySender[message.senderId]) {
          messagesBySender[message.senderId] = [];
        }
        messagesBySender[message.senderId].push(message);
      });
      
      return messagesBySender;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch offline messages');
    }
  }
);

export const decryptMessage = createAsyncThunk(
  'messages/decryptMessage',
  async ({ message, sharedKey }: { message: Message; sharedKey: CryptoKey }, { rejectWithValue }) => {
    try {
      if (!message.isEncrypted) {
        return { ...message };
      }
      
      const decryptedContent = await cryptoService.decryptMessage(message.content, sharedKey);
      return {
        ...message,
        content: decryptedContent,
        isEncrypted: false
      };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to decrypt message');
    }
  }
);

// Messages slice
const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Message>) => {
      const message = action.payload;
      const contactId = message.senderId === parseInt(localStorage.getItem('userId') || '0')
        ? message.recipientId
        : message.senderId;
      
      // Create conversation if it doesn't exist
      if (!state.conversations[contactId]) {
        state.conversations[contactId] = {
          contact: {
            id: 0, // Will be updated when contact info is fetched
            userId: parseInt(localStorage.getItem('userId') || '0'),
            contactId,
            username: 'Unknown', // Will be updated when contact info is fetched
            isOnline: false,
            unreadCount: 0
          },
          messages: []
        };
      }
      
      // Add message to conversation
      state.conversations[contactId].messages.push(message);
      
      // Sort messages by timestamp
      state.conversations[contactId].messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    },
    updateMessageStatus: (state, action: PayloadAction<{ messageId: number; status: Message['status'] }>) => {
      const { messageId, status } = action.payload;
      
      // Find message in all conversations
      Object.values(state.conversations).forEach(conversation => {
        const message = conversation.messages.find(m => m.id === messageId);
        if (message) {
          message.status = status;
        }
      });
    },
    markMessagesAsRead: (state, action: PayloadAction<number>) => {
      const contactId = action.payload;
      const currentUserId = parseInt(localStorage.getItem('userId') || '0');
      
      // Find conversation with this contact
      const conversation = state.conversations[contactId];
      if (conversation) {
        // Mark all unread messages from this contact as read
        conversation.messages.forEach(message => {
          if (message.senderId === contactId && message.recipientId === currentUserId && message.status !== 'read') {
            message.status = 'read';
          }
        });
        
        // Reset unread count
        if (conversation.contact) {
          conversation.contact.unreadCount = 0;
        }
      }
    },
    setSharedKey: (state, action: PayloadAction<{ contactId: number; sharedKey: CryptoKey }>) => {
      const { contactId, sharedKey } = action.payload;
      
      // Create conversation if it doesn't exist
      if (!state.conversations[contactId]) {
        state.conversations[contactId] = {
          contact: {
            id: 0, // Will be updated when contact info is fetched
            userId: parseInt(localStorage.getItem('userId') || '0'),
            contactId,
            username: 'Unknown', // Will be updated when contact info is fetched
            isOnline: false,
            unreadCount: 0
          },
          messages: []
        };
      }
      
      // Set shared key
      state.conversations[contactId].sharedKey = sharedKey;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Send Message
    builder.addCase(sendMessage.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.isLoading = false;
      const message = action.payload;
      const contactId = message.recipientId;
      
      // Create conversation if it doesn't exist
      if (!state.conversations[contactId]) {
        state.conversations[contactId] = {
          contact: {
            id: 0, // Will be updated when contact info is fetched
            userId: parseInt(localStorage.getItem('userId') || '0'),
            contactId,
            username: 'Unknown', // Will be updated when contact info is fetched
            isOnline: false,
            unreadCount: 0
          },
          messages: []
        };
      }
      
      // Add message to conversation
      state.conversations[contactId].messages.push(message);
      
      // Sort messages by timestamp
      state.conversations[contactId].messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Fetch Offline Messages
    builder.addCase(fetchOfflineMessages.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchOfflineMessages.fulfilled, (state, action) => {
      state.isLoading = false;
      const messagesBySender = action.payload;
      
      // Add messages to conversations
      Object.entries(messagesBySender).forEach(([senderId, messages]) => {
        const contactId = parseInt(senderId);
        
        // Create conversation if it doesn't exist
        if (!state.conversations[contactId]) {
          state.conversations[contactId] = {
            contact: {
              id: 0, // Will be updated when contact info is fetched
              userId: parseInt(localStorage.getItem('userId') || '0'),
              contactId,
              username: 'Unknown', // Will be updated when contact info is fetched
              isOnline: false,
              unreadCount: messages.length
            },
            messages: []
          };
        }
        
        // Add messages to conversation
        state.conversations[contactId].messages.push(...messages);
        
        // Sort messages by timestamp
        state.conversations[contactId].messages.sort((a, b) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
      });
    });
    builder.addCase(fetchOfflineMessages.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Decrypt Message
    builder.addCase(decryptMessage.fulfilled, (state, action) => {
      const decryptedMessage = action.payload;
      const contactId = decryptedMessage.senderId === parseInt(localStorage.getItem('userId') || '0')
        ? decryptedMessage.recipientId
        : decryptedMessage.senderId;
      
      // Find and update the message in the conversation
      const conversation = state.conversations[contactId];
      if (conversation) {
        const messageIndex = conversation.messages.findIndex(m => 
          m.id === decryptedMessage.id || 
          (m.senderId === decryptedMessage.senderId && 
           m.timestamp === decryptedMessage.timestamp)
        );
        
        if (messageIndex !== -1) {
          conversation.messages[messageIndex] = decryptedMessage;
        }
      }
    });
  }
});

export const { addMessage, updateMessageStatus, markMessagesAsRead, setSharedKey, clearError } = messagesSlice.actions;
export default messagesSlice.reducer;
