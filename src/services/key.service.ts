import api from './api';
import { KeyPair, UserKey, ApiResponse } from '../types';

export const KeyService = {
  /**
   * Generate a new key pair for secure communication
   * @param keyType Type of key to generate ('ecdh' or 'ed25519')
   * @returns Promise with public and private keys
   */
  async generateKeyPair(keyType: string = 'ecdh'): Promise<KeyPair> {
    if (keyType === 'ecdh') {
      // Generate ECDH key pair using Web Crypto API
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'P-256'
        },
        true,
        ['deriveKey', 'deriveBits']
      );

      // Export public key
      const publicKeyBuffer = await window.crypto.subtle.exportKey(
        'spki',
        keyPair.publicKey
      );
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));

      // Export private key
      const privateKeyBuffer = await window.crypto.subtle.exportKey(
        'pkcs8',
        keyPair.privateKey
      );
      const privateKey = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));

      return { publicKey, privateKey };
    } else if (keyType === 'ed25519') {
      // For Ed25519, we'll use the same ECDH generation for now
      // In a real implementation, you'd use a proper Ed25519 library like tweetnacl
      // This is just to make the system work for demonstration purposes
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'ECDH',
          namedCurve: 'P-256'
        },
        true,
        ['deriveKey', 'deriveBits']
      );

      // Export public key
      const publicKeyBuffer = await window.crypto.subtle.exportKey(
        'spki',
        keyPair.publicKey
      );
      const publicKey = btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer)));

      // Export private key
      const privateKeyBuffer = await window.crypto.subtle.exportKey(
        'pkcs8',
        keyPair.privateKey
      );
      const privateKey = btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer)));

      return { publicKey, privateKey, keyType: 'ed25519' };
    } else {
      throw new Error(`Unsupported key type: ${keyType}`);
    }
  },

  /**
   * Publish user's public key to the server
   * @param publicKey User's public key
   * @param keyType Type of the key (default: 'ecdh')
   * @returns Promise with server-signed key
   */
  async publishKey(publicKey: string, keyType: string = 'ecdh'): Promise<ApiResponse<UserKey>> {
    try {
      const response = await api.post('/keys/publish', { 
        public_key: publicKey, // Match backend parameter name
        key_type: keyType      // Match backend parameter name
      });
      return response.data;
    } catch (error: any) {
      console.error('Error publishing key:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to publish key'
      };
    }
  },

  /**
   * Get a user's public key
   * @param userId User ID
   * @returns Promise with user's public key
   */
  async getUserKey(userId: number): Promise<ApiResponse<UserKey>> {
    try {
      const response = await api.get(`/keys/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get user key'
      };
    }
  },

  /**
   * Get the server's public key for verification
   * @returns Promise with server's public key
   */
  async getServerKey(): Promise<ApiResponse<{ publicKey: string }>> {
    try {
      const response = await api.get('/keys/server');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get server key'
      };
    }
  },

  /**
   * Verify a user's key signature using the server's public key
   * @param userKey User key with signature
   * @param serverPublicKey Server's public key
   * @returns Boolean indicating if signature is valid
   */
  async verifyKeySignature(userKey: UserKey, serverPublicKey: string): Promise<boolean> {
    try {
      // Import server public key
      const serverKeyBuffer = Uint8Array.from(atob(serverPublicKey), c => c.charCodeAt(0));
      const importedServerKey = await window.crypto.subtle.importKey(
        'spki',
        serverKeyBuffer,
        {
          name: 'ECDSA',
          namedCurve: 'P-256'
        },
        false,
        ['verify']
      );

      // Convert signature to buffer
      const signatureBuffer = Uint8Array.from(atob(userKey.signature), c => c.charCodeAt(0));
      
      // Convert public key to buffer for verification
      const publicKeyBuffer = Uint8Array.from(atob(userKey.publicKey), c => c.charCodeAt(0));

      // Verify signature
      return await window.crypto.subtle.verify(
        {
          name: 'ECDSA',
          hash: { name: 'SHA-256' }
        },
        importedServerKey,
        signatureBuffer,
        publicKeyBuffer
      );
    } catch (error) {
      console.error('Key verification error:', error);
      return false;
    }
  },

  /**
   * Derive a shared secret key for end-to-end encryption
   * @param privateKey Local private key
   * @param peerPublicKey Peer's public key
   * @returns Promise with derived AES key
   */
  async deriveSharedKey(privateKey: string, peerPublicKey: string): Promise<CryptoKey> {
    // Import private key
    const privateKeyBuffer = Uint8Array.from(atob(privateKey), c => c.charCodeAt(0));
    const importedPrivateKey = await window.crypto.subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      false,
      ['deriveKey', 'deriveBits']
    );

    // Import peer's public key
    const peerPublicKeyBuffer = Uint8Array.from(atob(peerPublicKey), c => c.charCodeAt(0));
    const importedPeerPublicKey = await window.crypto.subtle.importKey(
      'spki',
      peerPublicKeyBuffer,
      {
        name: 'ECDH',
        namedCurve: 'P-256'
      },
      false,
      []
    );

    // Derive shared secret
    return await window.crypto.subtle.deriveKey(
      {
        name: 'ECDH',
        public: importedPeerPublicKey
      },
      importedPrivateKey,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }
};
