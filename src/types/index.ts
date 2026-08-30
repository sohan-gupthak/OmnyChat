// User types -----------------------------------------------------------------
export interface User {
  id: number;
  username: string;
  email: string;
  is_active?: boolean;
  last_login_at?: string | null;
  createdAt?: string;
  created_at?: string;
}

export interface UserWithPresence extends User {
  isOnline: boolean;
}

// Auth -----------------------------------------------------------------------
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

// Keys -----------------------------------------------------------------------
export type KeyType = 'ecdh';

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  keyType?: KeyType;
}

/**
 * Public-key record returned by the server.
 * `signature` is the server's signature of `publicKey`.
 */
export interface UserKey {
  id?: number;
  userId?: number;
  publicKey: string;
  signature: string;
  keyType: KeyType;
  keyAlgorithm?: KeyAlgorithm;
  deviceId?: string | null;
  isActive?: boolean;
  createdAt?: string;
  verified?: boolean;
}

// Contacts -------------------------------------------------------------------
export interface Contact {
  id: number;
  userId: number;
  contactId: number;
  username: string;
  email?: string;
  isOnline: boolean;
  lastSeen?: string;
  unreadCount: number;
}

// Messages -------------------------------------------------------------------
export interface Message {
  id?: number;
  senderId: number;
  recipientId: number;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  isEncrypted: boolean;
  isRead?: boolean;
  isDelivered?: boolean;
  clientMessageId?: string;
}

export interface Conversation {
  contact: Contact;
  messages: Message[];
}

// WebRTC ---------------------------------------------------------------------
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

// WebSocket ------------------------------------------------------------------
export type WebSocketMessageType =
  | 'connect'
  | 'disconnect'
  | 'signal'
  | 'message'
  | 'presence'
  | 'error';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: any;
}

// API responses --------------------------------------------------------------
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface OfflineMessagesResponse {
  messages: Array<{
    id: number;
    sender: number;
    recipient?: number;
    content: string;
    timestamp: string;
    isRead?: boolean;
    isDelivered?: boolean;
    clientMessageId?: string;
  }>;
}

export interface UserSearchResponse {
  users: User[];
}

export interface UserContactsResponse {
  contacts: Contact[];
}

export interface ContactResponse {
  contact: Contact;
}

export interface UserResponse {
  user: User;
}

// Contact requests -----------------------------------------------------------
export type ContactRequestStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface ContactRequest {
  id: number;
  sender_id: number;
  recipient_id: number;
  status: ContactRequestStatus;
  message?: string | null;
  created_at: string;
  updated_at: string;
  sender?: User;
  recipient?: User;
}

export interface PendingRequestsResponse {
  requests: ContactRequest[];
}

export interface SentRequestsResponse {
  requests: ContactRequest[];
}

export interface ContactRequestResponse {
  request: ContactRequest;
}
