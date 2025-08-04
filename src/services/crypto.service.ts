/**
 * Service for handling end-to-end encryption of messages
 */
export class CryptoService {
  /**
   * Encrypt a message using AES-GCM
   * @param message Message to encrypt
   * @param key AES key for encryption
   * @returns Promise with encrypted message as base64 string
   */
  async encryptMessage(message: string, key: CryptoKey): Promise<string> {
    try {
      // Generate random IV
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      
      // Convert message to buffer
      const messageBuffer = new TextEncoder().encode(message);
      
      // Encrypt message
      const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        messageBuffer
      );
      
      // Combine IV and encrypted data
      const result = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      result.set(iv);
      result.set(new Uint8Array(encryptedBuffer), iv.length);
      
      // Convert to base64
      return btoa(String.fromCharCode(...result));
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt message');
    }
  }
  
  /**
   * Decrypt a message using AES-GCM
   * @param encryptedMessage Encrypted message as base64 string
   * @param key AES key for decryption
   * @returns Promise with decrypted message
   */
  async decryptMessage(encryptedMessage: string, key: CryptoKey): Promise<string> {
    try {
      // Convert base64 to buffer
      const encryptedBuffer = Uint8Array.from(atob(encryptedMessage), c => c.charCodeAt(0));
      
      // Extract IV (first 12 bytes)
      const iv = encryptedBuffer.slice(0, 12);
      
      // Extract encrypted data
      const data = encryptedBuffer.slice(12);
      
      // Decrypt message
      const decryptedBuffer = await window.crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv
        },
        key,
        data
      );
      
      // Convert to string
      return new TextDecoder().decode(decryptedBuffer);
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt message');
    }
  }
  
  /**
   * Generate a random key for symmetric encryption
   * @returns Promise with AES-GCM key
   */
  async generateSymmetricKey(): Promise<CryptoKey> {
    return await window.crypto.subtle.generateKey(
      {
        name: 'AES-GCM',
        length: 256
      },
      true,
      ['encrypt', 'decrypt']
    );
  }
  
  /**
   * Export a CryptoKey to base64 string
   * @param key CryptoKey to export
   * @returns Promise with base64 string
   */
  async exportKey(key: CryptoKey): Promise<string> {
    const exportedKey = await window.crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(exportedKey)));
  }
  
  /**
   * Import a base64 string as CryptoKey
   * @param keyData Base64 string of key data
   * @returns Promise with imported CryptoKey
   */
  async importKey(keyData: string): Promise<CryptoKey> {
    const keyBuffer = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));
    return await window.crypto.subtle.importKey(
      'raw',
      keyBuffer,
      {
        name: 'AES-GCM',
        length: 256
      },
      false,
      ['encrypt', 'decrypt']
    );
  }
}

// Create singleton instance
const cryptoService = new CryptoService();
export default cryptoService;
