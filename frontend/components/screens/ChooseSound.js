import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
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

  const tabs = ['All', 'Ambience', 'Mood'];

  // Load music data from Supabase
  useEffect(() => {
    loadMusicData();
  }, []);


  const loadMusicData = async () => {
    try {
      setLoading(true);
      
      // Always use local data for now since we have the audio samples
      const localMusic = [
        // Ambience Sounds - Using actual sample audio files
        { 
          id: 1, 
          name: 'Waves', 
          image_url: require('../../assets/images/album-cover/ocean.png'),
          audio_url: require('../../assets/samples/Waves.wav'), // Actual waves audio
          category: 'Ambience',
          description: 'Gentle ocean waves for relaxation'
        },
        { 
          id: 2, 
          name: 'Thunder', 
          image_url: require('../../assets/images/album-cover/thunder.png'),
          audio_url: require('../../assets/samples/Thunder1.wav'), // Actual thunder audio
          category: 'Ambience',
          description: 'Distant thunder and rain'
        },
        { 
          id: 3, 
          name: 'Chimes', 
          image_url: require('../../assets/images/album-cover/chime.png'),
          audio_url: require('../../assets/samples/Chimes.wav'), // Actual chimes audio
          category: 'Ambience',
          description: 'Soft wind chimes and bells'
        },
        { 
          id: 4, 
          name: 'Backyard', 
          image_url: require('../../assets/images/album-cover/backyard.png'),
          audio_url: require('../../assets/samples/Backyard.wav'), // Actual backyard audio
          category: 'Ambience',
          description: 'Nature sounds from a peaceful backyard'
        },
        
        // Mood Sounds - Each with unique audio for variety
        { 
          id: 5, 
          name: 'Journey', 
          image_url: require('../../assets/images/journey.png'),
          audio_url: require('../../assets/audio/journey.wav'), // Perfect match
          category: 'Mood',
          description: 'Adventurous and uplifting'
        },
        { 
          id: 6, 
          name: 'Joyful', 
          image_url: require('../../assets/images/joyful.png'),
          audio_url: require('../../assets/audio/joyful.wav'), // Perfect match
          category: 'Mood',
          description: 'Happy and energetic'
        },
      ];
      
      // Group music by category
      const groupedMusic = {
        All: localMusic,
        Ambience: localMusic.filter(item => item.category === 'Ambience'),
        Mood: localMusic.filter(item => item.category === 'Mood'),
      };
      
      console.log('🎵 Loaded music data:', groupedMusic);
      setMusicData(groupedMusic);
      
    } catch (error) {
      console.error('Error loading music:', error);
      // Fallback to empty data
      setMusicData({
        All: [],
        Ambience: [],
        Mood: [],
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
    // Set up audio mode for expo-av
    const setupAudio = async () => {
      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('✅ Audio mode set up successfully');
      } catch (error) {
        console.error('❌ Error setting up audio mode:', error);
      }
    };
    
    setupAudio();

    return () => {
      // Cleanup
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playSound = async (item) => {
    try {
      // Stop current sound if playing
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }

      // If clicking the same item that's playing, stop it
      if (selectedSound?.id === item.id && isPlaying) {
        setIsPlaying(false);
        setSelectedSound(null);
        return;
      }

      // Check if audio is available
      const audioSource = item.audio_url || item.audio;
      
      if (!audioSource) {
        console.log('No audio available for this item:', item.name);
        // Just toggle the visual state without playing audio
        setSelectedSound(item);
        setIsPlaying(true);
        return;
      }
      
      console.log('🎵 Playing audio for:', item.name);
      console.log('🎵 Audio file:', audioSource);
      console.log('🎵 Category:', item.category);
      
      try {
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
        setSelectedSound(item);
        setIsPlaying(true);
        
        console.log('✅ Audio started playing for:', item.name);
        
      } catch (audioError) {
        console.error('❌ Audio playback error:', audioError);
        console.error('❌ Error details:', {
          message: audioError.message,
          code: audioError.code,
          stack: audioError.stack
        });
        // Still allow visual selection even if audio fails
        setSelectedSound(item);
        setIsPlaying(true);
      }
      
    } catch (error) {
      console.error('Error selecting sound:', error);
      // Still allow visual selection even if audio fails
      setSelectedSound(item);
      setIsPlaying(true);
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
          <Ionicons 
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
      {item.description && (
        <Text style={styles.musicDescription}>
          {item.description}
        </Text>
      )}
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
      // Use audio_url from local music or fallback to audio
      audio: selectedSound.audio_url || selectedSound.audio,
      image: selectedSound.image_url || selectedSound.image,
      description: selectedSound.description
    } : null;
    
    // Navigate to AI Breathing Screen
    // If a sound is selected, use it; otherwise enable AI music generation
    navigation.navigate('AIBreathingScreen', {
      selectedMood: store.mood.label,
      breathingPattern: store.breathingPattern,
      selectedSound: simplifiedSound,
      useAIMusic: !selectedSound // Only use AI music if no sound is selected
    });
  };
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Header showBack navigation={navigation} />
      
      <ScrollView 
        style={styles.mainScrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Choose soundtrack</Text>
      
      {/* Song Preview Section */}
      {selectedSound && (
        <View style={styles.previewSection}>
          <View style={styles.previewContent}>
            <Image 
              source={selectedSound.image_url || selectedSound.image} 
              style={styles.previewImage} 
            />
            <View style={styles.previewInfo}>
              <Text style={styles.previewTitle}>{selectedSound.name || selectedSound.title}</Text>
              <Text style={styles.previewDuration}>
                {durations[selectedSound.id] ? formatDuration(durations[selectedSound.id]) : '--:--'}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.previewPlayButton}
              onPress={() => playSound(selectedSound)}
            >
              <Ionicons 
                name={isPlaying ? "pause" : "play"} 
                size={24} 
                color="#FFF" 
              />
            </TouchableOpacity>
          </View>
        </View>
      )}
      
      {/* AI Music Option */}
      <View style={styles.aiMusicOption}>
        <TouchableOpacity 
          style={styles.aiMusicButton}
          onPress={() => navigation.navigate('InstrumentSelection')}
        >
          <View style={styles.aiMusicContent}>
            <MaterialCommunityIcons name="music" size={24} color="#C4B5FD" />
            <View style={styles.aiMusicText}>
              <Text style={styles.aiMusicTitle}>Make your Own</Text>
              <Text style={styles.aiMusicSubtitle}>
                Create personalized music with AI
              </Text>
            </View>
            <MaterialCommunityIcons 
              name="chevron-right" 
              size={20} 
              color="#8B5CF6" 
            />
          </View>
        </TouchableOpacity>
        
      </View>
      </ScrollView>


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

      <View style={styles.gridContainer}>
        <ScrollView 
          style={styles.gridScrollView}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.grid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading music...</Text>
              </View>
            ) : musicData[activeTab] && musicData[activeTab].length > 0 ? (
              musicData[activeTab].map(renderGridItem)
            ) : (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No music available for {activeTab}</Text>
                <Text style={styles.loadingText}>Total items: {musicData[activeTab]?.length || 0}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.nextButton, !selectedSound && styles.disabledButton]}
          onPress={handleNext}
          disabled={!selectedSound}
        >
          <Text style={[styles.nextButtonText, !selectedSound && styles.disabledButtonText]}>
            {selectedSound ? `Start Session with ${selectedSound.name}` : 'Select a Sound to Continue'}
          </Text>
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
  mainScrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 32,
    letterSpacing: -0.5,
  },
  previewSection: {
    marginBottom: 24,
    paddingHorizontal: 24,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
    marginRight: 20,
    resizeMode: 'cover',
  },
  previewInfo: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  previewDuration: {
    fontSize: 15,
    color: '#6B7280',
    fontWeight: '500',
  },
  previewPlayButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 28,
    width: 56,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  aiMusicOption: {
    marginBottom: 28,
    paddingHorizontal: 24,
  },
  aiMusicButton: {
    backgroundColor: 'rgba(139, 92, 246, 0.08)',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(139, 92, 246, 0.2)',
    padding: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  aiMusicContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiMusicText: {
    flex: 1,
    marginLeft: 16,
  },
  aiMusicTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#7C3AED',
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  aiMusicSubtitle: {
    fontSize: 15,
    color: '#A78BFA',
    fontWeight: '600',
    lineHeight: 20,
  },
  tabsContainer: {
    marginBottom: 28,    paddingVertical: 8,
  },
  tabsScrollContainer: {
    paddingHorizontal: 24,    gap: 16,
  },
  tab: {
    paddingVertical: 14,    paddingHorizontal: 28,
    borderRadius: 25,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',    shadowOffset: { width: 0, height: 1 },    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    letterSpacing: -0.1,
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 24,
  },
  gridScrollView: {
    flex: 1,
  },
  gridContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 20,
  },
  gridItem: {
    width: (width - 68) / 2,
    alignItems: 'center',
  },
  musicCover: {
    width: (width - 68) / 2,
    height: (width - 68) / 2,
    borderRadius: (width - 68) / 4, // Makes it perfectly circular
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  selectedMusicCover: {
    borderWidth: 3,
    borderColor: '#8B5CF6',
    borderRadius: (width - 68) / 4, // Maintains circular shape when selected
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  coverImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  musicIcon: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
    borderRadius: 20,
    backdropFilter: 'blur(10px)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 92, 246, 0.25)',
  },
  playingOverlay: {
    backgroundColor: 'rgba(139, 92, 246, 0.4)',
  },
  duration: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 12,
    fontWeight: '500',
  },
  musicTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 6,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  selectedMusicTitle: {
    color: '#8B5CF6',
  },
  musicDescription: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    textAlign: 'center',
    lineHeight: 16,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  buttonContainer: {
    padding: 24,
    paddingTop: 16,
  },
  nextButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  disabledButtonText: {
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default ChooseSound;
