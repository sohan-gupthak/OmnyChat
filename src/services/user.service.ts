import api from './api';
import { User, Contact, ApiResponse, UserSearchResponse, UserContactsResponse, UserResponse, ContactResponse } from '../types';

export const UserService = {
  /**
   * Search for users by username or email
   * @param query Search query
   * @returns Promise with list of users
   */
  async searchUsers(query: string): Promise<ApiResponse<UserSearchResponse>> {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to search users'
      };
    }
  },

  /**
   * Get user by ID
   * @param userId User ID
   * @returns Promise with user data
   */
  async getUserById(userId: number): Promise<ApiResponse<UserResponse>> {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get user'
      };
    }
  },

  /**
   * Get all contacts for the current user
   * @returns Promise with list of contacts
   */
  async getContacts(): Promise<ApiResponse<UserContactsResponse>> {
    try {
      const response = await api.get('/users/contacts');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get contacts'
      };
    }
  },

  /**
   * Add a new contact
   * @param userId User ID to add as contact
   * @returns Promise with added contact
   */
  async addContact(userId: number): Promise<ApiResponse<ContactResponse>> {
    try {
      // Convert userId to string to match backend expectation
      const response = await api.post('/users/contacts', { contactId: userId.toString() });
      console.log('Add contact response:', response);
      return response.data;
    } catch (error: any) {
      console.error('Add contact error details:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add contact'
      };
    }
  },

  /**
   * Remove a contact
   * @param contactId Contact ID to remove
   * @returns Promise with success status
   */
  async removeContact(contactId: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/users/contacts/${contactId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove contact'
      };
    }
  }
};
