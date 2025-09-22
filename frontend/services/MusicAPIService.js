import { Audio } from 'expo-av';

class MusicAPIService {
  constructor() {
    this.baseURL = 'http://localhost:3000/api/music';
    this.currentSound = null;
    this.isPlaying = false;
  }

  /**
   * Generate and play music for a breathing session
   * @param {Object} params - Music generation parameters
   * @param {string} params.mood - Mood for music generation
   * @param {number} params.bpm - Beats per minute
   * @param {Array} params.instruments - Array of instruments
   * @param {Object} params.breathingPattern - Breathing pattern object
   * @param {number} params.duration - Duration in seconds
   */
  async generateAndPlayMusic(params) {
    try {
      console.log('🎵 Generating music with params:', params);
      
      // Stop any currently playing music
      await this.stopMusic();
      
      // Generate music via API
      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('🎵 Music generated:', data);

      if (data.success && data.music.audio_file) {
        // Get the audio file URL
        const audioUrl = `${this.baseURL}/audio/${data.music.audio_file.filename}?format=demo`;
        console.log('🎵 Playing audio from:', audioUrl);
        
        // Play the generated music
        await this.playAudioFromURL(audioUrl);
        
        return {
          success: true,
          music: data.music,
          audioUrl: audioUrl
        };
      } else {
        throw new Error('No audio file generated');
      }
    } catch (error) {
      console.error('Error generating/playing music:', error);
      throw error;
    }
  }

  /**
   * Play audio from URL
   * @param {string} audioUrl - URL of the audio file
   */
  async playAudioFromURL(audioUrl) {
    try {
      // Stop current sound if playing
      if (this.currentSound) {
        await this.currentSound.unloadAsync();
      }

      // Create new audio sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.7
        }
      );
      
      this.currentSound = sound;
      this.isPlaying = true;

      console.log('🎵 Music started playing');
    } catch (error) {
      console.error('Error playing audio:', error);
      throw error;
    }
  }

  /**
   * Stop currently playing music
   */
  async stopMusic() {
    try {
      if (this.currentSound) {
        await this.currentSound.pauseAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
        this.isPlaying = false;
        console.log('🎵 Music stopped');
      }
    } catch (error) {
      console.error('Error stopping music:', error);
    }
  }

  /**
   * Pause currently playing music
   */
  async pauseMusic() {
    try {
      if (this.currentSound && this.isPlaying) {
        await this.currentSound.pauseAsync();
        this.isPlaying = false;
        console.log('🎵 Music paused');
      }
    } catch (error) {
      console.error('Error pausing music:', error);
    }
  }

  /**
   * Resume paused music
   */
  async resumeMusic() {
    try {
      if (this.currentSound && !this.isPlaying) {
        await this.currentSound.playAsync();
        this.isPlaying = true;
        console.log('🎵 Music resumed');
      }
    } catch (error) {
      console.error('Error resuming music:', error);
    }
  }

  /**
   * Set volume for current music
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  async setVolume(volume) {
    try {
      if (this.currentSound) {
        await this.currentSound.setVolumeAsync(volume);
        console.log('🎵 Volume set to:', volume);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  /**
   * Get current playing state
   */
  getPlayingState() {
    return {
      isPlaying: this.isPlaying,
      hasSound: !!this.currentSound
    };
  }

  /**
   * Generate test audio for quick testing
   * @param {string} mood - Mood for test audio
   * @param {number} duration - Duration in seconds
   */
  async generateTestAudio(mood = 'Anxiety Relief', duration = 10) {
    try {
      const response = await fetch(`${this.baseURL}/test-audio?mood=${encodeURIComponent(mood)}&duration=${duration}&format=stream`);
      const data = await response.json();
      
      if (data.success) {
        await this.playAudioFromURL(data.audioUrl);
        return data;
      } else {
        throw new Error('Failed to generate test audio');
      }
    } catch (error) {
      console.error('Error generating test audio:', error);
      throw error;
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    await this.stopMusic();
  }
}

// Export singleton instance
export default new MusicAPIService();
