import api from './api';
import { 
  ApiResponse, 
  ContactRequest, 
  ContactRequestResponse, 
  PendingRequestsResponse, 
  SentRequestsResponse 
} from '../types';

/**
 * Service for handling contact request operations
 */
export const contactRequestService = {
  /**
   * Get pending contact requests
   * @returns Promise with pending contact requests
   */
  getPendingRequests: async (): Promise<ApiResponse<PendingRequestsResponse>> => {
    try {
      const response = await api.get('/contact-requests/pending');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to get pending requests' };
    }
  },

  /**
   * Get sent contact requests
   * @returns Promise with sent contact requests
   */
  getSentRequests: async (): Promise<ApiResponse<SentRequestsResponse>> => {
    try {
      const response = await api.get('/contact-requests/sent');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to get sent requests' };
    }
  },

  /**
   * Send a contact request
   * @param recipientId ID of the user to send the request to
   * @returns Promise with the created contact request
   */
  sendRequest: async (recipientId: number): Promise<ApiResponse<ContactRequestResponse>> => {
    try {
      const response = await api.post('/contact-requests/send', { recipientId });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to send contact request' };
    }
  },

  /**
   * Accept a contact request
   * @param requestId ID of the contact request to accept
   * @returns Promise with success status
   */
  acceptRequest: async (requestId: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post(`/contact-requests/accept/${requestId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to accept contact request' };
    }
  },

  /**
   * Reject a contact request
   * @param requestId ID of the contact request to reject
   * @returns Promise with success status
   */
  rejectRequest: async (requestId: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post(`/contact-requests/reject/${requestId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to reject contact request' };
    }
  },

  /**
   * Cancel a contact request
   * @param requestId ID of the contact request to cancel
   * @returns Promise with success status
   */
  cancelRequest: async (requestId: number): Promise<ApiResponse<null>> => {
    try {
      const response = await api.post(`/contact-requests/cancel/${requestId}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { success: false, error: 'Failed to cancel contact request' };
    }
  }
};
