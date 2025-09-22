import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from '../supabase';

export class LyriaRealTimeService {
  constructor() {
    this.client = null;
    this.session = null;
    this.isConnected = false;
    this.isPlaying = false;
    this.audioChunks = [];
    this.audioContext = null;
    this.audioBuffer = null;
    this.audioSource = null;
    this.callbacks = {
      onAudioData: null,
      onConnectionChange: null,
      onPlaybackStateChange: null,
      onError: null
    };
  }

  // Initialize the Lyria client
  async initialize(apiKey = null) {
    try {
      const key = apiKey || GEMINI_API_KEY;
      this.client = new GoogleGenerativeAI(key);
      console.log('🎵 Lyria RealTime Service initialized');
    } catch (error) {
      console.error('Failed to initialize Lyria RealTime Service:', error);
      throw error;
    }
  }

  // Connect to Lyria RealTime session
  async connect() {
    if (!this.client) {
      throw new Error('Lyria service not initialized');
    }

    try {
      console.log('🎵 Connecting to Lyria RealTime...');
      
      // Note: This is a simplified implementation
      // In production, you'd use the actual Lyria RealTime WebSocket API
      this.session = await this.createMockSession();
      this.isConnected = true;
      
      if (this.callbacks.onConnectionChange) {
        this.callbacks.onConnectionChange(true);
      }
      
      console.log('✅ Connected to Lyria RealTime');
    } catch (error) {
      console.error('Failed to connect to Lyria RealTime:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
      throw error;
    }
  }

  // Create a mock session for now (replace with actual Lyria API)
  async createMockSession() {
    return {
      setWeightedPrompts: async (prompts) => {
        console.log('🎵 Setting weighted prompts:', prompts);
      },
      setMusicGenerationConfig: async (config) => {
        console.log('🎵 Setting music config:', config);
      },
      play: async () => {
        console.log('🎵 Starting music generation...');
        this.isPlaying = true;
        this.startMockAudioGeneration();
      },
      pause: async () => {
        console.log('🎵 Pausing music generation...');
        this.isPlaying = false;
      },
      stop: async () => {
        console.log('🎵 Stopping music generation...');
        this.isPlaying = false;
        this.stopMockAudioGeneration();
      },
      resetContext: async () => {
        console.log('🎵 Resetting context...');
      }
    };
  }

  // Start mock audio generation (replace with actual Lyria streaming)
  startMockAudioGeneration() {
    if (this.audioGenerationInterval) {
      clearInterval(this.audioGenerationInterval);
    }

    this.audioGenerationInterval = setInterval(() => {
      if (this.isPlaying) {
        this.generateMockAudioChunk();
      }
    }, 100); // Generate audio every 100ms
  }

  // Stop mock audio generation
  stopMockAudioGeneration() {
    if (this.audioGenerationInterval) {
      clearInterval(this.audioGenerationInterval);
      this.audioGenerationInterval = null;
    }
  }

  // Generate mock audio chunk (replace with actual Lyria audio processing)
  generateMockAudioChunk() {
    // Create a simple audio chunk (in real implementation, this would be from Lyria)
    const sampleRate = 48000;
    const duration = 0.1; // 100ms
    const samples = Math.floor(sampleRate * duration);
    const audioData = new Float32Array(samples * 2); // Stereo

    // Generate a simple tone based on current mood/prompts
    const frequency = this.getCurrentFrequency();
    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * time) * 0.1;
      audioData[i * 2] = sample; // Left channel
      audioData[i * 2 + 1] = sample; // Right channel
    }

    // Convert to audio buffer
    const audioBuffer = this.createAudioBuffer(audioData, sampleRate);
    
    if (this.callbacks.onAudioData) {
      this.callbacks.onAudioData(audioBuffer);
    }
  }

  // Get current frequency based on mood/prompts
  getCurrentFrequency() {
    // This would be based on the current prompts and mood
    const baseFreq = 220; // A3
    const variation = Math.sin(Date.now() / 1000) * 50;
    return baseFreq + variation;
  }

  // Create audio buffer from Float32Array
  createAudioBuffer(audioData, sampleRate) {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    const buffer = this.audioContext.createBuffer(2, audioData.length / 2, sampleRate);
    const leftChannel = buffer.getChannelData(0);
    const rightChannel = buffer.getChannelData(1);

    for (let i = 0; i < audioData.length / 2; i++) {
      leftChannel[i] = audioData[i * 2];
      rightChannel[i] = audioData[i * 2 + 1];
    }

    return buffer;
  }

  // Set weighted prompts for music generation
  async setWeightedPrompts(prompts) {
    if (!this.session) {
      throw new Error('Not connected to Lyria RealTime');
    }

    try {
      await this.session.setWeightedPrompts(prompts);
      console.log('✅ Prompts set:', prompts);
    } catch (error) {
      console.error('Failed to set prompts:', error);
      throw error;
    }
  }

  // Set music generation configuration
  async setMusicGenerationConfig(config) {
    if (!this.session) {
      throw new Error('Not connected to Lyria RealTime');
    }

    try {
      await this.session.setMusicGenerationConfig(config);
      console.log('✅ Music config set:', config);
    } catch (error) {
      console.error('Failed to set music config:', error);
      throw error;
    }
  }

  // Start music generation
  async play() {
    if (!this.session) {
      throw new Error('Not connected to Lyria RealTime');
    }

    try {
      await this.session.play();
      this.isPlaying = true;
      
      if (this.callbacks.onPlaybackStateChange) {
        this.callbacks.onPlaybackStateChange(true);
      }
      
      console.log('✅ Music generation started');
    } catch (error) {
      console.error('Failed to start music generation:', error);
      throw error;
    }
  }

  // Pause music generation
  async pause() {
    if (!this.session) {
      throw new Error('Not connected to Lyria RealTime');
    }

    try {
      await this.session.pause();
      this.isPlaying = false;
      
      if (this.callbacks.onPlaybackStateChange) {
        this.callbacks.onPlaybackStateChange(false);
      }
      
      console.log('✅ Music generation paused');
    } catch (error) {
      console.error('Failed to pause music generation:', error);
      throw error;
    }
  }

  // Stop music generation
  async stop() {
    if (!this.session) {
      throw new Error('Not connected to Lyria RealTime');
    }

    try {
      await this.session.stop();
      this.isPlaying = false;
      
      if (this.callbacks.onPlaybackStateChange) {
        this.callbacks.onPlaybackStateChange(false);
      }
      
      console.log('✅ Music generation stopped');
    } catch (error) {
      console.error('Failed to stop music generation:', error);
      throw error;
    }
  }

  // Reset context
  async resetContext() {
    if (!this.session) {
      throw new Error('Not connected to Lyria RealTime');
    }

    try {
      await this.session.resetContext();
      console.log('✅ Context reset');
    } catch (error) {
      console.error('Failed to reset context:', error);
      throw error;
    }
  }

  // Generate music based on mood and breathing pattern
  async generateMusic(mood, breathingPattern, selectedInstruments = []) {
    try {
      // Create prompts based on mood and instruments
      const prompts = this.createPromptsFromMood(mood, selectedInstruments);
      
      // Set prompts
      await this.setWeightedPrompts(prompts);
      
      // Create configuration based on breathing pattern
      const config = this.createConfigFromBreathing(breathingPattern);
      
      // Set configuration
      await this.setMusicGenerationConfig(config);
      
      // Start generation
      await this.play();
      
      console.log('🎵 Lyria music generation started for mood:', mood);
      
    } catch (error) {
      console.error('Failed to generate music with Lyria:', error);
      throw error;
    }
  }

  // Create prompts from mood and instruments
  createPromptsFromMood(mood, selectedInstruments = []) {
    const moodPrompts = {
      'Anxiety Relief': [
        { text: 'Ambient', weight: 1.0 },
        { text: 'Soft Pads', weight: 1.5 },
        { text: 'Calming', weight: 1.2 },
        { text: 'Ocean Waves', weight: 0.8 }
      ],
      'Meditate': [
        { text: 'Minimalist', weight: 1.0 },
        { text: 'Singing Bowls', weight: 1.5 },
        { text: 'Harmonic Drones', weight: 1.2 },
        { text: 'Soft Bells', weight: 0.8 }
      ],
      'Wind Down': [
        { text: 'Chill Ambient', weight: 1.0 },
        { text: 'Warm Synths', weight: 1.5 },
        { text: 'Gentle Piano', weight: 1.2 },
        { text: 'Nature Sounds', weight: 0.8 }
      ],
      'Focus': [
        { text: 'Deep Ambient', weight: 1.0 },
        { text: 'Steady Rhythms', weight: 1.5 },
        { text: 'Subtle Electronics', weight: 1.2 },
        { text: 'Atmospheric Pads', weight: 0.8 }
      ]
    };

    let prompts = moodPrompts[mood] || moodPrompts['Meditate'];

    // Add instrument-specific prompts
    if (selectedInstruments && selectedInstruments.length > 0) {
      const instrumentPrompts = selectedInstruments.map(inst => ({
        text: inst.name || inst.id,
        weight: 1.0
      }));
      prompts = [...prompts, ...instrumentPrompts];
    }

    return prompts;
  }

  // Create configuration from breathing pattern
  createConfigFromBreathing(breathingPattern) {
    if (!breathingPattern) {
      return {
        bpm: 80,
        density: 0.5,
        brightness: 0.4,
        guidance: 4.0,
        temperature: 1.1
      };
    }

    const totalTime = breathingPattern.inhale + breathingPattern.hold1 + 
                     breathingPattern.exhale + breathingPattern.hold2;
    
    // Calculate BPM based on breathing cycle
    const bpm = Math.round(60 / (totalTime / 4));
    const clampedBpm = Math.max(60, Math.min(200, bpm));
    
    // Adjust density and brightness based on breathing speed
    const density = totalTime > 16 ? 0.3 : totalTime < 8 ? 0.7 : 0.5;
    const brightness = totalTime > 16 ? 0.3 : totalTime < 8 ? 0.6 : 0.4;

    return {
      bpm: clampedBpm,
      density: density,
      brightness: brightness,
      guidance: 4.0,
      temperature: 1.1,
      mute_bass: false,
      mute_drums: false,
      only_bass_and_drums: false
    };
  }

  // Set callbacks
  setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  // Get current state
  getState() {
    return {
      isConnected: this.isConnected,
      isPlaying: this.isPlaying,
      hasSession: !!this.session
    };
  }

  // Cleanup
  async cleanup() {
    try {
      if (this.session) {
        await this.stop();
      }
      this.stopMockAudioGeneration();
      this.session = null;
      this.isConnected = false;
      this.isPlaying = false;
      console.log('✅ Lyria RealTime Service cleaned up');
    } catch (error) {
      console.error('Error cleaning up Lyria service:', error);
    }
  }
}

export default LyriaRealTimeService;
