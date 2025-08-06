// User types
export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface UserWithPresence extends User {
  isOnline: boolean;
}

// Authentication types
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

// Key types
export interface KeyPair {
  publicKey: string;
  privateKey: string;
  keyType?: string; // Type of key ('ecdh' or 'ed25519')
}

export interface UserKey {
  userId: number;
  publicKey: string;
  signature: string;
  createdAt: string;
  verified?: boolean; // Whether the key has been manually verified by the user
}

// Chat types
export interface Contact {
  id: number;
  userId: number;
  contactId: number;
  username: string;
  isOnline: boolean;
  lastSeen?: string;
  unreadCount: number;
}

export interface Message {
  id?: number;
  senderId: number;
  recipientId: number;
  content: string; // Encrypted content
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  isEncrypted: boolean;
}

export interface Conversation {
  contact: Contact;
  messages: Message[];
  sharedKey?: CryptoKey; // For end-to-end encryption
}

// WebRTC types
export interface SignalData {
  type: string;
  sdp?: string;
  candidate?: RTCIceCandidate;
}

export interface WebRTCState {
  connections: Record<number, RTCPeerConnection>;
  dataChannels: Record<number, RTCDataChannel>;
  isConnecting: boolean;
  error: string | null;
}

// WebSocket types
export interface WebSocketMessage {
  type: 'connect' | 'disconnect' | 'signal' | 'message' | 'presence' | 'error';
  payload: any;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Offline messages response type
export interface OfflineMessagesResponse {
  messages: {
    id: number;
    sender: number;
    content: string;
    timestamp: string;
  }[];
}

// User search response type
export interface UserSearchResponse {
  users: User[];
}

// User contacts response type
export interface UserContactsResponse {
  contacts: Contact[];
}

// Contact response type
export interface ContactResponse {
  contact: Contact;
}

// Single user response type
export interface UserResponse {
  user: User;
}

// Contact request types
export interface ContactRequest {
  id: number;
  sender_id: number;
  recipient_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
  sender?: User;
  recipient?: User;
}

// Contact request response types
export interface PendingRequestsResponse {
  requests: ContactRequest[];
}

export interface SentRequestsResponse {
  requests: ContactRequest[];
}

export interface ContactRequestResponse {
  request: ContactRequest;
}
