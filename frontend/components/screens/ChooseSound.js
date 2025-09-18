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

const { width } = Dimensions.get('window');

const ChooseSound = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [sound, setSound] = useState();
  const [selectedSound, setSelectedSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [durations, setDurations] = useState({});

  const tabs = ['All', 'Sleep', 'Reading', 'Calm', 'Focus', 'Meditation', 'Nature'];

  const musicData = {
    All: [
      { 
        id: 1, 
        title: 'Lost', 
        image: require('../../assets/images/lost.png'),
        audio: require('../../assets/audio/lost.wav')
      },
      { 
        id: 2, 
        title: 'Discover', 
        image: require('../../assets/images/discover.png'),
        audio: require('../../assets/audio/discover.wav')
      },
      { 
        id: 3, 
        title: 'Journey', 
        image: require('../../assets/images/journey.png'),
        audio: require('../../assets/audio/journey.wav')
      },
      { 
        id: 4, 
        title: 'Joyful', 
        image: require('../../assets/images/joyful.png'),
        audio: require('../../assets/audio/joyful.wav')
      },
    ],
    // Add more categories...
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
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          item.audio,
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
        <Image source={item.image} style={styles.coverImage} />
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
        {item.title}
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
      title: selectedSound.title,
      // Convert require() to string path for storage
      audio: selectedSound.audio.toString()
    } : null;
    
    navigation.navigate('BreathingScreen', {
      selectedMood: store.mood.label,
      breathingPattern: store.breathingPattern,
      selectedSound: simplifiedSound
    });
  };
  return (
    <SafeAreaView style={styles.container}>
      <Header showBack navigation={navigation} />

      <Text style={styles.title}>Choose soundtrack</Text>

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
          {musicData[activeTab]?.map(renderGridItem)}
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
});

export default ChooseSound;

