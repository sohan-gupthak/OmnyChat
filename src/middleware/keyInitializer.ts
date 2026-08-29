import { Middleware } from 'redux';
import { generateKeyPair, publishKey, getServerKey } from '../store/slices/keysSlice';
import { login, register } from '../store/slices/authSlice';
import { KeyPair, KeyType } from '../types';

type AppDispatch = any;

let isGeneratingKeys = false;

async function initializeKeys(dispatch: AppDispatch): Promise<void> {
  if (isGeneratingKeys) {
    console.log('Key generation already in progress, skipping...');
    return;
  }
  isGeneratingKeys = true;
  try {
    console.log('Starting key generation and publishing...');

    const ecdhResult = await dispatch(generateKeyPair('ecdh'));
    if (ecdhResult.meta.requestStatus !== 'fulfilled') {
      throw new Error('ECDH key pair generation failed');
    }
    const ecdhKeyPair = ecdhResult.payload as KeyPair;

    const publishEcdh = await dispatch(
      publishKey({ publicKey: ecdhKeyPair.publicKey, keyType: 'ecdh' as KeyType })
    );
    if (publishEcdh.meta.requestStatus !== 'fulfilled') {
      throw new Error('ECDH key publishing failed');
    }

    // Ed25519 is optional: skip if the server doesn't accept a placeholder.
    try {
      const ed25519Result = await dispatch(generateKeyPair('ed25519'));
      if (ed25519Result.meta.requestStatus === 'fulfilled') {
        const ed25519KeyPair = ed25519Result.payload as KeyPair;
        await dispatch(
          publishKey({ publicKey: ed25519KeyPair.publicKey, keyType: 'ed25519' as KeyType })
        );
      }
    } catch (err) {
      console.warn('Ed25519 key generation/publish skipped:', err);
    }

    await dispatch(getServerKey());
    console.log('Key initialization completed');
  } catch (error) {
    console.error('Error in key initialization:', error);
  } finally {
    isGeneratingKeys = false;
  }
}

export const keyInitializerMiddleware: Middleware = ({ dispatch, getState }) => (next) => (action) => {
  const result = next(action);
  if (login.fulfilled.match(action) || register.fulfilled.match(action)) {
    setTimeout(() => {
      void initializeKeys(dispatch as AppDispatch);
    }, 500);
  }
  return result;
};
