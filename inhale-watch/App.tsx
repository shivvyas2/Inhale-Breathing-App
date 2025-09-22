import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HeartRateMonitor } from './services/HeartRateMonitor';
import { AdaptiveBreathingGuide } from './services/AdaptiveBreathingGuide';

const { width, height } = Dimensions.get('window');

export default function App() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [isGuiding, setIsGuiding] = useState(false);
  const [heartRate, setHeartRate] = useState(null);
  const [anxietyLevel, setAnxietyLevel] = useState(0);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [phaseProgress, setPhaseProgress] = useState(0);
  const [guidanceText, setGuidanceText] = useState('Tap to start monitoring');
  
  const heartRateMonitor = useRef(new HeartRateMonitor());
  const breathingGuide = useRef(new AdaptiveBreathingGuide());

  useEffect(() => {
    // Set up heart rate monitoring callbacks
    heartRateMonitor.current.setCallbacks({
      onHeartRateChange: (reading) => {
        setHeartRate(reading.heartRate);
        setAnxietyLevel(reading.anxietyLevel);
        
        // Update breathing pattern based on anxiety level
        if (isGuiding) {
          const newPattern = heartRateMonitor.current.getRecommendedBreathingPattern();
          breathingGuide.current.updatePattern(newPattern);
        }
      },
      onAnxietyDetected: (reading) => {
        Alert.alert(
          'Anxiety Detected',
          `Your heart rate is elevated (${reading.heartRate} BPM). Would you like to start a breathing exercise?`,
          [
            { text: 'Not Now', style: 'cancel' },
            { text: 'Start Breathing', onPress: startBreathingSession }
          ]
        );
      },
      onCalmDetected: (reading) => {
        console.log('😌 Calm detected - heart rate normalized');
      }
    });

    // Set up breathing guide callbacks
    breathingGuide.current.setCallbacks({
      onPhaseChange: (phaseData) => {
        setBreathingPhase(phaseData.phase);
        setPhaseProgress(phaseData.progress);
        setGuidanceText(breathingGuide.current.getGuidanceText());
      },
      onSessionComplete: (sessionData) => {
        setIsGuiding(false);
        Alert.alert(
          'Session Complete!',
          `Great job! You completed a ${Math.round(sessionData.duration / 60)} minute breathing session.`
        );
      }
    });

    // Cleanup on unmount
    return () => {
      heartRateMonitor.current.stopMonitoring();
      breathingGuide.current.stopSession();
    };
  }, [isGuiding]);

  // Start heart rate monitoring
  const startMonitoring = async () => {
    try {
      await heartRateMonitor.current.startMonitoring();
      setIsMonitoring(true);
      setGuidanceText('Monitoring heart rate...');
    } catch (error) {
      Alert.alert('Error', 'Failed to start heart rate monitoring');
      console.error(error);
    }
  };

  // Stop heart rate monitoring
  const stopMonitoring = () => {
    heartRateMonitor.current.stopMonitoring();
    setIsMonitoring(false);
    setHeartRate(null);
    setAnxietyLevel(0);
    setGuidanceText('Tap to start monitoring');
  };

  // Start breathing session
  const startBreathingSession = async () => {
    try {
      const recommendedPattern = heartRateMonitor.current.getRecommendedBreathingPattern();
      await breathingGuide.current.startSession(recommendedPattern);
      setIsGuiding(true);
      setGuidanceText('Starting breathing exercise...');
    } catch (error) {
      Alert.alert('Error', 'Failed to start breathing session');
      console.error(error);
    }
  };

  // Stop breathing session
  const stopBreathingSession = () => {
    breathingGuide.current.stopSession();
    setIsGuiding(false);
    setBreathingPhase('inhale');
    setPhaseProgress(0);
    setGuidanceText('Breathing session stopped');
  };

  // Get anxiety level color
  const getAnxietyColor = (level) => {
    if (level < 0.3) return '#4CAF50'; // Green - Calm
    if (level < 0.6) return '#FF9800'; // Orange - Moderate
    return '#F44336'; // Red - High anxiety
  };

  // Get anxiety level text
  const getAnxietyText = (level) => {
    if (level < 0.3) return 'Calm';
    if (level < 0.6) return 'Moderate';
    return 'High Anxiety';
  };

  // Render heart rate display
  const renderHeartRateDisplay = () => {
    if (!heartRate) return null;

    return (
      <View style={styles.heartRateContainer}>
        <Text style={styles.heartRateLabel}>Heart Rate</Text>
        <Text style={styles.heartRateValue}>{heartRate}</Text>
        <Text style={styles.heartRateUnit}>BPM</Text>
        <View style={[styles.anxietyIndicator, { backgroundColor: getAnxietyColor(anxietyLevel) }]}>
          <Text style={styles.anxietyText}>{getAnxietyText(anxietyLevel)}</Text>
        </View>
      </View>
    );
  };

  // Render breathing guide
  const renderBreathingGuide = () => {
    if (!isGuiding) return null;

    const visualGuide = breathingGuide.current.getVisualGuide();
    
    return (
      <View style={styles.breathingContainer}>
        <Text style={styles.breathingPhase}>{breathingPhase.toUpperCase()}</Text>
        <Text style={styles.breathingVisual}>{visualGuide.visual}</Text>
        <Text style={styles.breathingProgress}>{visualGuide.progress}%</Text>
        <Text style={styles.guidanceText}>{guidanceText}</Text>
      </View>
    );
  };

  // Render main controls
  const renderControls = () => {
    if (isGuiding) {
      return (
        <TouchableOpacity
          style={[styles.button, styles.stopButton]}
          onPress={stopBreathingSession}
        >
          <Text style={styles.buttonText}>Stop Breathing</Text>
        </TouchableOpacity>
      );
    }

    if (isMonitoring) {
      return (
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={stopMonitoring}
          >
            <Text style={styles.buttonText}>Stop</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={startBreathingSession}
          >
            <Text style={styles.buttonText}>Start Breathing</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.button, styles.primaryButton]}
        onPress={startMonitoring}
      >
        <Text style={styles.buttonText}>Start Monitoring</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Inhale Watch</Text>
        <Text style={styles.subtitle}>Heart Rate Guided Breathing</Text>
      </View>

      {/* Heart Rate Display */}
      {renderHeartRateDisplay()}

      {/* Breathing Guide */}
      {renderBreathingGuide()}

      {/* Status Text */}
      <Text style={styles.statusText}>{guidanceText}</Text>

      {/* Controls */}
      <View style={styles.controls}>
        {renderControls()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#A0A0A0',
  },
  heartRateContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    minWidth: 200,
  },
  heartRateLabel: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 5,
  },
  heartRateValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  heartRateUnit: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 10,
  },
  anxietyIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  anxietyText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  breathingContainer: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    minWidth: 200,
  },
  breathingPhase: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  breathingVisual: {
    fontSize: 24,
    color: '#4CAF50',
    marginBottom: 10,
    letterSpacing: 2,
  },
  breathingProgress: {
    fontSize: 16,
    color: '#A0A0A0',
    marginBottom: 10,
  },
  guidanceText: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  statusText: {
    fontSize: 16,
    color: '#A0A0A0',
    textAlign: 'center',
    marginBottom: 30,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
  },
  secondaryButton: {
    backgroundColor: '#FF9800',
  },
  stopButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
