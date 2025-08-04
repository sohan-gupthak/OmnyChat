import { Middleware } from 'redux';
import { generateKeyPair, publishKey, getServerKey } from '../store/slices/keysSlice';
import { login, register } from '../store/slices/authSlice';
import { KeyPair } from '../types';

// We'll define AppDispatch type here to avoid circular dependency
type AppDispatch = any; // This will be properly typed when used

// Flag to track if we're already generating keys to prevent duplicate calls
let isGeneratingKeys = false;

/**
 * Helper function to initialize keys using async/await
 */
async function initializeKeys(dispatch: AppDispatch): Promise<void> {
  // Check if we're already generating keys
  if (isGeneratingKeys) {
    console.log('Key generation already in progress, skipping...');
    return;
  }
  
  // Set flag to prevent duplicate calls
  isGeneratingKeys = true;
  
  try {
    console.log('Starting automatic key generation and publishing...');
    
    // Generate ECDH key pair
    const ecdhKeyPairResult = await dispatch(generateKeyPair('ecdh'));
    if (ecdhKeyPairResult.meta.requestStatus !== 'fulfilled') {
      throw new Error('ECDH key pair generation failed');
    }
    
    const ecdhKeyPair = ecdhKeyPairResult.payload as KeyPair;
    console.log('ECDH key pair generated successfully');
    
    // Publish the ECDH public key
    const publishEcdhResult = await dispatch(publishKey({
      publicKey: ecdhKeyPair.publicKey,
      keyType: 'ecdh'
    }));
    if (publishEcdhResult.meta.requestStatus !== 'fulfilled') {
      throw new Error('ECDH key publishing failed');
    }
    console.log('ECDH public key published successfully');
    
    // Generate Ed25519 key pair
    const ed25519KeyPairResult = await dispatch(generateKeyPair('ed25519'));
    if (ed25519KeyPairResult.meta.requestStatus !== 'fulfilled') {
      throw new Error('Ed25519 key pair generation failed');
    }
    
    const ed25519KeyPair = ed25519KeyPairResult.payload as KeyPair;
    console.log('Ed25519 key pair generated successfully');
    
    // Publish the Ed25519 public key
    const publishEd25519Result = await dispatch(publishKey({
      publicKey: ed25519KeyPair.publicKey,
      keyType: 'ed25519'
    }));
    if (publishEd25519Result.meta.requestStatus !== 'fulfilled') {
      throw new Error('Ed25519 key publishing failed');
    }
    console.log('Ed25519 public key published successfully');
    
    // Get the server key for verification
    const serverKeyResult = await dispatch(getServerKey());
    if (serverKeyResult.meta.requestStatus === 'fulfilled') {
      console.log('Server key retrieved successfully');
    }
    
    console.log('Key initialization completed successfully');
  } catch (error) {
    console.error('Error in key initialization:', error);
  } finally {
    // Reset flag regardless of success or failure
    isGeneratingKeys = false;
  }
}

/**
 * Middleware to handle key generation and publishing after authentication
 */
export const keyInitializerMiddleware: Middleware = ({ dispatch, getState }) => next => action => {
  // First, pass the action through to the next middleware
  const result = next(action);
  
  // Check if the action is a fulfilled login or register action
  if (
    login.fulfilled.match(action) || 
    register.fulfilled.match(action)
  ) {
    // Get the current state
    const state = getState();
    
    // Always attempt to initialize keys after authentication
    // The initializeKeys function will check if keys already exist
    setTimeout(() => {
      initializeKeys(dispatch as AppDispatch);
    }, 500); // Small delay to ensure state is fully updated
  }
  
  return result;
};
