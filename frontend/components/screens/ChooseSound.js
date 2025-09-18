import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import Header from './Header';
import useAuthStore from '../../stores/useAuthStore';
import { db } from '../../supabase';

const { width } = Dimensions.get('window');

const ChooseSound = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [sound, setSound] = useState();
  const [selectedSound, setSelectedSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durations, setDurations] = useState({});
  const [musicData, setMusicData] = useState({});
  const [loading, setLoading] = useState(true);

  const tabs = ['All', 'Sleep', 'Reading', 'Calm', 'Focus', 'Meditation', 'Nature'];

  // Load music data from Supabase
  useEffect(() => {
    loadMusicData();
  }, []);

  const loadMusicData = async () => {
    try {
      setLoading(true);
      const music = await db.getMusic();
      
      // Group music by category
      const groupedMusic = {
        All: music,
        Sleep: music.filter(item => item.category === 'Sleep'),
        Reading: music.filter(item => item.category === 'Reading'),
        Calm: music.filter(item => item.category === 'Calm'),
        Focus: music.filter(item => item.category === 'Focus'),
        Meditation: music.filter(item => item.category === 'Meditation'),
        Nature: music.filter(item => item.category === 'Nature'),
      };
      
      setMusicData(groupedMusic);
    } catch (error) {
      console.error('Error loading music:', error);
      // Fallback to local data if Supabase fails
      setMusicData({
        All: [
          { 
            id: 1, 
            name: 'Lost', 
            image_url: require('../../assets/images/lost.png'),
            audio_url: require('../../assets/audio/lost.wav'),
            category: 'Calm'
          },
          { 
            id: 2, 
            name: 'Discover', 
            image_url: require('../../assets/images/discover.png'),
            audio_url: require('../../assets/audio/discover.wav'),
            category: 'Focus'
          },
          { 
            id: 3, 
            name: 'Journey', 
            image_url: require('../../assets/images/journey.png'),
            audio_url: require('../../assets/audio/journey.wav'),
            category: 'Nature'
          },
          { 
            id: 4, 
            name: 'Joyful', 
            image_url: require('../../assets/images/joyful.png'),
            audio_url: require('../../assets/audio/joyful.wav'),
            category: 'Meditation'
          },
        ],
        Sleep: [],
        Reading: [],
        Calm: [],
        Focus: [],
        Meditation: [],
        Nature: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = ((milliseconds % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds.padStart(2, '0')}`;
  };

  useEffect(() => {
    // Initialize audio
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
      // Cleanup
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playSound = async (item) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
      }

      if (selectedSound?.id === item.id && isPlaying) {
        setIsPlaying(false);
        setSound(null);
      } else {
        // Use audio_url from Supabase data or fallback to local require
        const audioSource = item.audio_url || item.audio;
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          audioSource,
          { shouldPlay: true, isLooping: true }
        );
        
        // Store the duration
        if (status.durationMillis) {
          setDurations(prev => ({
            ...prev,
            [item.id]: status.durationMillis
          }));
        }
        
        setSound(newSound);
        setSelectedSound(item);
        setIsPlaying(true);

        newSound.setOnPlaybackStatusUpdate((status) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const renderGridItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.gridItem}
      onPress={() => playSound(item)}
    >
      <View style={[
        styles.musicCover,
        selectedSound?.id === item.id && styles.selectedMusicCover
      ]}>
        <Image 
          source={item.image_url || item.image} 
          style={styles.coverImage} 
        />
        <View style={styles.musicIcon}>
          <MaterialCommunityIcons 
            name={selectedSound?.id === item.id && isPlaying ? "pause" : "play"} 
            size={20} 
            color="#FFF" 
          />
        </View>
        {selectedSound?.id === item.id && (
          <View style={[
            styles.selectedOverlay,
            isPlaying && styles.playingOverlay
          ]} />
        )}
      </View>
      <Text style={styles.duration}>
        {durations[item.id] ? formatDuration(durations[item.id]) : '--:--'}
      </Text>
      <Text style={[
        styles.musicTitle,
        selectedSound?.id === item.id && styles.selectedMusicTitle
      ]}>
        {item.name || item.title}
      </Text>
    </TouchableOpacity>
  );

  const handleNext = () => {
    const store = useAuthStore.getState();
    if (!store?.mood) {
      console.error('No mood selected');
      return;
    }
    
    if (sound) {
      sound.unloadAsync();
    }
  
    // Create a simplified sound object with only necessary data
    const simplifiedSound = selectedSound ? {
      id: selectedSound.id,
      title: selectedSound.name || selectedSound.title,
      // Use audio_url from Supabase or fallback to audio
      audio: selectedSound.audio_url || selectedSound.audio.toString()
    } : null;
    
    // Navigate to AI Breathing Screen with AI music option
    navigation.navigate('AIBreathingScreen', {
      selectedMood: store.mood.label,
      breathingPattern: store.breathingPattern,
      selectedSound: simplifiedSound,
      useAIMusic: true // Enable AI music generation
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header showBack navigation={navigation} />

      <Text style={styles.title}>Choose soundtrack</Text>
      
      {/* AI Music Option */}
      <View style={styles.aiMusicOption}>
        <TouchableOpacity 
          style={styles.aiMusicButton}
          onPress={() => {
            if (sound) {
              sound.unloadAsync();
            }
            navigation.navigate('AIBreathingScreen', {
              selectedMood: useAuthStore.getState().mood?.label || 'Calm',
              breathingPattern: useAuthStore.getState().breathingPattern || { inhale: 4, hold1: 4, exhale: 4, hold2: 4 },
              selectedSound: null,
              useAIMusic: true
            });
          }}
        >
          <View style={styles.aiMusicContent}>
            <Ionicons name="sparkles" size={24} color="#FFD700" />
            <View style={styles.aiMusicText}>
              <Text style={styles.aiMusicTitle}>AI Generated Music</Text>
              <Text style={styles.aiMusicSubtitle}>Personalized based on your mood</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#8B5CF6" />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContainer}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab
              ]}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.gridContainer}>
        <View style={styles.grid}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading music...</Text>
            </View>
          ) : (
            musicData[activeTab]?.map(renderGridItem)
          )}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.nextButton, !selectedSound && styles.disabledButton]}
          onPress={handleNext}
          disabled={!selectedSound}
        >
          <Text style={styles.nextButtonText}>Next</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  tabsContainer: {
    marginBottom: 24,
  },
  tabsScrollContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 100,
    backgroundColor: '#F3F4F6',
    marginRight: 12,
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 72) / 2,
    marginBottom: 24,
    alignItems: 'center',
  },
  musicCover: {
    width: (width - 72) / 2,
    height: (width - 72) / 2,
    borderRadius: (width - 72) / 4,
    overflow: 'hidden',
    position: 'relative',
  },
  selectedMusicCover: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  musicIcon: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 8,
    borderRadius: 20,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
  },
  playingOverlay: {
    backgroundColor: 'rgba(139, 92, 246, 0.5)',
  },
  duration: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
  },
  musicTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginTop: 4,
  },
  selectedMusicTitle: {
    color: '#8B5CF6',
  },
  buttonContainer: {
    padding: 24,
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#D1D5DB',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  aiMusicOption: {
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  aiMusicButton: {
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.3)',
    padding: 16,
  },
  aiMusicContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiMusicText: {
    flex: 1,
    marginLeft: 12,
  },
  aiMusicTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  aiMusicSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default ChooseSound;

