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

const { width } = Dimensions.get('window');

const Library = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [sound, setSound] = useState();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const tabs = ['All', 'Focus', 'Meditate', 'Anxiety', 'Calm', 'Sleep', 'Reading', 'Nature'];

  const meditationData = [
    {
      id: 1, 
      title: 'Lost', 
      duration: '30:30',
      categories: ['Mindfulness', 'Meditate', 'Calm'],
      image: require('../../assets/images/lost.png'),
      audio: require('../../assets/audio/lost.wav')
    },
    {
      id: 2, 
      title: 'Discover', 
      duration: '30:30', 
      categories: ['Mindfulness', 'Focus', 'Reading'],
      image: require('../../assets/images/discover.png'),
      audio: require('../../assets/audio/discover.wav')
    },
    {
      id: 3, 
      title: 'Journey', 
      duration: '30:30', 
      categories: ['Gratitude', 'Sleep', 'Nature'],
      image: require('../../assets/images/journey.png'),
      audio: require('../../assets/audio/journey.wav')
    },
    {
      id: 4, 
      title: 'Joyful', 
      duration: '30:30', 
      categories: ['Mindfulness', 'Anxiety', 'Calm'],
      image: require('../../assets/images/joyful.png'),
      audio: require('../../assets/audio/joyful.wav')
    },
  ];

  // Filter meditation items based on active tab
  const filteredMeditations = meditationData.filter(item => {
    if (activeTab === 'All') return true;
    return item.categories.includes(activeTab);
  });

  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });

    return () => {
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

      if (selectedItem?.id === item.id && isPlaying) {
        setIsPlaying(false);
        setSound(null);
        setSelectedItem(null);
      } else {
        const { sound: newSound } = await Audio.Sound.createAsync(
          item.audio,
          { shouldPlay: true, isLooping: true }
        );
        
        setSound(newSound);
        setSelectedItem(item);
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

  const renderMeditationItem = (item) => (
    <TouchableOpacity 
      key={item.id}
      style={styles.meditationItem}
      onPress={() => playSound(item)}
    >
      <Image source={item.image} style={styles.meditationImage} />
      
      <View style={styles.meditationInfo}>
        <Text style={styles.timeCategory}>
          {item.duration} · {item.categories[0]}
        </Text>
        <Text style={styles.meditationTitle}>{item.title}</Text>
      </View>

      <TouchableOpacity 
        style={styles.menuButton}
        onPress={() => {/* Handle menu options */}}
      >
        <MaterialCommunityIcons 
          name="dots-vertical" 
          size={24} 
          color="#6B7280" 
        />
      </TouchableOpacity>

      {selectedItem?.id === item.id && (
        <View style={[
          styles.playPauseOverlay,
          isPlaying && styles.playingOverlay
        ]}>
          <MaterialCommunityIcons 
            name={isPlaying ? "pause" : "play"} 
            size={32} 
            color="#FFF" 
          />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Library</Text>

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

      <ScrollView style={styles.meditationList}>
        {filteredMeditations.map(renderMeditationItem)}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#1F2937',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
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
  meditationList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  meditationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  meditationImage: {
    width: 80,
    height: 80,
    borderRadius: 40, 
  },
  meditationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  timeCategory: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  meditationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  menuButton: {
    padding: 8,
  },
  playPauseOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 80,
    height: 80,
    borderRadius: 40, // Changed from 16 to 40 (half of width/height)
    backgroundColor: 'rgba(139, 92, 246, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  playingOverlay: {
    backgroundColor: 'rgba(139, 92, 246, 0.85)',
  },
});

export default Library;