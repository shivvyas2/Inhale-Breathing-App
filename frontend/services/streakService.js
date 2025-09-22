import { GEMINI_API_KEY } from '../supabase';

const API_BASE_URL = 'http://localhost:3000/api';

class StreakService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  // Update user streak after session completion
  async updateStreak(userId, sessionData) {
    try {
      console.log('📊 Updating streak for user:', userId);
      console.log('📊 Session data:', sessionData);

      const response = await fetch(`${this.baseUrl}/users/${userId}/streak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update streak');
      }

      const result = await response.json();
      console.log('✅ Streak updated successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('❌ Error updating streak:', error);
      throw error;
    }
  }

  // Get user data including streak
  async getUserData(userId) {
    try {
      console.log('📊 Fetching user data for:', userId);

      const response = await fetch(`${this.baseUrl}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user data');
      }

      const result = await response.json();
      console.log('✅ User data fetched successfully:', result.data);
      
      return result.data;
    } catch (error) {
      console.error('❌ Error fetching user data:', error);
      throw error;
    }
  }

  // Check if server is running
  async checkServerHealth() {
    try {
      const response = await fetch(`${this.baseUrl.replace('/api', '')}/health`);
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend server is running:', data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Backend server is not running:', error);
      return false;
    }
  }
}

export default new StreakService();
