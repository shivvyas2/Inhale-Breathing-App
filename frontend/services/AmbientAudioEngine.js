import { Audio } from 'expo-av';

export class AmbientAudioEngine {
  constructor() {
    this.audioContext = null;
    this.mainGain = null;
    this.oscillators = [];
    this.noiseSource = null;
    this.isInitialized = false;
    this.isPlaying = false;
    this.params = null;
    this.sound = null;
  }

  // Initialize audio context (React Native specific)
  async initAudioContext() {
    if (!this.audioContext) {
      try {
        // Set up audio mode for expo-av
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('🎵 Audio context initialized for React Native');
      } catch (error) {
        console.error('Error initializing audio context:', error);
        throw error;
      }
    }
  }

  // Setup audio with generated parameters
  async setup(params) {
    await this.initAudioContext();
    this.cleanup(); // Clean up any previous setup
    this.params = params;

    console.log('🎵 Setting up ambient audio with parameters:', params);

    try {
      // Instead of synthetic audio, use mood-based local audio files
      // with AI-generated properties applied
      const audioFile = await this.selectAudioFileForMood(params);
      
      // Create expo-av sound from the selected audio file
      const { sound } = await Audio.Sound.createAsync(
        audioFile,
        {
          shouldPlay: false,
          isLooping: true,
          volume: this.calculateVolume(params),
          rate: this.calculateRate(params)
        }
      );
      
      this.sound = sound;
      this.isInitialized = true;
      
      console.log('✅ Ambient audio engine setup complete');
      
    } catch (error) {
      console.error('Error setting up ambient audio:', error);
      throw error;
    }
  }

  // Select appropriate audio file based on mood and parameters
  async selectAudioFileForMood(params) {
    const mood = params.mood || 'Meditate';
    const instruments = params.instruments || [];
    
    // Map mood to audio file paths
    const moodAudioMap = {
      'Anxiety Relief': require('../assets/audio/joyful.wav'),
      'Meditate': require('../assets/audio/joyful.wav'),
      'Wind Down': require('../assets/audio/journey.wav'),
      'Focus': require('../assets/audio/journey.wav')
    };
    
    // If instruments are specified, choose based on primary instrument
    if (instruments && instruments.length > 0) {
      const primaryInstrument = instruments[0];
      const instrumentAudioMap = {
        'lush_strings': require('../assets/audio/joyful.wav'),
        'ambient_pads': require('../assets/audio/joyful.wav'),
        'soft_piano': require('../assets/audio/joyful.wav'),
        'chillwave': require('../assets/audio/journey.wav'),
        'nature_sounds': require('../assets/audio/joyful.wav'),
        'ethereal_voices': require('../assets/audio/joyful.wav'),
        'warm_bass': require('../assets/audio/joyful.wav'),
        'sparkling_arpeggios': require('../assets/audio/journey.wav')
      };
      
      const selectedFile = instrumentAudioMap[primaryInstrument.id] || moodAudioMap[mood] || require('../assets/audio/joyful.wav');
      return selectedFile;
    }
    
    const selectedFile = moodAudioMap[mood] || require('../assets/audio/joyful.wav');
    return selectedFile;
  }

  // Calculate volume based on AI parameters
  calculateVolume(params) {
    const baseVolume = 0.7;
    const intensity = params.intensity || 0.5;
    const oceanVolume = params.oceanVolume || 0.05;
    
    // Adjust volume based on intensity and ocean volume
    return Math.min(1.0, baseVolume + (intensity * 0.2) + (oceanVolume * 0.1));
  }

  // Calculate playback rate based on AI parameters
  calculateRate(params) {
    const baseRate = 1.0;
    const bpm = params.bpm || 80;
    const breathingSpeed = this.getBreathingSpeed(params);
    
    // Adjust rate based on BPM and breathing speed
    let rate = baseRate;
    
    if (bpm < 60) rate = 0.8; // Slower for low BPM
    else if (bpm > 100) rate = 1.2; // Faster for high BPM
    
    if (breathingSpeed === 'slow') rate *= 0.9;
    else if (breathingSpeed === 'fast') rate *= 1.1;
    
    return Math.max(0.5, Math.min(2.0, rate));
  }

  // Get breathing speed from parameters
  getBreathingSpeed(params) {
    const breathingPattern = params.breathingPattern;
    if (!breathingPattern) return 'medium';
    
    const totalTime = breathingPattern.inhale + breathingPattern.hold1 + 
                     breathingPattern.exhale + breathingPattern.hold2;
    
    if (totalTime <= 8) return 'fast';
    if (totalTime <= 12) return 'medium';
    return 'slow';
  }

  // Create synthetic audio buffer based on AI parameters
  async createSyntheticAudioBuffer(params) {
    console.log('🎵 Creating synthetic audio buffer with params:', params);
    
    // Use a much smaller buffer to avoid stack overflow
    const sampleRate = 44100;
    const duration = 1; // 1 second of audio (will loop)
    const samples = sampleRate * duration;
    
    try {
      // Create a simple audio pattern
      const audioData = new Float32Array(samples);
      
      // Extract simple values from nested objects
      const baseFreq = params.baseFrequency || 80;
      const harmonics = params.droneHarmonics || [1, 1.5, 2];
      const lfoRate = params.lfoRate || 0.1;
      const oceanVol = params.oceanVolume || 0.05;
      const attackTime = Math.min(params.attackTime || 1, 1); // Cap at 1 second
      const releaseTime = Math.min(params.releaseTime || 1, 1); // Cap at 1 second
      
      // Generate a simple drone pattern
      for (let i = 0; i < samples; i++) {
        const time = i / sampleRate;
        let sample = 0;
        
        // Add base frequency
        sample += Math.sin(2 * Math.PI * baseFreq * time) * 0.08;
        
        // Add harmonics (limit to 2 to avoid complexity)
        harmonics.slice(0, 2).forEach((harmonic, index) => {
          const frequency = baseFreq * harmonic;
          const amplitude = 0.04 / (index + 1); // Decreasing amplitude
          sample += Math.sin(2 * Math.PI * frequency * time) * amplitude;
        });
        
        // Add LFO modulation (simplified)
        const lfoValue = Math.sin(2 * Math.PI * lfoRate * time);
        sample *= (1 + lfoValue * 0.05); // Very subtle modulation
        
        // Add ocean noise
        if (oceanVol > 0) {
          const noise = (Math.random() * 2 - 1) * oceanVol;
          sample += noise;
        }
        
        // Apply simple envelope
        let envelope = 1;
        if (time < attackTime) {
          envelope = time / attackTime;
        } else if (time > duration - releaseTime) {
          envelope = (duration - time) / releaseTime;
        }
        
        sample *= envelope * 0.2; // Keep volume very low
        
        // Clamp
        sample = Math.max(-1, Math.min(1, sample));
        audioData[i] = sample;
      }
      
      // Convert to WAV format (simplified)
      const wavBuffer = this.createWAVBuffer(audioData, sampleRate);
      const base64 = btoa(String.fromCharCode(...new Uint8Array(wavBuffer)));
      
      console.log('✅ Synthetic audio buffer created successfully');
      return { uri: `data:audio/wav;base64,${base64}` };
      
    } catch (error) {
      console.error('Error creating synthetic audio buffer:', error);
      // Return a simple fallback
      return this.createSimpleFallbackAudio();
    }
  }

  // Create WAV buffer from Float32Array
  createWAVBuffer(audioData, sampleRate) {
    const { length } = audioData;
    const buffer = new ArrayBuffer(44 + length * 2);
    const view = new DataView(buffer);
    
    // WAV header
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + length * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, length * 2, true);
    
    // Convert float32 to int16
    const audioInt16 = new Int16Array(buffer, 44);
    for (let i = 0; i < length; i++) {
      audioInt16[i] = Math.round(audioData[i] * 32767);
    }
    
    return buffer;
  }

  // Create simple fallback audio
  createSimpleFallbackAudio() {
    console.log('🎵 Creating simple fallback audio');
    
    // Create a very simple 1-second sine wave
    const sampleRate = 44100;
    const duration = 1;
    const samples = sampleRate * duration;
    const audioData = new Float32Array(samples);
    
    for (let i = 0; i < samples; i++) {
      const time = i / sampleRate;
      audioData[i] = Math.sin(2 * Math.PI * 80 * time) * 0.1; // Simple 80Hz tone
    }
    
    const wavBuffer = this.createWAVBuffer(audioData, sampleRate);
    const base64 = btoa(String.fromCharCode(...new Uint8Array(wavBuffer)));
    
    return { uri: `data:audio/wav;base64,${base64}` };
  }

  // Play the ambient audio
  async play() {
    if (!this.isInitialized || this.isPlaying || !this.sound || !this.params) {
      return;
    }
    
    try {
      console.log('🎵 Starting ambient audio playback');
      
      // Fade in
      await this.sound.setVolumeAsync(0.0);
      await this.sound.playAsync();
      
      // Gradual fade in over attack time
      const fadeSteps = 20;
      const stepDuration = (this.params.attackTime * 1000) / fadeSteps;
      
      for (let i = 0; i <= fadeSteps; i++) {
        setTimeout(async () => {
          if (this.sound) {
            const volume = (i / fadeSteps) * 0.3; // Max volume 0.3
            await this.sound.setVolumeAsync(volume);
          }
        }, i * stepDuration);
      }
      
      this.isPlaying = true;
      console.log('✅ Ambient audio playing');
      
    } catch (error) {
      console.error('Error playing ambient audio:', error);
    }
  }

  // Stop the ambient audio
  async stop() {
    if (!this.isInitialized || !this.isPlaying || !this.sound || !this.params) {
      return;
    }
    
    try {
      console.log('🎵 Stopping ambient audio');
      
      // Gradual fade out over release time
      const fadeSteps = 20;
      const stepDuration = (this.params.releaseTime * 1000) / fadeSteps;
      
      for (let i = fadeSteps; i >= 0; i--) {
        setTimeout(async () => {
          if (this.sound) {
            const volume = (i / fadeSteps) * 0.3;
            await this.sound.setVolumeAsync(volume);
            
            if (i === 0) {
              await this.sound.pauseAsync();
            }
          }
        }, (fadeSteps - i) * stepDuration);
      }
      
      this.isPlaying = false;
      console.log('✅ Ambient audio stopped');
      
    } catch (error) {
      console.error('Error stopping ambient audio:', error);
    }
  }

  // Cleanup resources
  async cleanup() {
    try {
      if (this.sound) {
        await this.sound.unloadAsync();
        this.sound = null;
      }
      
      this.oscillators = [];
      this.noiseSource = null;
      this.isInitialized = false;
      this.isPlaying = false;
      
      console.log('✅ Ambient audio engine cleaned up');
      
    } catch (error) {
      console.error('Error cleaning up ambient audio:', error);
    }
  }

  // Get current playing state
  getPlayingState() {
    return {
      isPlaying: this.isPlaying,
      isInitialized: this.isInitialized,
      params: this.params
    };
  }
}
