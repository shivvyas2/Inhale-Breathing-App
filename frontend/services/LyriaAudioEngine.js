import LyriaRealTimeService from './LyriaRealTimeService';

export class LyriaAudioEngine {
  constructor() {
    this.lyriaService = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.params = null;
    this.audioContext = null;
    this.audioSource = null;
    this.gainNode = null;
    this.currentBuffer = null;
  }

  // Initialize the Lyria audio engine
  async setup(params) {
    try {
      console.log('🎵 Setting up Lyria Audio Engine with params:', params);
      
      // Initialize Lyria service
      this.lyriaService = new LyriaRealTimeService();
      await this.lyriaService.initialize();
      
      // Set up audio context for playback
      await this.setupAudioContext();
      
      // Set up Lyria callbacks
      this.lyriaService.setCallbacks({
        onAudioData: this.handleAudioData.bind(this),
        onConnectionChange: this.handleConnectionChange.bind(this),
        onPlaybackStateChange: this.handlePlaybackStateChange.bind(this),
        onError: this.handleError.bind(this)
      });
      
      // Connect to Lyria
      await this.lyriaService.connect();
      
      this.params = params;
      this.isInitialized = true;
      
      console.log('✅ Lyria Audio Engine setup complete');
    } catch (error) {
      console.error('Error setting up Lyria Audio Engine:', error);
      throw error;
    }
  }

  // Set up Web Audio API context
  async setupAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain node for volume control
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
      this.gainNode.gain.value = 0.7; // Default volume
      
      console.log('✅ Audio context setup complete');
    } catch (error) {
      console.error('Error setting up audio context:', error);
      throw error;
    }
  }

  // Handle incoming audio data from Lyria
  handleAudioData(audioBuffer) {
    try {
      if (!this.audioContext || !this.gainNode) return;
      
      // Stop current source if playing
      if (this.audioSource) {
        this.audioSource.stop();
      }
      
      // Create new audio source
      this.audioSource = this.audioContext.createBufferSource();
      this.audioSource.buffer = audioBuffer;
      this.audioSource.connect(this.gainNode);
      
      // Start playing
      this.audioSource.start();
      
      console.log('🎵 Playing Lyria audio chunk');
    } catch (error) {
      console.error('Error handling audio data:', error);
    }
  }

  // Handle connection state changes
  handleConnectionChange(isConnected) {
    console.log('🔗 Lyria connection state:', isConnected ? 'Connected' : 'Disconnected');
  }

  // Handle playback state changes
  handlePlaybackStateChange(isPlaying) {
    this.isPlaying = isPlaying;
    console.log('▶️ Lyria playback state:', isPlaying ? 'Playing' : 'Stopped');
  }

  // Handle errors
  handleError(error) {
    console.error('❌ Lyria error:', error);
  }

  // Start music generation
  async play() {
    if (!this.isInitialized || !this.lyriaService) {
      throw new Error('Lyria Audio Engine not initialized');
    }

    try {
      // Generate music based on current parameters
      await this.lyriaService.generateMusic(
        this.params?.mood || 'Meditate',
        this.params?.breathingPattern,
        this.params?.instruments || []
      );
      
      this.isPlaying = true;
      console.log('✅ Lyria music generation started');
    } catch (error) {
      console.error('Error starting Lyria music generation:', error);
      throw error;
    }
  }

  // Stop music generation
  async stop() {
    if (!this.lyriaService) return;

    try {
      await this.lyriaService.stop();
      this.isPlaying = false;
      
      // Stop current audio source
      if (this.audioSource) {
        this.audioSource.stop();
        this.audioSource = null;
      }
      
      console.log('✅ Lyria music generation stopped');
    } catch (error) {
      console.error('Error stopping Lyria music generation:', error);
    }
  }

  // Pause music generation
  async pause() {
    if (!this.lyriaService) return;

    try {
      await this.lyriaService.pause();
      this.isPlaying = false;
      console.log('✅ Lyria music generation paused');
    } catch (error) {
      console.error('Error pausing Lyria music generation:', error);
    }
  }

  // Update music parameters in real-time
  async updateParameters(newParams) {
    if (!this.lyriaService || !this.isPlaying) return;

    try {
      this.params = { ...this.params, ...newParams };
      
      // Update prompts if mood or instruments changed
      if (newParams.mood || newParams.instruments) {
        const prompts = this.lyriaService.createPromptsFromMood(
          this.params.mood,
          this.params.instruments
        );
        await this.lyriaService.setWeightedPrompts(prompts);
      }
      
      // Update config if breathing pattern changed
      if (newParams.breathingPattern) {
        const config = this.lyriaService.createConfigFromBreathing(
          this.params.breathingPattern
        );
        await this.lyriaService.setMusicGenerationConfig(config);
        await this.lyriaService.resetContext(); // Reset for BPM changes
      }
      
      console.log('✅ Lyria parameters updated');
    } catch (error) {
      console.error('Error updating Lyria parameters:', error);
    }
  }

  // Set volume
  setVolume(volume) {
    if (this.gainNode) {
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.gainNode.gain.setValueAtTime(clampedVolume, this.audioContext.currentTime);
      console.log('🔊 Volume set to:', clampedVolume);
    }
  }

  // Get playing state
  getPlayingState() {
    return {
      isPlaying: this.isPlaying,
      isInitialized: this.isInitialized,
      hasConnection: this.lyriaService?.getState()?.isConnected || false
    };
  }

  // Cleanup
  async cleanup() {
    try {
      if (this.lyriaService) {
        await this.lyriaService.cleanup();
        this.lyriaService = null;
      }
      
      if (this.audioSource) {
        this.audioSource.stop();
        this.audioSource = null;
      }
      
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      
      if (this.audioContext) {
        await this.audioContext.close();
        this.audioContext = null;
      }
      
      this.isInitialized = false;
      this.isPlaying = false;
      
      console.log('✅ Lyria Audio Engine cleaned up');
    } catch (error) {
      console.error('Error cleaning up Lyria Audio Engine:', error);
    }
  }
}

export default LyriaAudioEngine;
