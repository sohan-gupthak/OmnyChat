import api from './api';
import {
  ApiResponse,
  ContactRequest,
  ContactRequestResponse,
  PendingRequestsResponse,
  SentRequestsResponse,
} from '../types';

export const contactRequestService = {
  getPendingRequests: async (): Promise<ApiResponse<PendingRequestsResponse>> => {
    try {
      const response = await api.get('/contact-requests/pending');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to get pending requests' };
    }
  },

  getSentRequests: async (): Promise<ApiResponse<SentRequestsResponse>> => {
    try {
      const response = await api.get('/contact-requests/sent');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to get sent requests' };
    }
  },

  /**
   * Send a request, with optional greeting message.
   */
  sendRequest: async (
    recipientId: number,
    message?: string
  ): Promise<ApiResponse<ContactRequestResponse>> => {
    try {
      const response = await api.post('/contact-requests/send', { recipientId, message });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to send contact request' };
    }
  },

  acceptRequest: async (requestId: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post(`/contact-requests/accept/${requestId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to accept contact request' };
    }
  },

  rejectRequest: async (requestId: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post(`/contact-requests/reject/${requestId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to reject contact request' };
    }
  },

  cancelRequest: async (requestId: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post(`/contact-requests/cancel/${requestId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to cancel contact request' };
    }
  },
};
