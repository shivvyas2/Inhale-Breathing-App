import { Pedometer } from 'expo-sensors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class HeartRateMonitor {
  constructor() {
    this.isMonitoring = false;
    this.heartRateData = [];
    this.baselineHeartRate = null;
    this.anxietyThreshold = 100; // BPM threshold for anxiety detection
    this.callbacks = {
      onHeartRateChange: null,
      onAnxietyDetected: null,
      onCalmDetected: null
    };
  }

  // Initialize heart rate monitoring
  async startMonitoring() {
    try {
      console.log('❤️ Starting heart rate monitoring...');
      
      // Check if heart rate monitoring is available
      const isAvailable = await Pedometer.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Heart rate monitoring not available on this device');
      }

      // Load baseline heart rate from storage
      await this.loadBaselineHeartRate();

      // Start monitoring with high frequency updates
      this.isMonitoring = true;
      
      // Simulate heart rate monitoring (in real implementation, use HealthKit)
      this.startHeartRateSimulation();
      
      console.log('✅ Heart rate monitoring started');
    } catch (error) {
      console.error('❌ Failed to start heart rate monitoring:', error);
      throw error;
    }
  }

  // Stop heart rate monitoring
  stopMonitoring() {
    console.log('❤️ Stopping heart rate monitoring...');
    this.isMonitoring = false;
    this.heartRateData = [];
  }

  // Simulate heart rate data (replace with actual HealthKit integration)
  startHeartRateSimulation() {
    if (!this.isMonitoring) return;

    // Simulate realistic heart rate patterns
    const simulateHeartRate = () => {
      if (!this.isMonitoring) return;

      const now = Date.now();
      const timeOfDay = new Date().getHours();
      
      // Base heart rate varies by time of day
      let baseRate = 70;
      if (timeOfDay < 6 || timeOfDay > 22) baseRate = 60; // Night time
      else if (timeOfDay >= 9 && timeOfDay <= 17) baseRate = 75; // Day time
      
      // Add some variation
      const variation = (Math.random() - 0.5) * 20;
      const heartRate = Math.round(baseRate + variation);
      
      // Occasionally simulate anxiety spikes
      if (Math.random() < 0.1) {
        const anxietyRate = heartRate + 30 + Math.random() * 20;
        this.processHeartRate(anxietyRate, now);
      } else {
        this.processHeartRate(heartRate, now);
      }

      // Continue monitoring
      setTimeout(simulateHeartRate, 1000); // Update every second
    };

    simulateHeartRate();
  }

  // Process heart rate reading
  processHeartRate(heartRate, timestamp) {
    if (!this.isMonitoring) return;

    const reading = {
      heartRate,
      timestamp,
      anxietyLevel: this.calculateAnxietyLevel(heartRate)
    };

    this.heartRateData.push(reading);
    
    // Keep only last 60 readings (1 minute of data)
    if (this.heartRateData.length > 60) {
      this.heartRateData.shift();
    }

    // Update baseline if needed
    this.updateBaselineHeartRate(heartRate);

    // Notify callbacks
    if (this.callbacks.onHeartRateChange) {
      this.callbacks.onHeartRateChange(reading);
    }

    // Check for anxiety
    if (reading.anxietyLevel > 0.7) {
      if (this.callbacks.onAnxietyDetected) {
        this.callbacks.onAnxietyDetected(reading);
      }
    } else if (reading.anxietyLevel < 0.3) {
      if (this.callbacks.onCalmDetected) {
        this.callbacks.onCalmDetected(reading);
      }
    }

    console.log(`❤️ Heart Rate: ${heartRate} BPM (Anxiety: ${(reading.anxietyLevel * 100).toFixed(1)}%)`);
  }

  // Calculate anxiety level based on heart rate
  calculateAnxietyLevel(heartRate) {
    if (!this.baselineHeartRate) return 0;

    const deviation = heartRate - this.baselineHeartRate;
    const normalizedDeviation = Math.max(0, deviation / 30); // Normalize to 0-1 scale
    
    return Math.min(1, normalizedDeviation);
  }

  // Update baseline heart rate
  updateBaselineHeartRate(heartRate) {
    if (!this.baselineHeartRate) {
      this.baselineHeartRate = heartRate;
      return;
    }

    // Smooth baseline update (moving average)
    this.baselineHeartRate = (this.baselineHeartRate * 0.9) + (heartRate * 0.1);
  }

  // Load baseline heart rate from storage
  async loadBaselineHeartRate() {
    try {
      const stored = await AsyncStorage.getItem('baseline_heart_rate');
      if (stored) {
        this.baselineHeartRate = parseFloat(stored);
        console.log('📊 Loaded baseline heart rate:', this.baselineHeartRate);
      }
    } catch (error) {
      console.error('Error loading baseline heart rate:', error);
    }
  }

  // Save baseline heart rate to storage
  async saveBaselineHeartRate() {
    try {
      if (this.baselineHeartRate) {
        await AsyncStorage.setItem('baseline_heart_rate', this.baselineHeartRate.toString());
        console.log('💾 Saved baseline heart rate:', this.baselineHeartRate);
      }
    } catch (error) {
      console.error('Error saving baseline heart rate:', error);
    }
  }

  // Get current heart rate statistics
  getHeartRateStats() {
    if (this.heartRateData.length === 0) return null;

    const rates = this.heartRateData.map(reading => reading.heartRate);
    const avgRate = rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
    const maxRate = Math.max(...rates);
    const minRate = Math.min(...rates);
    const currentRate = rates[rates.length - 1];

    return {
      current: currentRate,
      average: Math.round(avgRate),
      max: maxRate,
      min: minRate,
      baseline: this.baselineHeartRate,
      anxietyLevel: this.calculateAnxietyLevel(currentRate)
    };
  }

  // Set callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Get recommended breathing pattern based on heart rate
  getRecommendedBreathingPattern() {
    const stats = this.getHeartRateStats();
    if (!stats) return { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };

    const anxietyLevel = stats.anxietyLevel;
    
    if (anxietyLevel > 0.8) {
      // High anxiety - slow, deep breathing
      return { inhale: 6, hold1: 6, exhale: 8, hold2: 2 };
    } else if (anxietyLevel > 0.5) {
      // Medium anxiety - moderate breathing
      return { inhale: 5, hold1: 4, exhale: 6, hold2: 3 };
    } else if (anxietyLevel > 0.3) {
      // Low anxiety - normal breathing
      return { inhale: 4, hold1: 4, exhale: 4, hold2: 4 };
    } else {
      // Calm - gentle breathing
      return { inhale: 3, hold1: 3, exhale: 3, hold2: 3 };
    }
  }
}
