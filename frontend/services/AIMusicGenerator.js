import { GoogleGenerativeAI } from '@google/generative-ai';
import { AmbientAudioEngine } from './AmbientAudioEngine';
import LyriaAudioEngine from './LyriaAudioEngine';
import { generateMusicParams } from './geminiService';
import { GEMINI_API_KEY } from '../supabase';
import { generateMusicPrompt, getAudioConfig } from '../config/aiMusicConfig';
import { generateInstrumentPrompt } from '../config/instrumentPrompts';

class AIMusicGenerator {
  constructor() {
    this.client = null;
    this.ambientEngine = null;
    this.currentSession = null;
    this.isGenerating = false;
    this.mood = null;
    this.breathingPattern = null;
    this.selectedInstruments = [];
    this.isInitialized = false;
  }

  // Initialize the AI client
  async initialize(apiKey = null) {
    try {
      const key = apiKey || GEMINI_API_KEY;
      
      // Initialize Gemini for text generation
      this.client = new GoogleGenerativeAI(key);
      
      // Initialize engine based on platform: Lyria (web) or Ambient (native)
      const isWeb = typeof window !== 'undefined' && typeof document !== 'undefined';
      if (isWeb) {
        // Use Lyria RealTime for actual AI music generation on web
        this.ambientEngine = new LyriaAudioEngine();
      } else {
        // Use Ambient Audio Engine for React Native
        this.ambientEngine = new AmbientAudioEngine();
      }
      
      this.isInitialized = true;
      console.log('AI Music Generator initialized with Gemini API and', this.ambientEngine?.constructor?.name);
    } catch (error) {
      console.error('Failed to initialize AI Music Generator:', error);
      throw error;
    }
  }

  // Set user context for music generation
  setUserContext(mood, breathingPattern, selectedInstruments = []) {
    this.mood = mood;
    this.breathingPattern = breathingPattern;
    this.selectedInstruments = selectedInstruments;
  }

  // Set selected instruments
  setInstruments(instruments) {
    this.selectedInstruments = instruments;
  }

  // Generate music based on mood and breathing pattern
  async generateMusic() {
    console.log('🎵 generateMusic called, isGenerating:', this.isGenerating, 'client:', !!this.client);
    
    if (!this.client) {
      console.error('AI Music Generator not initialized');
      throw new Error('AI Music Generator not initialized');
    }

    if (this.isGenerating) {
      console.log('Music generation already in progress, returning fallback');
      // Return fallback music instead of null
      return this.getFallbackMusic();
    }

    try {
      this.isGenerating = true;
      console.log('🎵 Starting music generation...');

      // Get music prompt based on mood and breathing pattern
      const prompt = this.generateMusicPrompt();
      console.log('🎵 Generated prompt:', prompt);

      // Generate new music using Ambient Audio Engine
      const music = await this.generateRealTimeMusic(prompt);
      console.log('🎵 Generated music:', music ? 'Success' : 'Failed');
      
      if (!music) {
        console.log('Real-time generation failed, using fallback');
        return this.getFallbackMusic();
      }
      
      return music;

    } catch (error) {
      console.error('Error generating AI music:', error);
      // Fallback to local music
      return this.getFallbackMusic();
    } finally {
      this.isGenerating = false;
    }
  }

  // Generate music prompt based on mood, breathing pattern, and selected instruments
  generateMusicPrompt() {
    // Use instrument-based prompt if instruments are selected
    if (this.selectedInstruments && this.selectedInstruments.length > 0) {
      console.log('🎵 Using instrument-based prompt with:', this.selectedInstruments);
      return generateInstrumentPrompt(this.selectedInstruments, this.mood, this.breathingPattern);
    }
    
    // Fallback to mood-based prompt
    console.log('🎵 Using mood-based prompt');
    return generateMusicPrompt(this.mood, this.breathingPattern);
  }

  // Determine breathing speed based on pattern
  getBreathingSpeed() {
    if (!this.breathingPattern) {
      return 'medium';
    }
    
    const totalTime = this.breathingPattern.inhale + this.breathingPattern.hold1 + 
                     this.breathingPattern.exhale + this.breathingPattern.hold2;
    
    if (totalTime <= 8) {
      return 'fast';
    }
    if (totalTime <= 12) {
      return 'medium';
    }
    return 'slow';
  }

  // Generate real-time music using AI parameters and appropriate engine
  async generateRealTimeMusic(prompt) {
    try {
      console.log('🎵 Starting real-time AI music generation...');
      
      if (!this.ambientEngine) {
        throw new Error('Audio Engine not initialized');
      }

      // Prepare parameters for the audio engine
      const musicParams = {
        mood: this.mood,
        instruments: this.selectedInstruments,
        breathingPattern: this.breathingPattern,
        prompt: prompt
      };
      
      // Setup the audio engine with parameters
      await this.ambientEngine.setup(musicParams);
      
      // Return a music object with AI-generated parameters
      const generatedMusic = {
        id: `ai_${Date.now()}`,
        name: `AI Generated - ${this.mood}`,
        category: 'AI Generated',
        duration: '∞', // Real-time generation
        prompt: prompt,
        bpm: this.getBPMFromBreathing(),
        generated_at: new Date().toISOString(),
        is_ai_generated: true,
        mood: this.mood,
        breathing_pattern: this.breathingPattern,
        tempo: this.getBPMFromBreathing(),
        key: this.getRandomKey(),
        style: this.getMoodStyle(this.mood),
        instruments: this.getMoodInstruments(this.mood),
        audio_variation: this.getAudioVariation(this.mood),
        intensity: this.getIntensity(this.mood),
        frequency_range: this.getFrequencyRange(this.mood),
        unique_id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        is_real_ai_generated: true,
        is_lyria_generated: this.ambientEngine.constructor.name === 'LyriaAudioEngine',
        is_ambient_generated: this.ambientEngine.constructor.name !== 'LyriaAudioEngine',
        music_params: musicParams,
        ambient_engine: this.ambientEngine
      };
      
      console.log('✅ AI music generation started with', this.ambientEngine.constructor.name);
      console.log('🎵 Music Parameters:', musicParams);
      return generatedMusic;

    } catch (error) {
      console.error('Error in real-time music generation:', error);
      throw error;
    }
  }

  // Map mood to breathing type for AI parameter generation
  mapMoodToBreathingType(mood) {
    const moodMapping = {
      'Anxious': 'Anxiety Relief',
      'Anxiety Relief': 'Anxiety Relief',
      'Meditate': 'Meditate',
      'Wind Down': 'Wind Down',
      'Focus': 'Focus'
    };
    return moodMapping[mood] || 'Meditate';
  }

  // Play the ambient music
  async playMusic() {
    if (!this.ambientEngine) {
      throw new Error('Ambient engine not initialized');
    }
    
    try {
      await this.ambientEngine.play();
      console.log('✅ Ambient music started playing');
    } catch (error) {
      console.error('Error playing ambient music:', error);
      throw error;
    }
  }

  // Stop the ambient music
  async stopMusic() {
    if (!this.ambientEngine) {
      return;
    }
    
    try {
      await this.ambientEngine.stop();
      console.log('✅ Ambient music stopped');
    } catch (error) {
      console.error('Error stopping ambient music:', error);
    }
  }

  // Get playing state
  getPlayingState() {
    if (!this.ambientEngine) {
      return { isPlaying: false, isInitialized: false };
    }
    
    return this.ambientEngine.getPlayingState();
  }

  // Cleanup ambient engine
  async cleanup() {
    if (this.ambientEngine) {
      await this.ambientEngine.cleanup();
      this.ambientEngine = null;
    }
  }

  // Generate audio using Gemini API
  async generateAudioWithGemini(prompt, audioConfig) {
    try {
      console.log('🎵 Generating audio with Gemini API...');
      
      // Create a detailed audio generation prompt
      const audioPrompt = `
        Generate a 5-minute ambient music track with the following specifications:
        
        Mood: ${this.mood}
        Prompt: ${prompt}
        BPM: ${audioConfig.bpm}
        Key: ${this.getRandomKey()}
        Style: ${this.getMoodStyle(this.mood)}
        Instruments: ${this.getMoodInstruments(this.mood).join(', ')}
        Frequency Range: ${this.getFrequencyRange(this.mood)}
        Intensity: ${this.getIntensity(this.mood)}
        
        Create a base64 encoded audio file (WAV format, 44.1kHz, 16-bit) that represents this music.
        The audio should be a continuous 5-minute track that loops seamlessly.
        
        Return only the base64 encoded audio data.
      `;

      const model = this.client.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(audioPrompt);
      const response = await result.response;
      const generatedText = response.text();
      
      // Extract base64 audio data
      const audioData = this.extractAudioFromResponse(generatedText);
      
      console.log('✅ Audio generated successfully with Gemini API');
      return audioData;
      
    } catch (error) {
      console.error('Error generating audio with Gemini:', error);
      // Fallback to synthetic audio generation
      return this.generateSyntheticAudio(prompt, audioConfig);
    }
  }

  // Extract audio data from Gemini response
  extractAudioFromResponse(response) {
    try {
      // Look for base64 audio data in the response
      const base64Match = response.match(/data:audio\/wav;base64,([A-Za-z0-9+/=]+)/);
      if (base64Match) {
        return base64Match[1];
      }
      
      // If no base64 found, generate synthetic audio
      console.log('No base64 audio found in response, generating synthetic audio');
      return this.generateSyntheticAudioData();
      
    } catch (error) {
      console.error('Error extracting audio from response:', error);
      return this.generateSyntheticAudioData();
    }
  }

  // Generate synthetic audio data as fallback
  generateSyntheticAudioData() {
    // Create a simple synthetic audio pattern
    const sampleRate = 44100;
    const duration = 5 * 60; // 5 minutes
    const samples = sampleRate * duration;
    
    // Generate a simple sine wave pattern based on mood
    const frequency = this.getMoodFrequency();
    const audioData = [];
    
    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * time) * 0.1; // Low volume
      audioData.push(sample);
    }
    
    // Convert to base64 (simplified)
    return btoa(String.fromCharCode(...audioData.slice(0, 1000))); // Truncated for demo
  }

  // Get mood-specific frequency
  getMoodFrequency() {
    const frequencies = {
      'Anxious': 60, // Low, calming
      'Anxiety Relief': 80, // Slightly higher, soothing
      'Meditate': 40, // Very low, meditative
      'Wind Down': 50, // Low, relaxing
      'Focus': 100 // Higher, concentration
    };
    return frequencies[this.mood] || 80;
  }

  // Create music object from generated audio
  async createMusicFromGeneratedAudio(config) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const generatedMusic = {
          id: `ai_${Date.now()}`,
          name: `AI Generated - ${config.mood}`,
          category: 'AI Generated',
          duration: '5:00',
          prompt: config.prompt,
          bpm: config.bpm,
          generated_at: new Date().toISOString(),
          is_ai_generated: true,
          mood: config.mood,
          breathing_pattern: config.breathingPattern,
          // AI-generated properties
          tempo: config.bpm,
          key: this.getRandomKey(),
          style: this.getMoodStyle(config.mood),
          instruments: this.getMoodInstruments(config.mood),
          audio_variation: this.getAudioVariation(config.mood),
          intensity: this.getIntensity(config.mood),
          frequency_range: this.getFrequencyRange(config.mood),
          unique_id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          // Generated audio data
          audio_data: config.generated_audio,
          is_real_ai_generated: true
        };
        
        console.log('✅ Real AI music created with generated audio');
        resolve(generatedMusic);
      }, 1000);
    });
  }

  // Simulate music generation (replace with actual Lyria API)
  async simulateMusicGeneration(config) {
    return new Promise((resolve) => {
      // This simulates real-time AI music generation
      // In production, you would:
      // 1. Connect to Lyria RealTime API
      // 2. Set up audio streaming
      // 3. Generate actual music based on the prompt
      
      console.log('🎵 Generating AI music with prompt:', config.prompt);
      console.log('🎵 Mood:', config.mood, 'BPM:', config.bpm);
      
      // Simulate generation time based on complexity
      const generationTime = Math.random() * 3000 + 1000; // 1-4 seconds
      
      setTimeout(() => {
        const generatedMusic = {
          id: `ai_${Date.now()}`,
          name: `AI Generated - ${config.mood}`,
          category: 'AI Generated',
          duration: '5:00',
          prompt: config.prompt,
          bpm: config.bpm,
          generated_at: new Date().toISOString(),
          is_ai_generated: true,
          mood: config.mood,
          breathing_pattern: config.breathingPattern,
          // Add more realistic properties
          tempo: config.bpm,
          key: this.getRandomKey(),
          style: this.getMoodStyle(config.mood),
          instruments: this.getMoodInstruments(config.mood),
          // Add unique AI-generated properties
          audio_variation: this.getAudioVariation(config.mood),
          intensity: this.getIntensity(config.mood),
          frequency_range: this.getFrequencyRange(config.mood),
          unique_id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        console.log('✅ AI music generated successfully:', generatedMusic.name);
        console.log('🎵 Unique AI Properties:', {
          variation: generatedMusic.audio_variation,
          intensity: generatedMusic.intensity,
          frequency_range: generatedMusic.frequency_range,
          unique_id: generatedMusic.unique_id
        });
        resolve(generatedMusic);
      }, generationTime);
    });
  }

  // Get audio variation based on mood
  getAudioVariation(mood) {
    const variations = {
      'Anxious': 'deep_ambient',
      'Anxiety Relief': 'soft_pads',
      'Meditate': 'minimalist',
      'Wind Down': 'chill_wave',
      'Focus': 'concentration_beat'
    };
    return variations[mood] || 'ambient';
  }

  // Get intensity level
  getIntensity(mood) {
    const intensities = {
      'Anxious': 'low',
      'Anxiety Relief': 'very_low',
      'Meditate': 'minimal',
      'Wind Down': 'low',
      'Focus': 'medium'
    };
    return intensities[mood] || 'medium';
  }

  // Get frequency range
  getFrequencyRange(mood) {
    const ranges = {
      'Anxious': '40-200 Hz',
      'Anxiety Relief': '60-300 Hz',
      'Meditate': '80-400 Hz',
      'Wind Down': '50-250 Hz',
      'Focus': '100-500 Hz'
    };
    return ranges[mood] || '80-400 Hz';
  }

  // Get random musical key
  getRandomKey() {
    const keys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
    const modes = ['major', 'minor'];
    return `${keys[Math.floor(Math.random() * keys.length)]} ${modes[Math.floor(Math.random() * modes.length)]}`;
  }

  // Get mood-specific musical style
  getMoodStyle(mood) {
    const styles = {
      'Anxious': 'Ambient Drone',
      'Anxiety Relief': 'Soft Ambient',
      'Meditate': 'Minimalist',
      'Wind Down': 'Chill Ambient',
      'Focus': 'Deep Ambient'
    };
    return styles[mood] || 'Ambient';
  }

  // Get mood-specific instruments
  getMoodInstruments(mood) {
    const instruments = {
      'Anxious': ['Soft Pads', 'Gentle Strings', 'Nature Sounds'],
      'Anxiety Relief': ['Warm Pads', 'String Swells', 'Ocean Waves'],
      'Meditate': ['Singing Bowls', 'Harmonic Drones', 'Soft Bells'],
      'Wind Down': ['Warm Synths', 'Gentle Piano', 'Crickets'],
      'Focus': ['Steady Rhythms', 'Subtle Electronics', 'Atmospheric Pads']
    };
    return instruments[mood] || ['Ambient Pads'];
  }

  // Get BPM based on breathing pattern
  getBPMFromBreathing() {
    if (!this.breathingPattern) {
      return 80;
    }
    
    const totalTime = this.breathingPattern.inhale + this.breathingPattern.hold1 + 
                     this.breathingPattern.exhale + this.breathingPattern.hold2;
    
    // Convert breathing cycle time to BPM
    const bpm = Math.round(60 / (totalTime / 4)); // 4 beats per cycle
    return Math.max(60, Math.min(120, bpm)); // Clamp between 60-120 BPM
  }


  // Get fallback music when AI generation fails
  getFallbackMusic() {
    return {
      id: 'fallback_ai',
      name: `Fallback - ${this.mood || 'Unknown'}`,
      category: 'Fallback',
      duration: '5:00',
      is_ai_generated: false,
      fallback: true,
      // Add basic properties for consistency
      bpm: this.getBPMFromBreathing(),
      key: this.getRandomKey(),
      style: this.getMoodStyle(this.mood),
      instruments: this.getMoodInstruments(this.mood),
      audio_variation: this.getAudioVariation(this.mood),
      intensity: this.getIntensity(this.mood),
      frequency_range: this.getFrequencyRange(this.mood),
      unique_id: `fallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }


  // Stop current generation
  stopGeneration() {
    this.isGenerating = false;
    if (this.currentSession) {
      // In production, you would close the Lyria session
      this.currentSession = null;
    }
  }
}

export default new AIMusicGenerator();
