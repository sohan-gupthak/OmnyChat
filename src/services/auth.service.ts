import api from './api';
import { LoginCredentials, RegisterCredentials, User, ApiResponse } from '../types';

export const AuthService = {
  /**
   * Register a new user
   * @param credentials User registration data
   * @returns Promise with user data and token
   */
  async register(credentials: RegisterCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post('/auth/register', credentials);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  },

  /**
   * Login a user
   * @param credentials User login credentials
   * @returns Promise with user data and token
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed'
      };
    }
  },

  /**
   * Get current user profile
   * @returns Promise with user data
   */
  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get profile'
      };
    }
  },

  /**
   * Logout the current user
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};
