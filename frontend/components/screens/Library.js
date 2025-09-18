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
import { useUser } from '@clerk/clerk-expo';
import { db } from '../../supabase';

const { width } = Dimensions.get('window');

const Library = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [sound, setSound] = useState();
  const [selectedItem, setSelectedItem] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [meditationData, setMeditationData] = useState([]);
  const [userSessions, setUserSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();

  const tabs = ['All', 'Focus', 'Meditate', 'Anxiety', 'Calm', 'Sleep', 'Reading', 'Nature'];

  // Load data from Supabase
  useEffect(() => {
    loadLibraryData();
  }, [user]);

  const loadLibraryData = async () => {
    try {
      setLoading(true);
      
      // Load music data
      const music = await db.getMusic();
      
      // Load user sessions if user is logged in
      let sessions = [];
      if (user) {
        sessions = await db.getUserSessions(user.id);
      }
      
      // Combine music with session data
      const combinedData = music.map(musicItem => {
        const sessionCount = sessions.filter(session => 
          session.music_id === musicItem.id
        ).length;
        
        return {
          ...musicItem,
          sessionCount,
          lastPlayed: sessions
            .filter(session => session.music_id === musicItem.id)
            .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]?.created_at
        };
      });
      
      setMeditationData(combinedData);
      setUserSessions(sessions);
    } catch (error) {
      console.error('Error loading library data:', error);
      // Fallback to local data
      setMeditationData([
        {
          id: 1, 
          name: 'Lost', 
          duration: '30:30',
          category: 'Calm',
          image_url: require('../../assets/images/lost.png'),
          audio_url: require('../../assets/audio/lost.wav'),
          sessionCount: 0
        },
        {
          id: 2, 
          name: 'Discover', 
          duration: '30:30', 
          category: 'Focus',
          image_url: require('../../assets/images/discover.png'),
          audio_url: require('../../assets/audio/discover.wav'),
          sessionCount: 0
        },
        {
          id: 3, 
          name: 'Journey', 
          duration: '30:30', 
          category: 'Nature',
          image_url: require('../../assets/images/journey.png'),
          audio_url: require('../../assets/audio/journey.wav'),
          sessionCount: 0
        },
        {
          id: 4, 
          name: 'Joyful', 
          duration: '30:30', 
          category: 'Meditate',
          image_url: require('../../assets/images/joyful.png'),
          audio_url: require('../../assets/audio/joyful.wav'),
          sessionCount: 0
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Filter meditation items based on active tab
  const filteredMeditations = meditationData.filter(item => {
    if (activeTab === 'All') return true;
    return item.category === activeTab;
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
        // Use audio_url from Supabase data or fallback to local require
        const audioSource = item.audio_url || item.audio;
        const { sound: newSound } = await Audio.Sound.createAsync(
          audioSource,
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
      <Image 
        source={item.image_url || item.image} 
        style={styles.meditationImage} 
      />
      
      <View style={styles.meditationInfo}>
        <Text style={styles.timeCategory}>
          {item.duration} · {item.category}
        </Text>
        <Text style={styles.meditationTitle}>{item.name || item.title}</Text>
        {item.sessionCount > 0 && (
          <Text style={styles.sessionCount}>
            {item.sessionCount} session{item.sessionCount !== 1 ? 's' : ''}
          </Text>
        )}
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading library...</Text>
          </View>
        ) : (
          filteredMeditations.map(renderMeditationItem)
        )}
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
  sessionCount: {
    fontSize: 12,
    color: '#8B5CF6',
    marginTop: 2,
    fontWeight: '500',
  },
});

export default Library;