import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { useUser } from '@clerk/clerk-expo';
import AIMusicGenerator from '../../services/AIMusicGenerator';
import { db } from '../../supabase';
import CongratsBottomSheet from './BottomSheet';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.85;
const CIRCLE_RADIUS = (CIRCLE_SIZE / 2) - 20;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const AIBreathingScreen = ({ route, navigation }) => {
  const { selectedMood, breathingPattern, selectedSound, useAIMusic = false } = route.params;
  const { user } = useUser();
  
  const [sound, setSound] = useState();
  const [breathingState, setBreathingState] = useState('Breathe In');
  const [currentPhase, setCurrentPhase] = useState('inhale');
  const [isCountingDown, setIsCountingDown] = useState(true);
  const [countdown, setCountdown] = useState(3);
  const [showCongrats, setShowCongrats] = useState(false);
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [aiMusicEnabled, setAiMusicEnabled] = useState(useAIMusic);
  const [generatedMusic, setGeneratedMusic] = useState(null);
  
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const sessionStartTime = useRef(null);

  // Initialize AI Music Generator
  useEffect(() => {
    const initializeAIMusic = async () => {
      try {
        // In production, you would get this from environment variables
        const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
        
        if (GEMINI_API_KEY && aiMusicEnabled) {
          await AIMusicGenerator.initialize(GEMINI_API_KEY);
          AIMusicGenerator.setUserContext(user?.id, selectedMood, breathingPattern);
        }
      } catch (error) {
        console.error('Failed to initialize AI Music Generator:', error);
        setAiMusicEnabled(false);
      }
    };

    if (user && aiMusicEnabled) {
      initializeAIMusic();
    }
  }, [user, selectedMood, breathingPattern, aiMusicEnabled]);

  const createBreathingSequence = () => {
    const sequence = [];
    const { inhale, hold1, exhale, hold2 } = breathingPattern;

    // Inhale
    sequence.push(
      Animated.timing(progressAnimation, {
        toValue: 1,
        duration: inhale * 1000,
        useNativeDriver: true,
      })
    );

    // Hold after inhale
    if (hold1 > 0) {
      sequence.push(
        Animated.timing(progressAnimation, {
          toValue: 1,
          duration: hold1 * 1000,
          useNativeDriver: true,
        })
      );
    }

    // Exhale
    sequence.push(
      Animated.timing(progressAnimation, {
        toValue: 0,
        duration: exhale * 1000,
        useNativeDriver: true,
      })
    );

    // Hold after exhale
    if (hold2 > 0) {
      sequence.push(
        Animated.timing(progressAnimation, {
          toValue: 0,
          duration: hold2 * 1000,
          useNativeDriver: true,
        })
      );
    }

    return sequence;
  };

  const breathingAnimation = () => {
    const sequence = createBreathingSequence();
    Animated.sequence(sequence).start(() => {
      breathingAnimation();
    });
  };

  // Countdown effect
  useEffect(() => {
    if (isCountingDown) {
      if (countdown > 0) {
        const timer = setTimeout(() => {
          setCountdown(countdown - 1);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        setIsCountingDown(false);
        breathingAnimation();
        loadMusic();
      }
    }
  }, [countdown, isCountingDown]);

  // Load music (AI generated or selected)
  const loadMusic = async () => {
    try {
      if (aiMusicEnabled && AIMusicGenerator.client) {
        await loadAIMusic();
      } else if (selectedSound) {
        await loadSelectedMusic();
      }
    } catch (error) {
      console.error('Error loading music:', error);
      Alert.alert('Music Error', 'Failed to load music. Continuing without sound.');
    }
  };

  // Load AI generated music
  const loadAIMusic = async () => {
    try {
      setIsGeneratingMusic(true);
      
      const music = await AIMusicGenerator.generateMusic();
      setGeneratedMusic(music);
      
      // Log the generation session
      await db.logMusicGenerationSession({
        user_id: user.id,
        mood: selectedMood,
        breathing_pattern: breathingPattern,
        prompt_used: music.prompt,
        bpm: music.bpm,
        duration_seconds: 300, // 5 minutes
        generation_time_ms: 2000, // Simulated
        success: true
      });
      
      // In production, you would play the actual generated audio
      // For now, we'll use a placeholder
      console.log('AI Music Generated:', music);
      
    } catch (error) {
      console.error('Error generating AI music:', error);
      // Fallback to selected music
      if (selectedSound) {
        await loadSelectedMusic();
      }
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // Load selected music
  const loadSelectedMusic = async () => {
    try {
      if (!selectedSound) return;
      
      const audioSource = selectedSound.audio_url || selectedSound.audio;
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioSource,
        { shouldPlay: true, isLooping: true }
      );
      setSound(newSound);
    } catch (error) {
      console.error('Error loading selected music:', error);
    }
  };

  // Breathing animation effect
  useEffect(() => {
    const triggerHaptic = async (phase) => {
      switch (phase) {
        case 'inhale':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'hold':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'exhale':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
      }
    };

    progressAnimation.addListener(({ value }) => {
      if (value >= 0.95) {
        if (breathingPattern.hold1 > 0) {
          setBreathingState('Hold');
          setCurrentPhase('hold');
        } else {
          setBreathingState('Breathe In');
          setCurrentPhase('inhale');
        }
        triggerHaptic(currentPhase);
      } else if (value <= 0.05) {
        if (breathingPattern.hold2 > 0) {
          setBreathingState('Hold');
          setCurrentPhase('hold');
        } else {
          setBreathingState('Breathe Out');
          setCurrentPhase('exhale');
        }
        triggerHaptic(currentPhase);
      } else {
        if (value > 0.5) {
          setBreathingState('Breathe In');
          setCurrentPhase('inhale');
        } else {
          setBreathingState('Breathe Out');
          setCurrentPhase('exhale');
        }
      }
    });

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      progressAnimation.removeAllListeners();
    };
  }, []);

  const progress = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_CIRCUMFERENCE, 0],
  });

  const handleEndSession = async () => {
    if (sound) {
      sound.unloadAsync();
    }
    
    // Record session end time
    if (sessionStartTime.current) {
      const sessionDuration = Date.now() - sessionStartTime.current;
      console.log('Session duration:', sessionDuration);
    }
    
    setShowCongrats(true);
  };

  const handleContinue = () => {
    setShowCongrats(false);
    navigation.goBack();
  };

  const toggleAIMusic = () => {
    setAiMusicEnabled(!aiMusicEnabled);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Background */}
      <View
        style={[StyleSheet.absoluteFill, styles.backgroundGradient, {
          backgroundColor: currentPhase === 'inhale' 
            ? '#4C1D95' 
            : '#1E40AF'
        }]}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleEndSession}
          style={styles.backButton}
        >
          <BlurView intensity={80} style={styles.blurButton}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </BlurView>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <BlurView intensity={60} style={styles.moodBadge}>
            <Text style={styles.moodText}>{selectedMood}</Text>
          </BlurView>
          
          {aiMusicEnabled && (
            <View style={styles.aiMusicIndicator}>
              <Ionicons name="sparkles" size={16} color="#FFD700" />
              <Text style={styles.aiMusicText}>AI Music</Text>
            </View>
          )}
        </View>
        
        <TouchableOpacity 
          onPress={toggleAIMusic}
          style={styles.aiToggleButton}
        >
          <BlurView intensity={60} style={styles.aiToggleBlur}>
            <Ionicons 
              name={aiMusicEnabled ? "sparkles" : "musical-notes"} 
              size={20} 
              color="#FFF" 
            />
          </BlurView>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {isCountingDown ? (
          <View style={styles.countdownContainer}>
            <Text style={styles.countdownText}>
              {countdown === 0 ? 'Begin' : countdown}
            </Text>
            {isGeneratingMusic && (
              <Text style={styles.generatingText}>Generating AI Music...</Text>
            )}
          </View>
        ) : (
          <>
            <Text style={styles.breathingState}>{breathingState}</Text>

            <View style={styles.circleContainer}>
              <Svg width={CIRCLE_SIZE} height={CIRCLE_SIZE}>
                <Defs>
                  <LinearGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="#8B5CF6" stopOpacity="1" />
                    <Stop offset="1" stopColor="#6366F1" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                
                {/* Background Circle */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_RADIUS}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                  fill="none"
                />
                
                {/* Progress Circle */}
                <AnimatedCircle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_RADIUS}
                  stroke="url(#grad)"
                  strokeWidth="4"
                  strokeDasharray={`${CIRCLE_CIRCUMFERENCE} ${CIRCLE_CIRCUMFERENCE}`}
                  strokeDashoffset={progress}
                  strokeLinecap="round"
                  fill="none"
                />
              </Svg>
              
              {/* Center Glow */}
              <View
                style={[
                  styles.centerGlow,
                  {
                    backgroundColor: currentPhase === 'inhale' 
                      ? 'rgba(139,92,246,0.3)' 
                      : 'rgba(99,102,241,0.3)'
                  }
                ]}
              />
            </View>

            <TouchableOpacity 
              style={styles.stopButton}
              onPress={handleEndSession}
            >
              <BlurView intensity={80} style={styles.stopButtonContent}>
                <Text style={styles.stopButtonText}>End Session</Text>
              </BlurView>
            </TouchableOpacity>
          </>
        )}
      </View>

      {showCongrats && (
        <CongratsBottomSheet 
          navigation={navigation} 
          sessionData={{
            type: 'breathing',
            duration: 5,
            moodId: selectedMood,
            breathingPattern: breathingPattern,
            aiGenerated: aiMusicEnabled
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1B4B',
  },
  backgroundGradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  blurButton: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  moodBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 4,
  },
  moodText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
  },
  aiMusicIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiMusicText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  aiToggleButton: {
    width: 40,
    height: 40,
  },
  aiToggleBlur: {
    flex: 1,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  breathingState: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 40,
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  circleContainer: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
  },
  centerGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  stopButton: {
    width: width - 48,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    marginHorizontal: 24,
  },
  stopButtonContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '600',
  },
  countdownContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 120,
    fontWeight: '700',
    color: '#FFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
  generatingText: {
    fontSize: 16,
    color: '#FFD700',
    marginTop: 20,
    textAlign: 'center',
  },
});

export default AIBreathingScreen;
