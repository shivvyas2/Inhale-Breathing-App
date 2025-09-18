// MusicManager.js
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../../supabase';
import useSupabaseAuth from '../../stores/useSupabaseAuth';

const MusicManager = ({ onMusicSelect, selectedMusicId }) => {
  const [musicList, setMusicList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState(null);
  const [sound, setSound] = useState(null);
  const { user } = useSupabaseAuth();

  useEffect(() => {
    loadMusic();
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const loadMusic = async () => {
    try {
      setLoading(true);
      const music = await db.getMusic('breathing');
      setMusicList(music);
    } catch (error) {
      console.error('Error loading music:', error);
      Alert.alert('Error', 'Failed to load music');
    } finally {
      setLoading(false);
    }
  };

  const playMusic = async (musicItem) => {
    try {
      // Stop current sound if playing
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }

      if (playingId === musicItem.id) {
        setPlayingId(null);
        return;
      }

      // Load and play new sound
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: musicItem.file_url },
        { shouldPlay: true, isLooping: true }
      );

      setSound(newSound);
      setPlayingId(musicItem.id);

      // Auto-stop after 30 seconds for preview
      setTimeout(async () => {
        if (newSound) {
          await newSound.unloadAsync();
          setSound(null);
          setPlayingId(null);
        }
      }, 30000);

    } catch (error) {
      console.error('Error playing music:', error);
      Alert.alert('Error', 'Failed to play music');
    }
  };

  const selectMusic = (musicItem) => {
    onMusicSelect(musicItem);
  };

  const toggleFavorite = async (musicId) => {
    try {
      if (!user) return;
      
      await db.updateMusicPreference(user.id, musicId, true);
      Alert.alert('Success', 'Added to favorites');
    } catch (error) {
      console.error('Error updating favorite:', error);
      Alert.alert('Error', 'Failed to update favorite');
    }
  };

  const renderMusicItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.musicItem,
        selectedMusicId === item.id && styles.selectedItem
      ]}
      onPress={() => selectMusic(item)}
    >
      <View style={styles.musicInfo}>
        <View style={styles.musicHeader}>
          <Text style={styles.musicName}>{item.name}</Text>
          <View style={styles.musicActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => playMusic(item)}
            >
              <Ionicons
                name={playingId === item.id ? 'pause' : 'play'}
                size={20}
                color="#8B5CF6"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => toggleFavorite(item.id)}
            >
              <Ionicons
                name="heart-outline"
                size={20}
                color="#8B5CF6"
              />
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.musicDetails}>
          {item.mood} • {Math.floor(item.duration_seconds / 60)} min
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading music...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose Your Sound</Text>
      <FlatList
        data={musicList}
        keyExtractor={(item) => item.id}
        renderItem={renderMusicItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginVertical: 20,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  musicItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedItem: {
    borderWidth: 2,
    borderColor: '#8B5CF6',
  },
  musicInfo: {
    flex: 1,
  },
  musicHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  musicName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  musicActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
  },
  musicDetails: {
    fontSize: 14,
    color: '#6B7280',
  },
});

export default MusicManager;
