import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { contactRequestService } from '../../services/contact-request.service';
const initialState = {
    pendingRequests: [],
    sentRequests: [],
    isLoading: false,
    error: null
};
// Async thunks
export const fetchPendingRequests = createAsyncThunk('contactRequests/fetchPending', async (_, { rejectWithValue }) => {
    try {
        const response = await contactRequestService.getPendingRequests();
        return response.data?.requests || [];
    }
    catch (error) {
        return rejectWithValue(error.error || 'Failed to fetch pending requests');
    }
});
export const fetchSentRequests = createAsyncThunk('contactRequests/fetchSent', async (_, { rejectWithValue }) => {
    try {
        const response = await contactRequestService.getSentRequests();
        return response.data?.requests || [];
    }
    catch (error) {
        return rejectWithValue(error.error || 'Failed to fetch sent requests');
    }
});
export const sendContactRequest = createAsyncThunk('contactRequests/send', async (recipientId, { rejectWithValue }) => {
    try {
        const response = await contactRequestService.sendRequest(recipientId);
        return response.data?.request;
    }
    catch (error) {
        return rejectWithValue(error.error || 'Failed to send contact request');
    }
});
export const acceptContactRequest = createAsyncThunk('contactRequests/accept', async (requestId, { rejectWithValue }) => {
    try {
        await contactRequestService.acceptRequest(requestId);
        return requestId;
    }
    catch (error) {
        return rejectWithValue(error.error || 'Failed to accept contact request');
    }
});
export const rejectContactRequest = createAsyncThunk('contactRequests/reject', async (requestId, { rejectWithValue }) => {
    try {
        await contactRequestService.rejectRequest(requestId);
        return requestId;
    }
    catch (error) {
        return rejectWithValue(error.error || 'Failed to reject contact request');
    }
});
export const cancelContactRequest = createAsyncThunk('contactRequests/cancel', async (requestId, { rejectWithValue }) => {
    try {
        await contactRequestService.cancelRequest(requestId);
        return requestId;
    }
    catch (error) {
        return rejectWithValue(error.error || 'Failed to cancel contact request');
    }
});
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
            .addCase(fetchPendingRequests.fulfilled, (state, action) => {
            state.pendingRequests = action.payload;
            state.isLoading = false;
        })
            .addCase(fetchPendingRequests.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
            // Fetch sent requests
            .addCase(fetchSentRequests.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
            .addCase(fetchSentRequests.fulfilled, (state, action) => {
            state.sentRequests = action.payload;
            state.isLoading = false;
        })
            .addCase(fetchSentRequests.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
            // Send contact request
            .addCase(sendContactRequest.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
            .addCase(sendContactRequest.fulfilled, (state, action) => {
            if (action.payload) {
                state.sentRequests.push(action.payload);
            }
            state.isLoading = false;
        })
            .addCase(sendContactRequest.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
            // Accept contact request
            .addCase(acceptContactRequest.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
            .addCase(acceptContactRequest.fulfilled, (state, action) => {
            state.pendingRequests = state.pendingRequests.filter(request => request.id !== action.payload);
            state.isLoading = false;
        })
            .addCase(acceptContactRequest.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
            // Reject contact request
            .addCase(rejectContactRequest.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
            .addCase(rejectContactRequest.fulfilled, (state, action) => {
            state.pendingRequests = state.pendingRequests.filter(request => request.id !== action.payload);
            state.isLoading = false;
        })
            .addCase(rejectContactRequest.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        })
            // Cancel contact request
            .addCase(cancelContactRequest.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
            .addCase(cancelContactRequest.fulfilled, (state, action) => {
            state.sentRequests = state.sentRequests.filter(request => request.id !== action.payload);
            state.isLoading = false;
        })
            .addCase(cancelContactRequest.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
        });
    }
});
export const { clearContactRequestsError } = contactRequestsSlice.actions;
export default contactRequestsSlice.reducer;
