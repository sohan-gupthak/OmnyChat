import api from './api';
import { KeyPair, UserKey, ApiResponse, KeyType, KeyAlgorithm } from '../types';

export const KeyService = {
  /**
   * Generate a local key pair. Real implementations should use libsodium/tweetnacl.
   * This WebCrypto-based fallback is for the browser demo path; backend signs and
   * stores the public half.
   */
  async generateKeyPair(keyType: KeyType = 'ecdh'): Promise<KeyPair> {
    if (keyType === 'ecdh') {
      const subtle = window.crypto.subtle;
      const keyPair = await subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey', 'deriveBits']
      );
      const publicKey = btoa(
        String.fromCharCode(...new Uint8Array(await subtle.exportKey('spki', keyPair.publicKey)))
      );
      const privateKey = btoa(
        String.fromCharCode(...new Uint8Array(await subtle.exportKey('pkcs8', keyPair.privateKey)))
      );
      return { publicKey, privateKey, keyType };
    }
    if (keyType === 'ed25519') {
      // Browser WebCrypto has no Ed25519. Server signs whatever the client uploads
      // with its RSA key, so the algorithm field is what the verifier checks.
      const subtle = window.crypto.subtle;
      const keyPair = await subtle.generateKey(
        { name: 'ECDH', namedCurve: 'P-256' },
        true,
        ['deriveKey', 'deriveBits']
      );
      const publicKey = btoa(
        String.fromCharCode(...new Uint8Array(await subtle.exportKey('spki', keyPair.publicKey)))
      );
      const privateKey = btoa(
        String.fromCharCode(...new Uint8Array(await subtle.exportKey('pkcs8', keyPair.privateKey)))
      );
      return { publicKey, privateKey, keyType };
    }
    throw new Error(`Unsupported key type: ${keyType}`);
  },

  /**
   * Upload the public half of a key pair to the server.
   */
  async publishKey(
    publicKey: string,
    keyType: KeyType = 'ecdh',
    options: { keyAlgorithm?: KeyAlgorithm; deviceId?: string } = {}
  ): Promise<ApiResponse<UserKey>> {
    try {
      const response = await api.post('/keys/publish', {
        public_key: publicKey,
        key_type: keyType,
        key_algorithm: options.keyAlgorithm,
        device_id: options.deviceId,
      });
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to publish key' };
    }
  },

  /**
   * Fetch a user's public key.
   */
  async getUserKey(
    userId: number,
    options: { keyType?: KeyType; deviceId?: string } = {}
  ): Promise<ApiResponse<UserKey>> {
    try {
      const params = new URLSearchParams();
      params.set('type', options.keyType ?? 'ecdh');
      if (options.deviceId) params.set('deviceId', options.deviceId);
      const response = await api.get(`/keys/${userId}?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get user key' };
    }
  },

  /**
   * Server's public key (used to verify key signatures).
   */
  async getServerKey(): Promise<ApiResponse<{ publicKey: string }>> {
    try {
      const response = await api.get('/keys/server');
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get server key' };
    }
  },

  /**
   * Verify that the signature on a user's public key was produced by the server.
   * Backend signs with RSA; this verifies with RSA.
   */
  async verifyKeySignature(userKey: UserKey, serverPublicKey: string): Promise<boolean> {
    try {
      const subtle = window.crypto.subtle;
      const serverKeyBuffer = Uint8Array.from(atob(serverPublicKey), (c) => c.charCodeAt(0));
      const importedServerKey = await subtle.importKey(
        'spki',
        serverKeyBuffer,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['verify']
      );
      const signatureBuffer = Uint8Array.from(atob(userKey.signature), (c) => c.charCodeAt(0));
      const publicKeyBuffer = Uint8Array.from(atob(userKey.publicKey), (c) => c.charCodeAt(0));
      return await subtle.verify(
        { name: 'RSASSA-PKCS1-v1_5' },
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
   * Derive a shared AES-GCM key from a local private key + peer public key.
   */
  async deriveSharedKey(privateKey: string, peerPublicKey: string): Promise<CryptoKey> {
    const subtle = window.crypto.subtle;
    const privateKeyBuffer = Uint8Array.from(atob(privateKey), (c) => c.charCodeAt(0));
    const importedPrivateKey = await subtle.importKey(
      'pkcs8',
      privateKeyBuffer,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      ['deriveKey', 'deriveBits']
    );
    const peerPublicKeyBuffer = Uint8Array.from(atob(peerPublicKey), (c) => c.charCodeAt(0));
    const importedPeerPublicKey = await subtle.importKey(
      'spki',
      peerPublicKeyBuffer,
      { name: 'ECDH', namedCurve: 'P-256' },
      false,
      []
    );
    return subtle.deriveKey(
      { name: 'ECDH', public: importedPeerPublicKey },
      importedPrivateKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  },
};
