import api from './api';
export const contactRequestService = {
    getPendingRequests: async () => {
        try {
            const response = await api.get('/contact-requests/pending');
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { success: false, error: 'Failed to get pending requests' };
        }
    },
    getSentRequests: async () => {
        try {
            const response = await api.get('/contact-requests/sent');
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { success: false, error: 'Failed to get sent requests' };
        }
    },
    /**
     * Send a request, with optional greeting message.
     */
    sendRequest: async (recipientId, message) => {
        try {
            const response = await api.post('/contact-requests/send', { recipientId, message });
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { success: false, error: 'Failed to send contact request' };
        }
    },
    acceptRequest: async (requestId) => {
        try {
            const response = await api.post(`/contact-requests/accept/${requestId}`);
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { success: false, error: 'Failed to accept contact request' };
        }
    },
    rejectRequest: async (requestId) => {
        try {
            const response = await api.post(`/contact-requests/reject/${requestId}`);
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { success: false, error: 'Failed to reject contact request' };
        }
    },
    cancelRequest: async (requestId) => {
        try {
            const response = await api.post(`/contact-requests/cancel/${requestId}`);
            return response.data;
        }
        catch (error) {
            throw error.response?.data || { success: false, error: 'Failed to cancel contact request' };
        }
    },
};
