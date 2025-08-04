import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { KeyPair, UserKey } from '../../types';
import { KeyService } from '../../services';

// Define the state interface
interface KeysState {
  keyPair: (KeyPair & { signature?: string }) | null;
  serverKey: string | null;
  contactKeys: Record<number, UserKey>;
  isLoading: boolean;
  error: string | null;
}

// Initial state
const initialState: KeysState = {
  keyPair: null,
  serverKey: null,
  contactKeys: {},
  isLoading: false,
  error: null
};

// Async thunks
export const generateKeyPair = createAsyncThunk(
  'keys/generateKeyPair',
  async (keyType: string = 'ecdh', { rejectWithValue }) => {
    try {
      const keyPair = await KeyService.generateKeyPair(keyType);
      return keyPair;
    } catch (error: any) {
      return rejectWithValue(error.message || `Failed to generate ${keyType} key pair`);
    }
  }
);

export const publishKey = createAsyncThunk(
  'keys/publishKey',
  async ({ publicKey, keyType }: { publicKey: string; keyType: string }, { rejectWithValue }) => {
    try {
      const response = await KeyService.publishKey(publicKey, keyType);
      if (!response.success || !response.data) {
        console.error(`Failed to publish ${keyType} key:`, response.error);
        return rejectWithValue(response.error || `Failed to publish ${keyType} key`);
      }
      return { ...response.data, keyType };
    } catch (error: any) {
      console.error(`Error in publishKey thunk for ${keyType}:`, error);
      return rejectWithValue(error.message || `Failed to publish ${keyType} key`);
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

export const getUserKey = createAsyncThunk(
  'keys/getUserKey',
  async (userId: number, { rejectWithValue }) => {
    try {
      const response = await KeyService.getUserKey(userId);
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || 'Failed to get user key');
      }
      return { userId, key: response.data };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to get user key');
    }
  }
);

export const verifyKeySignature = createAsyncThunk(
  'keys/verifyKeySignature',
  async ({ userKey, serverPublicKey }: { userKey: UserKey; serverPublicKey: string }, { rejectWithValue }) => {
    try {
      const isValid = await KeyService.verifyKeySignature(userKey, serverPublicKey);
      if (!isValid) {
        return rejectWithValue('Invalid key signature');
      }
      return { userKey, isValid };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to verify key signature');
    }
  }
);

// Keys slice
const keysSlice = createSlice({
  name: 'keys',
  initialState,
  reducers: {
    setKeyPair: (state, action: PayloadAction<KeyPair>) => {
      state.keyPair = action.payload;
    },
    markKeyAsVerified: (state, action: PayloadAction<number>) => {
      const contactId = action.payload;
      if (state.contactKeys[contactId]) {
        state.contactKeys[contactId].verified = true;
      }
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Generate Key Pair
    builder.addCase(generateKeyPair.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(generateKeyPair.fulfilled, (state, action) => {
      state.isLoading = false;
      state.keyPair = action.payload;
    });
    builder.addCase(generateKeyPair.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Publish Key
    builder.addCase(publishKey.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(publishKey.fulfilled, (state, action) => {
      state.isLoading = false;
      // If we have a key pair, update it with the signed key
      if (state.keyPair) {
        state.keyPair.publicKey = action.payload.publicKey;
        state.keyPair.signature = action.payload.signature;
      }
    });
    builder.addCase(publishKey.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Get Server Key
    builder.addCase(getServerKey.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getServerKey.fulfilled, (state, action) => {
      state.isLoading = false;
      state.serverKey = action.payload;
    });
    builder.addCase(getServerKey.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Get User Key
    builder.addCase(getUserKey.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getUserKey.fulfilled, (state, action) => {
      state.isLoading = false;
      const { userId, key } = action.payload;
      state.contactKeys[userId] = key;
    });
    builder.addCase(getUserKey.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Verify Key Signature
    builder.addCase(verifyKeySignature.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyKeySignature.fulfilled, (state, action) => {
      state.isLoading = false;
      // Key is already verified, nothing to update
    });
    builder.addCase(verifyKeySignature.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setKeyPair, markKeyAsVerified, clearError } = keysSlice.actions;
export default keysSlice.reducer;
