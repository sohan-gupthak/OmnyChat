import api from './api';
import {
  User,
  Contact,
  ApiResponse,
  UserSearchResponse,
  UserContactsResponse,
  UserResponse,
  ContactResponse,
} from '../types';

export const UserService = {
  /**
   * Search for users by username or email
   */
  async searchUsers(query: string): Promise<ApiResponse<UserSearchResponse>> {
    try {
      const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to search users' };
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(userId: number): Promise<ApiResponse<UserResponse>> {
    try {
      const response = await api.get(`/users/${userId}`);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get user' };
    }
  },

  /**
   * Get all contacts for the current user
   */
  async getContacts(): Promise<ApiResponse<UserContactsResponse>> {
    try {
      const response = await api.get('/users/contacts');
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to get contacts' };
    }
  },

  /**
   * Legacy: forwards to contact-request/send.
   */
  async addContact(userId: number): Promise<ApiResponse<ContactResponse>> {
    try {
      const response = await api.post('/users/contacts', { contactId: String(userId) });
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to add contact' };
    }
  },

  /**
   * Symmetric contact removal.
   */
  async removeContact(contactId: number): Promise<ApiResponse<void>> {
    try {
      const response = await api.delete(`/users/contacts/${contactId}`);
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to remove contact' };
    }
  },

  /**
   * List every other user (used in search/preview contexts).
   */
  async getAllUsers(): Promise<ApiResponse<{ users: User[] }>> {
    try {
      const response = await api.get('/users/all');
      return response.data;
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error || 'Failed to load users' };
    }
  },
};
