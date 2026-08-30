import api from './api';
export const KeyService = {
    /**
     * Generate a local ECDH P-256 key pair. The public half is uploaded to the
     * server (signed by the server) and the private half stays in localStorage.
     */
    async generateKeyPair() {
        const subtle = window.crypto.subtle;
        const keyPair = await subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits']);
        const publicKey = btoa(String.fromCharCode(...new Uint8Array(await subtle.exportKey('spki', keyPair.publicKey))));
        const privateKey = btoa(String.fromCharCode(...new Uint8Array(await subtle.exportKey('pkcs8', keyPair.privateKey))));
        return { publicKey, privateKey, keyType: 'ecdh' };
    },
    /**
     * Upload the public half to the server. Backend always treats the
     * uploaded blob as an ECDH public key and signs it.
     */
    async publishKey(publicKey, options = {}) {
        try {
            const response = await api.post('/keys/publish', {
                public_key: publicKey,
                device_id: options.deviceId,
            });
            return response.data;
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || 'Failed to publish key' };
        }
    },
    /**
     * Fetch a user's ECDH public key. The server returns 200 with
     * `data: null` when the user has not published a key yet, which the slice
     * translates into a sentinel (empty publicKey) without retrying.
     */
    async getUserKey(userId, options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.deviceId)
                params.set('deviceId', options.deviceId);
            const query = params.toString();
            const response = await api.get(`/keys/${userId}${query ? `?${query}` : ''}`);
            return response.data;
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || 'Failed to get user key' };
        }
    },
    /**
     * Server's public key (used to verify key signatures).
     */
    async getServerKey() {
        try {
            const response = await api.get('/keys/server');
            return response.data;
        }
        catch (error) {
            return { success: false, error: error.response?.data?.error || 'Failed to get server key' };
        }
    },
    /**
     * Verify that the signature on a user's public key was produced by the
     * server. Server signs with RSA; this verifies with RSA.
     */
    async verifyKeySignature(userKey, serverPublicKey) {
        try {
            const subtle = window.crypto.subtle;
            const serverKeyBuffer = Uint8Array.from(atob(serverPublicKey), (c) => c.charCodeAt(0));
            const importedServerKey = await subtle.importKey('spki', serverKeyBuffer, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
            const signatureBuffer = Uint8Array.from(atob(userKey.signature), (c) => c.charCodeAt(0));
            const publicKeyBuffer = Uint8Array.from(atob(userKey.publicKey), (c) => c.charCodeAt(0));
            return await subtle.verify({ name: 'RSASSA-PKCS1-v1_5' }, importedServerKey, signatureBuffer, publicKeyBuffer);
        }
        catch (error) {
            console.error('Key verification error:', error);
            return false;
        }
    },
    /**
     * Derive a shared AES-GCM key from a local private key + peer public key.
     */
    async deriveSharedKey(privateKey, peerPublicKey) {
        const subtle = window.crypto.subtle;
        const privateKeyBuffer = Uint8Array.from(atob(privateKey), (c) => c.charCodeAt(0));
        const importedPrivateKey = await subtle.importKey('pkcs8', privateKeyBuffer, { name: 'ECDH', namedCurve: 'P-256' }, false, ['deriveKey', 'deriveBits']);
        const peerPublicKeyBuffer = Uint8Array.from(atob(peerPublicKey), (c) => c.charCodeAt(0));
        const importedPeerPublicKey = await subtle.importKey('spki', peerPublicKeyBuffer, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
        return subtle.deriveKey({ name: 'ECDH', public: importedPeerPublicKey }, importedPrivateKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
    },
};
