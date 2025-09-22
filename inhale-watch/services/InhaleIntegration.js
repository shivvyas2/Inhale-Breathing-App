import AsyncStorage from '@react-native-async-storage/async-storage';

export class InhaleIntegration {
  constructor() {
    this.mainAppUrl = 'http://localhost:3000'; // Main app backend URL
    this.userId = null;
  }

  // Initialize integration with main app
  async initialize(userId) {
    this.userId = userId;
    await this.syncUserData();
  }

  // Sync user data with main app
  async syncUserData() {
    try {
      if (!this.userId) return;

      // Get local heart rate data
      const heartRateData = await this.getLocalHeartRateData();
      
      // Send to main app backend
      const response = await fetch(`${this.mainAppUrl}/api/watch/heart-rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          heartRateData: heartRateData,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Heart rate data synced with main app');
      } else {
        console.error('❌ Failed to sync heart rate data');
      }
    } catch (error) {
      console.error('Error syncing with main app:', error);
    }
  }

  // Get local heart rate data
  async getLocalHeartRateData() {
    try {
      const data = await AsyncStorage.getItem('heart_rate_data');
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error getting local heart rate data:', error);
      return [];
    }
  }

  // Save heart rate data locally
  async saveHeartRateData(heartRateData) {
    try {
      const existingData = await this.getLocalHeartRateData();
      const newData = [...existingData, heartRateData];
      
      // Keep only last 100 readings
      if (newData.length > 100) {
        newData.splice(0, newData.length - 100);
      }
      
      await AsyncStorage.setItem('heart_rate_data', JSON.stringify(newData));
      
      // Sync with main app
      await this.syncUserData();
    } catch (error) {
      console.error('Error saving heart rate data:', error);
    }
  }

  // Send breathing session data to main app
  async sendBreathingSession(sessionData) {
    try {
      if (!this.userId) return;

      const response = await fetch(`${this.mainAppUrl}/api/watch/breathing-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          sessionData: sessionData,
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        console.log('✅ Breathing session data sent to main app');
      } else {
        console.error('❌ Failed to send breathing session data');
      }
    } catch (error) {
      console.error('Error sending breathing session data:', error);
    }
  }

  // Get user preferences from main app
  async getUserPreferences() {
    try {
      if (!this.userId) return null;

      const response = await fetch(`${this.mainAppUrl}/api/watch/user-preferences/${this.userId}`);
      
      if (response.ok) {
        const preferences = await response.json();
        return preferences;
      } else {
        console.error('❌ Failed to get user preferences');
        return null;
      }
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  // Update user preferences
  async updateUserPreferences(preferences) {
    try {
      if (!this.userId) return;

      const response = await fetch(`${this.mainAppUrl}/api/watch/user-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: this.userId,
          preferences: preferences
        })
      });

      if (response.ok) {
        console.log('✅ User preferences updated');
      } else {
        console.error('❌ Failed to update user preferences');
      }
    } catch (error) {
      console.error('Error updating user preferences:', error);
    }
  }

  // Clear local data
  async clearLocalData() {
    try {
      await AsyncStorage.removeItem('heart_rate_data');
      await AsyncStorage.removeItem('baseline_heart_rate');
      console.log('✅ Local data cleared');
    } catch (error) {
      console.error('Error clearing local data:', error);
    }
  }
}
