import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { BlurView } from 'expo-blur';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { useUser } from '@clerk/clerk-expo';
import AIMusicGenerator from '../../services/AIMusicGenerator';
import MusicAPIService from '../../services/MusicAPIService';
import StreakService from '../../services/streakService';
import { GEMINI_API_KEY, db } from '../../supabase';
import CongratsBottomSheet from './BottomSheet';

const { width, height } = Dimensions.get('window');
const CIRCLE_SIZE = width * 0.85;
const CIRCLE_RADIUS = (CIRCLE_SIZE / 2) - 20;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const AIBreathingScreen = ({ route, navigation }) => {
  const { selectedMood, breathingPattern, selectedSound, useAIMusic = false, selectedInstruments = [] } = route.params;
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
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.7);
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionDuration, setSessionDuration] = useState(0);
  
  const progressAnimation = useRef(new Animated.Value(0)).current;


  // Initialize AI Music Generator
  useEffect(() => {
    const initializeAIMusic = async () => {
      try {
        if (GEMINI_API_KEY && aiMusicEnabled) {
          await AIMusicGenerator.initialize(GEMINI_API_KEY);
          AIMusicGenerator.setUserContext(selectedMood, breathingPattern, selectedInstruments);
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

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (sound) {
        sound.remove();
      }
      // Cleanup ambient engine if it exists
      if (generatedMusic && generatedMusic.ambient_engine) {
        generatedMusic.ambient_engine.cleanup();
      }
      // Cleanup Music API Service
      MusicAPIService.cleanup();
    };
  }, [sound, generatedMusic]);

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
        setSessionStartTime(Date.now());
        breathingAnimation();
        loadMusic();
      }
    }
  }, [countdown, isCountingDown]);

  // Load music (AI generated or selected)
  const loadMusic = async () => {
    try {
      if (aiMusicEnabled && AIMusicGenerator.client) {
        console.log('Loading AI generated music...');
        await loadAIMusic();
      } else if (selectedSound) {
        console.log('Loading selected music:', selectedSound.name || selectedSound.title);
        await loadSelectedMusic();
      } else {
        console.log('No music selected, continuing without sound');
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
      
      // Check if music generation was successful
      if (!music) {
        console.error('AI music generation returned null/undefined');
        throw new Error('AI music generation failed');
      }
      
      setGeneratedMusic(music);
      
      // Play AI generated music using a fallback audio file
      // Since we can't generate real audio yet, we'll use a placeholder
      await playAIMusic(music);
      
    } catch (error) {
      console.error('Error generating AI music:', error);
      // Fallback to selected music
      if (selectedSound) {
        await loadSelectedMusic();
      } else {
        // If no selected music, just continue without music
        console.log('Continuing without music');
      }
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  // Play AI generated music using Music API Service
  const playAIMusic = async (music) => {
    try {
      console.log(`🎵 Playing AI Generated Music: ${music.name}`);
      console.log(`🎵 Generated Properties:`, {
        style: music.style,
        key: music.key,
        bpm: music.bpm,
        instruments: music.instruments,
        prompt: music.prompt,
        is_real_ai_generated: music.is_real_ai_generated,
        is_ambient_generated: music.is_ambient_generated
      });
      
      // Use Music API Service to generate and play music
      const musicParams = {
        mood: selectedMood,
        bpm: music.bpm || 80,
        instruments: selectedInstruments,
        breathingPattern: breathingPattern,
        duration: 300 // 5 minutes for breathing session
      };
      
      console.log('🎵 Generating music with API:', musicParams);
      
      const result = await MusicAPIService.generateAndPlayMusic(musicParams);
      
      if (result.success) {
        setIsMusicPlaying(true);
        console.log('✅ AI music now playing via API!');
        console.log('🎵 Audio URL:', result.audioUrl);
      } else {
        throw new Error('Failed to generate music via API');
      }
      
    } catch (error) {
      console.error('Error playing AI music via API:', error);
      
      // Fallback to test audio generation
      try {
        console.log('🎵 Falling back to test audio generation...');
        const testResult = await MusicAPIService.generateTestAudio(selectedMood, 60);
        setIsMusicPlaying(true);
        console.log('✅ Test audio playing as fallback');
      } catch (fallbackError) {
        console.error('Error with fallback audio:', fallbackError);
        // Final fallback to selected music if available
        if (selectedSound) {
          await loadSelectedMusic();
        }
      }
    }
  };

  // Generate synthetic audio for AI music
  const generateSyntheticAudio = (music) => {
    console.log('🎵 Generating synthetic audio for mood:', music.mood);
    
    // For now, let's use a simple approach with local audio files
    // but apply AI-generated properties to make it feel AI-generated
    let audioFile;
    
    switch (music.mood) {
      case 'Anxious':
      case 'Anxiety Relief':
        audioFile = require('../../assets/audio/joyful.wav'); // Using joyful instead of discover
        break;
      case 'Meditate':
        audioFile = require('../../assets/audio/joyful.wav');
        break;
      case 'Wind Down':
        audioFile = require('../../assets/audio/journey.wav'); // Using journey instead of lost
        break;
      case 'Focus':
        audioFile = require('../../assets/audio/journey.wav');
        break;
      default:
        audioFile = require('../../assets/audio/journey.wav');
    }
    
    console.log('🎵 Using local audio file as base for AI generation');
    return audioFile;
  };

  // Get mood-specific frequency for synthetic audio
  const getMoodFrequency = (mood) => {
    const frequencies = {
      'Anxious': 60, // Low, calming
      'Anxiety Relief': 80, // Slightly higher, soothing
      'Meditate': 40, // Very low, meditative
      'Wind Down': 50, // Low, relaxing
      'Focus': 100 // Higher, concentration
    };
    return frequencies[mood] || 80;
  };

  // Test audio playback
  const testAudio = async () => {
    try {
      console.log('🎵 Testing audio playback...');
      const testSound = new AudioPlayer(require('../../assets/audio/discover.wav'));
      
      await testSound.setVolume(0.7);
      await testSound.play();
      console.log('✅ Test audio playing');
      
      // Stop after 3 seconds
      setTimeout(async () => {
        await testSound.remove();
        console.log('✅ Test audio stopped');
      }, 3000);
    } catch (error) {
      console.error('Error testing audio:', error);
    }
  };

  // Load selected music
  const loadSelectedMusic = async () => {
    try {
      if (!selectedSound) {
        return;
      }
      
      console.log('🎵 Loading selected music:', selectedSound.title || selectedSound.name);
      const audioSource = selectedSound.audio_url || selectedSound.audio;
      console.log('🎵 Audio source:', audioSource);
      
      if (!audioSource) {
        console.log('No audio available for this item');
        return;
      }
      
      // Create new audio sound with expo-av
      const { sound: newSound } = await Audio.Sound.createAsync(
        audioSource,
        { 
          shouldPlay: true, 
          isLooping: true,
          volume: 0.7
        }
      );
      
      setSound(newSound);
      setIsMusicPlaying(true);
      console.log('✅ Selected music loaded and playing');
      
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
      } else if (value > 0.5) {
        setBreathingState('Breathe In');
        setCurrentPhase('inhale');
      } else {
        setBreathingState('Breathe Out');
        setCurrentPhase('exhale');
      }
    });

    return () => {
      if (sound) {
        sound.remove();
      }
      progressAnimation.removeAllListeners();
    };
  }, []);

  const progress = progressAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCLE_CIRCUMFERENCE, 0],
  });

  const handleEndSession = async () => {
    try {
      // Calculate session duration
      const endTime = Date.now();
      const duration = sessionStartTime ? (endTime - sessionStartTime) / 1000 : 0; // in seconds
      setSessionDuration(duration);
      
      console.log('📊 Session ended:', {
        duration: duration,
        mood: selectedMood,
        breathingPattern: breathingPattern
      });

      // Stop any playing sound
      if (sound) {
        await sound.remove();
        setSound(null);
        setIsMusicPlaying(false);
      }
      
      // Stop AI music if playing
      if (generatedMusic && generatedMusic.ambient_engine) {
        generatedMusic.ambient_engine.stop();
      }

      // Update streak in database
      if (user && duration > 30) { // Only update if session was at least 30 seconds
        try {
          // First ensure user profile exists
          console.log('📊 Ensuring user profile exists...');
          let userProfile;
          try {
            userProfile = await db.getUserProfile(user.id);
            console.log('✅ User profile found:', userProfile);
          } catch (profileError) {
            console.log('📊 User profile not found, creating...');
            // Create user profile if it doesn't exist
            const displayUsername = user.username || user.firstName || user.lastName || 'user';
            const firstName = user.firstName || user.first_name || user.givenName || user.name?.split(' ')[0] || null;
            const lastName = user.lastName || user.last_name || user.familyName || user.name?.split(' ').slice(1).join(' ') || null;
            
            userProfile = await db.createUserProfile(user.id, {
              username: displayUsername,
              first_name: firstName,
              last_name: lastName,
              email: user.primaryEmailAddress?.emailAddress || null
            });
            console.log('✅ User profile created:', userProfile);
          }

          const sessionData = {
            sessionDuration: duration,
            mood: selectedMood,
            breathingPattern: breathingPattern
          };

          const updatedUserData = await StreakService.updateStreak(user.id, sessionData);
          
          console.log('✅ Streak updated successfully:', updatedUserData);
          
          // Show success message
          Alert.alert(
            'Session Complete! 🎉',
            `Great job! Your streak is now ${updatedUserData.streak} days!`,
            [{ text: 'OK' }]
          );
          
        } catch (streakError) {
          console.error('❌ Failed to update streak:', streakError);
          // Still show congrats even if streak update fails
          Alert.alert(
            'Session Complete! 🎉',
            'Great job! (Note: Streak update failed)',
            [{ text: 'OK' }]
          );
        }
      } else if (duration <= 30) {
        Alert.alert(
          'Session Too Short',
          'Please complete at least 30 seconds for streak tracking.',
          [{ text: 'OK' }]
        );
      }
      
      setShowCongrats(true);
      
    } catch (error) {
      console.error('Error ending session:', error);
      setShowCongrats(true);
    }
  };

  const handleContinue = () => {
    setShowCongrats(false);
    navigation.goBack();
  };

  const toggleAIMusic = () => {
    setAiMusicEnabled(!aiMusicEnabled);
  };

  return (
    <ExpoLinearGradient
      colors={['#1E1B4B', '#312E81', '#1E3A8A']}
      style={styles.fullScreen}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ExpoStatusBar 
        style="light" 
        backgroundColor="#1E1B4B"
      />
      <View style={styles.container}>
      

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={handleEndSession}
          style={styles.backButton}
        >
          <BlurView intensity={80} style={styles.blurButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#FFF" />
          </BlurView>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <BlurView intensity={60} style={styles.moodBadge}>
            <Text style={styles.moodText}>{selectedMood}</Text>
          </BlurView>
          
          {aiMusicEnabled && (
            <View style={styles.aiMusicIndicator}>
              <MaterialCommunityIcons name="music-note" size={16} color="#C4B5FD" />
              <Text style={styles.aiMusicText}>Vibe Music</Text>
            </View>
          )}
          
          {isMusicPlaying && (
            <View style={styles.musicStatusIndicator}>
              <MaterialCommunityIcons 
                name={generatedMusic ? "star" : "music"} 
                size={16} 
                color={generatedMusic ? "#FFD700" : "#4ADE80"} 
              />
              <Text style={styles.musicStatusText}>
                {generatedMusic ? 
                  (generatedMusic.is_lyria_generated ? 
                    `Lyria: ${generatedMusic.style} (${generatedMusic.key})` :
                    generatedMusic.is_ambient_generated ? 
                      `Ambient: ${generatedMusic.style} (${generatedMusic.key})` :
                      `AI: ${generatedMusic.style} (${generatedMusic.key})`
                  ) : 
                  'Playing'
                }
              </Text>
            </View>
          )}
          
          <TouchableOpacity 
            onPress={testAudio} 
            style={styles.testButton}
          >
            <BlurView intensity={60} style={styles.testButtonBlur}>
              <MaterialCommunityIcons name="play" size={16} color="#fff" />
              <Text style={styles.testButtonText}>Test</Text>
            </BlurView>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          onPress={toggleAIMusic}
          style={styles.aiToggleButton}
        >
          <BlurView intensity={60} style={styles.aiToggleBlur}>
            <MaterialCommunityIcons 
              name={aiMusicEnabled ? "star" : "music"} 
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
              <View style={styles.generatingContainer}>
                <Text style={styles.generatingText}>🎵 Generating Vibe Music...</Text>
                {generatedMusic && (
                  <Text style={styles.generatingDetails}>
                    {generatedMusic.style} • {generatedMusic.key} • {generatedMusic.bpm} BPM
                  </Text>
                )}
              </View>
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
                  <LinearGradient id="trackGrad" x1="0" y1="0" x2="1" y2="1">
                    <Stop offset="0" stopColor="rgba(255,255,255,0.2)" stopOpacity="1" />
                    <Stop offset="1" stopColor="rgba(255,255,255,0.05)" stopOpacity="1" />
                  </LinearGradient>
                </Defs>
                
                {/* Outer Progress Track - Background */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_RADIUS + 15}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="6"
                  fill="none"
                />
                
                {/* Outer Progress Track - Active */}
                <AnimatedCircle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_RADIUS + 15}
                  stroke="url(#trackGrad)"
                  strokeWidth="6"
                  strokeDasharray={`${2 * Math.PI * (CIRCLE_RADIUS + 15)} ${2 * Math.PI * (CIRCLE_RADIUS + 15)}`}
                  strokeDashoffset={progress}
                  strokeLinecap="round"
                  fill="none"
                />
                
                {/* Inner Background Circle */}
                <Circle
                  cx={CIRCLE_SIZE / 2}
                  cy={CIRCLE_SIZE / 2}
                  r={CIRCLE_RADIUS}
                  stroke="rgba(255,255,255,0.1)"
                  strokeWidth="2"
                  fill="none"
                />
                
                {/* Inner Progress Circle */}
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
      </View>
    </ExpoLinearGradient>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50, // Account for status bar
    paddingBottom: 20,
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
    marginBottom: 40, // Account for home indicator
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
  generatingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  generatingText: {
    fontSize: 16,
    color: '#C4B5FD',
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '600',
  },
  generatingDetails: {
    fontSize: 14,
    color: '#E5E7EB',
    textAlign: 'center',
    opacity: 0.8,
  },
  musicStatusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(74, 222, 128, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 8,
  },
  musicStatusText: {
    color: '#4ADE80',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  testButton: {
    marginTop: 8,
  },
  testButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  testButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  aiMusicIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(139, 92, 246, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(139, 92, 246, 0.3)',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  aiMusicText: {
    color: '#C4B5FD',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    letterSpacing: 0.5,
  },
});

export default AIBreathingScreen;
