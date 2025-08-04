import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { contactRequestService } from '../../services/contact-request.service';
import { ContactRequest } from '../../types';

interface ContactRequestsState {
  pendingRequests: ContactRequest[];
  sentRequests: ContactRequest[];
  isLoading: boolean;
  error: string | null;
}

const initialState: ContactRequestsState = {
  pendingRequests: [],
  sentRequests: [],
  isLoading: false,
  error: null
};

// Async thunks
export const fetchPendingRequests = createAsyncThunk(
  'contactRequests/fetchPending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactRequestService.getPendingRequests();
      return response.data?.requests || [];
    } catch (error: any) {
      return rejectWithValue(error.error || 'Failed to fetch pending requests');
    }
  }
);

export const fetchSentRequests = createAsyncThunk(
  'contactRequests/fetchSent',
  async (_, { rejectWithValue }) => {
    try {
      const response = await contactRequestService.getSentRequests();
      return response.data?.requests || [];
    } catch (error: any) {
      return rejectWithValue(error.error || 'Failed to fetch sent requests');
    }
  }
);

export const sendContactRequest = createAsyncThunk(
  'contactRequests/send',
  async (recipientId: number, { rejectWithValue }) => {
    try {
      const response = await contactRequestService.sendRequest(recipientId);
      return response.data?.request;
    } catch (error: any) {
      return rejectWithValue(error.error || 'Failed to send contact request');
    }
  }
);

export const acceptContactRequest = createAsyncThunk(
  'contactRequests/accept',
  async (requestId: number, { rejectWithValue }) => {
    try {
      await contactRequestService.acceptRequest(requestId);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(error.error || 'Failed to accept contact request');
    }
  }
);

export const rejectContactRequest = createAsyncThunk(
  'contactRequests/reject',
  async (requestId: number, { rejectWithValue }) => {
    try {
      await contactRequestService.rejectRequest(requestId);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(error.error || 'Failed to reject contact request');
    }
  }
);

export const cancelContactRequest = createAsyncThunk(
  'contactRequests/cancel',
  async (requestId: number, { rejectWithValue }) => {
    try {
      await contactRequestService.cancelRequest(requestId);
      return requestId;
    } catch (error: any) {
      return rejectWithValue(error.error || 'Failed to cancel contact request');
    }
  }
);

const contactRequestsSlice = createSlice({
  name: 'contactRequests',
  initialState,
  reducers: {
    clearContactRequestsError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch pending requests
      .addCase(fetchPendingRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPendingRequests.fulfilled, (state, action: PayloadAction<ContactRequest[]>) => {
        state.pendingRequests = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchPendingRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch sent requests
      .addCase(fetchSentRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSentRequests.fulfilled, (state, action: PayloadAction<ContactRequest[]>) => {
        state.sentRequests = action.payload;
        state.isLoading = false;
      })
      .addCase(fetchSentRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Send contact request
      .addCase(sendContactRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendContactRequest.fulfilled, (state, action) => {
        if (action.payload) {
          state.sentRequests.push(action.payload as ContactRequest);
        }
        state.isLoading = false;
      })
      .addCase(sendContactRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Accept contact request
      .addCase(acceptContactRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptContactRequest.fulfilled, (state, action: PayloadAction<number>) => {
        state.pendingRequests = state.pendingRequests.filter(
          request => request.id !== action.payload
        );
        state.isLoading = false;
      })
      .addCase(acceptContactRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Reject contact request
      .addCase(rejectContactRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectContactRequest.fulfilled, (state, action: PayloadAction<number>) => {
        state.pendingRequests = state.pendingRequests.filter(
          request => request.id !== action.payload
        );
        state.isLoading = false;
      })
      .addCase(rejectContactRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Cancel contact request
      .addCase(cancelContactRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(cancelContactRequest.fulfilled, (state, action: PayloadAction<number>) => {
        state.sentRequests = state.sentRequests.filter(
          request => request.id !== action.payload
        );
        state.isLoading = false;
      })
      .addCase(cancelContactRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearContactRequestsError } = contactRequestsSlice.actions;
export default contactRequestsSlice.reducer;
