import { Profile, UpdateProfileRequest } from '@/types/profile';
import { AuthService } from './authService';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

export class ProfileService {
  static getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AuthService.getToken()}`,
    };
  }

  static async getProfile(): Promise<Profile | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        return response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  }

  static async updateProfile(data: UpdateProfileRequest): Promise<Profile | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (response.ok) {
        return response.json();
      }
      return null;
    } catch (error) {
      console.error('Failed to update profile:', error);
      return null;
    }
  }

  static async uploadAvatar(file: File): Promise<string | null> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE_URL}/api/profile/avatar`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${AuthService.getToken()}` },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return data.avatarUrl;
      }
      return null;
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      return null;
    }
  }

  static async deleteAccount(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/delete`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      if (response.ok) {
        AuthService.logout();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to delete account:', error);
      return false;
    }
  }
}
