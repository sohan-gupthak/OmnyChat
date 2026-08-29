import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { KeyPair, UserKey, KeyType } from '../../types';
import { KeyService } from '../../services';

const STORAGE_PRIVATE = 'omnychat:ecdhPrivateKey';
const STORAGE_PUBLIC = 'omnychat:ecdhPublicKey';
const STORAGE_DEVICE = 'omnychat:deviceId';

function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(STORAGE_DEVICE);
  if (existing) return existing;
  const fresh =
    typeof crypto !== 'undefined' && typeof (crypto as any).randomUUID === 'function'
      ? (crypto as any).randomUUID()
      : `dev-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  localStorage.setItem(STORAGE_DEVICE, fresh);
  return fresh;
}

function readPersistedKeyPair(): KeyPair | null {
  const priv = localStorage.getItem(STORAGE_PRIVATE);
  const pub = localStorage.getItem(STORAGE_PUBLIC);
  if (!priv || !pub) return null;
  return { publicKey: pub, privateKey: priv, keyType: 'ecdh' };
}

function persistKeyPair(kp: KeyPair): void {
  localStorage.setItem(STORAGE_PUBLIC, kp.publicKey);
  localStorage.setItem(STORAGE_PRIVATE, kp.privateKey);
}

interface KeysState {
  keyPair: (KeyPair & { signature?: string }) | null;
  deviceId: string;
  serverKey: string | null;
  contactKeys: Record<number, UserKey>;
  isLoading: boolean;
  bootstrapped: boolean;
  error: string | null;
}

const initialState: KeysState = {
  keyPair: readPersistedKeyPair(),
  deviceId: getOrCreateDeviceId(),
  serverKey: null,
  contactKeys: {},
  isLoading: false,
  bootstrapped: false,
  error: null,
};

export const generateKeyPair = createAsyncThunk(
  'keys/generateKeyPair',
  async (_, { rejectWithValue }) => {
    try {
      return await KeyService.generateKeyPair();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to generate ECDH key pair');
    }
  }
);

export const publishKey = createAsyncThunk(
  'keys/publishKey',
  async (
    { publicKey, deviceId }: { publicKey: string; deviceId?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await KeyService.publishKey(publicKey, { deviceId });
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to publish ECDH key');
      }
      return { ...response.data, keyType: 'ecdh' as const };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to publish ECDH key');
    }
  }
);

export const getServerKey = createAsyncThunk(
  'keys/getServerKey',
  async (_, { rejectWithValue }) => {
    try {
      const response = await KeyService.getServerKey();
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to get server key');
      }
      return response.data.publicKey;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get server key');
    }
  }
);

interface GetUserKeyResult {
  userId: number;
  key: UserKey | null;
}

export const getUserKey = createAsyncThunk<
  GetUserKeyResult,
  number,
  { rejectValue: { userId: number; message: string } }
>('keys/getUserKey', async (userId, { rejectWithValue }) => {
  try {
    const response = await KeyService.getUserKey(userId);
    if (!response.success) {
      return rejectWithValue({ userId, message: response.error || 'Failed to get user key' });
    }
    return { userId, key: response.data ?? null };
  } catch (error: any) {
    return rejectWithValue({ userId, message: error?.message || 'Failed to get user key' });
  }
});

export const verifyKeySignature = createAsyncThunk(
  'keys/verifyKeySignature',
  async (
    { userKey, serverPublicKey }: { userKey: UserKey; serverPublicKey: string },
    { rejectWithValue }
  ) => {
    try {
      const isValid = await KeyService.verifyKeySignature(userKey, serverPublicKey);
      if (!isValid) return rejectWithValue('Invalid key signature');
      return { userKey, isValid };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify key signature');
    }
  }
);

/**
 * Idempotent bootstrap. Generates a local ECDH key pair if missing, publishes
 * the public half, and fetches the server's public key. Safe to call on every
 * App mount while authenticated.
 */
export const ensureLocalKeysBootstrapped = createAsyncThunk<
  void,
  void,
  { state: { keys: KeysState } }
>('keys/ensureBootstrapped', async (_arg, { dispatch, getState }) => {
  const { keyPair, deviceId, bootstrapped } = getState().keys;
  if (bootstrapped && keyPair) return;
  let pair: KeyPair | null = keyPair;
  if (!pair) {
    const result = await dispatch(generateKeyPair());
    if (generateKeyPair.rejected.match(result)) {
      throw new Error('Failed to generate ECDH key pair');
    }
    pair = result.payload as KeyPair;
    persistKeyPair(pair);
  }
  const pubResult = await dispatch(
    publishKey({ publicKey: pair.publicKey, deviceId })
  );
  if (publishKey.rejected.match(pubResult)) {
    throw new Error('Failed to publish ECDH public key');
  }
  dispatch(getServerKey());
});

const EMPTY_USER_KEY: Pick<UserKey, 'publicKey' | 'signature' | 'keyType'> = {
  publicKey: '',
  signature: '',
  keyType: 'ecdh',
};

const keysSlice = createSlice({
  name: 'keys',
  initialState,
  reducers: {
    setKeyPair: (state, action: PayloadAction<KeyPair>) => {
      state.keyPair = action.payload;
      persistKeyPair(action.payload);
    },
    markKeyAsVerified: (state, action: PayloadAction<number>) => {
      const contactId = action.payload;
      if (state.contactKeys[contactId]) {
        state.contactKeys[contactId].verified = true;
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(generateKeyPair.fulfilled, (state, action) => {
      const pair = action.payload as KeyPair;
      state.keyPair = pair;
      persistKeyPair(pair);
    });

    builder.addCase(publishKey.fulfilled, (state, action) => {
      const payload = action.payload as UserKey & { keyType: KeyType };
      const candidate = payload as unknown as { signature?: string; signedKey?: string };
      const sig = candidate.signature ?? candidate.signedKey ?? '';
      if (state.keyPair && state.keyPair.publicKey === payload.publicKey) {
        state.keyPair = { ...state.keyPair, signature: sig };
      }
    });

    builder.addCase(getServerKey.fulfilled, (state, action) => {
      state.serverKey = action.payload as string;
    });

    builder.addCase(getUserKey.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getUserKey.fulfilled, (state, action) => {
      state.isLoading = false;
      const { userId, key } = action.payload;
      if (key) {
        state.contactKeys[userId] = key;
      } else {
        state.contactKeys[userId] = { userId, ...EMPTY_USER_KEY };
      }
    });
    builder.addCase(getUserKey.rejected, (state, action) => {
      state.isLoading = false;
      const payload = action.payload as { userId: number; message: string } | undefined;
      if (payload && payload.userId !== undefined) {
        state.contactKeys[payload.userId] = { userId: payload.userId, ...EMPTY_USER_KEY };
      } else {
        state.error =
          typeof action.payload === 'string'
            ? (action.payload as string)
            : 'Failed to get user key';
      }
    });

    builder.addCase(ensureLocalKeysBootstrapped.fulfilled, (state) => {
      state.bootstrapped = true;
    });
    builder.addCase(ensureLocalKeysBootstrapped.rejected, (state, action) => {
      state.error = action.error.message || 'Key bootstrap failed';
    });
  },
});

export const { setKeyPair, markKeyAsVerified, clearError } = keysSlice.actions;
export default keysSlice.reducer;
