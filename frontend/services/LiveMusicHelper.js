import { GoogleGenAI } from '@google/genai';
import { decode, decodeAudioData } from '../utils/audioUtils';

export class LiveMusicHelper {
  constructor(apiKey, model = 'lyria-realtime-exp') {
    this.ai = new GoogleGenAI({ apiKey, apiVersion: 'v1alpha' });
    this.model = model;
    this.session = null;
    this.sessionPromise = null;
    this.connectionError = true;
    this.filteredPrompts = new Set();
    this.nextStartTime = 0;
    this.bufferTime = 2;
    this.playbackState = 'stopped';
    this.prompts = new Map();
    this.audioContext = null;
    this.outputNode = null;
    this.extraDestination = null;
    this.listeners = new Map();
  }

  // Initialize audio context (must be called after user interaction)
  initializeAudioContext() {
    if (!this.audioContext) {
      // For React Native, we'll use a different approach
      // This is a simplified version - in production you'd use expo-av
      console.log('🎵 Initializing audio context for Lyria API');
    }
  }

  // Get or create session
  async getSession() {
    if (!this.sessionPromise) {
      this.sessionPromise = this.connect();
    }
    return this.sessionPromise;
  }

  // Connect to Lyria API
  async connect() {
    console.log('🎵 Connecting to Lyria RealTime API...');
    
    try {
      this.sessionPromise = this.ai.live.music.connect({
        model: this.model,
        callbacks: {
          onmessage: async (e) => {
            console.log('🎵 Lyria message received:', e);
            
            if (e.setupComplete) {
              this.connectionError = false;
              console.log('✅ Lyria connection established');
            }
            
            if (e.filteredPrompt) {
              this.filteredPrompts.add(e.filteredPrompt.text);
              this.dispatchEvent('filtered-prompt', e.filteredPrompt);
            }
            
            if (e.serverContent?.audioChunks) {
              console.log('🎵 Processing audio chunks from Lyria...');
              await this.processAudioChunks(e.serverContent.audioChunks);
            }
          },
          onerror: (error) => {
            console.error('🎵 Lyria connection error:', error);
            this.connectionError = true;
            this.stop();
            this.dispatchEvent('error', 'Connection error, please restart audio.');
          },
          onclose: () => {
            console.log('🎵 Lyria connection closed');
            this.connectionError = true;
            this.stop();
            this.dispatchEvent('error', 'Connection error, please restart audio.');
          },
        },
      });
      
      return this.sessionPromise;
    } catch (error) {
      console.error('🎵 Failed to connect to Lyria:', error);
      throw error;
    }
  }

  // Process audio chunks from Lyria
  async processAudioChunks(audioChunks) {
    if (this.playbackState === 'paused' || this.playbackState === 'stopped') {
      return;
    }

    console.log('🎵 Processing audio chunks:', audioChunks.length);
    
    try {
      // Decode audio data
      const audioData = decode(audioChunks[0].data);
      
      // For React Native, we'll convert this to a format that expo-av can use
      // This is a simplified approach - in production you'd handle this properly
      const audioBuffer = await this.createAudioBuffer(audioData);
      
      // Dispatch the audio data for playback
      this.dispatchEvent('audio-generated', {
        audioData: audioBuffer,
        duration: audioChunks[0].duration || 2.0,
        sampleRate: 48000,
        channels: 2
      });
      
    } catch (error) {
      console.error('🎵 Error processing audio chunks:', error);
      this.dispatchEvent('error', 'Failed to process audio chunks');
    }
  }

  // Create audio buffer for React Native
  async createAudioBuffer(audioData) {
    // Convert the audio data to a format that can be played
    // This is a simplified version - in production you'd use proper audio processing
    const base64Audio = btoa(String.fromCharCode(...audioData.slice(0, 1000)));
    return {
      uri: `data:audio/wav;base64,${base64Audio}`,
      duration: 2.0,
      sampleRate: 48000
    };
  }

  // Get active prompts
  get activePrompts() {
    return Array.from(this.prompts.values())
      .filter((p) => {
        return !this.filteredPrompts.has(p.text) && p.weight !== 0;
      });
  }

  // Set weighted prompts
  async setWeightedPrompts(prompts) {
    this.prompts = prompts;

    if (this.activePrompts.length === 0) {
      this.dispatchEvent('error', 'There needs to be one active prompt to play.');
      this.pause();
      return;
    }

    if (!this.session) {
      console.log('🎵 Session not ready, storing prompts for later');
      return;
    }

    try {
      console.log('🎵 Setting weighted prompts:', this.activePrompts);
      await this.session.setWeightedPrompts({
        weightedPrompts: this.activePrompts,
      });
    } catch (e) {
      console.error('🎵 Error setting prompts:', e);
      this.dispatchEvent('error', e.message);
      this.pause();
    }
  }

  // Play music
  async play() {
    console.log('🎵 Starting Lyria music generation...');
    this.setPlaybackState('loading');
    
    try {
      this.session = await this.getSession();
      await this.setWeightedPrompts(this.prompts);
      
      if (this.audioContext) {
        this.audioContext.resume();
      }
      
      this.session.play();
      this.setPlaybackState('playing');
      
      console.log('✅ Lyria music generation started');
    } catch (error) {
      console.error('🎵 Error starting music:', error);
      this.dispatchEvent('error', 'Failed to start music generation');
    }
  }

  // Pause music
  pause() {
    console.log('🎵 Pausing Lyria music...');
    if (this.session) {
      this.session.pause();
    }
    this.setPlaybackState('paused');
  }

  // Stop music
  stop() {
    console.log('🎵 Stopping Lyria music...');
    if (this.session) {
      this.session.stop();
    }
    this.setPlaybackState('stopped');
    this.session = null;
    this.sessionPromise = null;
  }

  // Play/pause toggle
  async playPause() {
    switch (this.playbackState) {
      case 'playing':
        return this.pause();
      case 'paused':
      case 'stopped':
        return this.play();
      case 'loading':
        return this.stop();
    }
  }

  // Set playback state
  setPlaybackState(state) {
    this.playbackState = state;
    this.dispatchEvent('playback-state-changed', state);
  }

  // Event system
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  removeEventListener(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  dispatchEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`🎵 Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}
