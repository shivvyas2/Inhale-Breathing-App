const { GoogleGenerativeAI } = require('@google/generative-ai');
const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class LyriaRealTimeService {
  constructor() {
    this.client = null;
    this.sessions = new Map(); // Store active sessions
    this.audioStorage = path.join(__dirname, '../storage/audio');
    this.ensureAudioStorage();
  }

  // Initialize the Lyria service
  async initialize(apiKey) {
    try {
      this.client = new GoogleGenerativeAI(apiKey);
      console.log('🎵 Lyria RealTime Service initialized');
    } catch (error) {
      console.error('Failed to initialize Lyria RealTime Service:', error);
      throw error;
    }
  }

  // Ensure audio storage directory exists
  ensureAudioStorage() {
    if (!fs.existsSync(this.audioStorage)) {
      fs.mkdirSync(this.audioStorage, { recursive: true });
    }
  }

  // Create a new music generation session
  async createSession(sessionId, params) {
    try {
      console.log('🎵 Creating Lyria session:', sessionId);
      
      const session = {
        id: sessionId,
        params: params,
        status: 'initializing',
        createdAt: new Date(),
        audioChunks: [],
        prompts: this.createPromptsFromParams(params),
        config: this.createConfigFromParams(params)
      };

      this.sessions.set(sessionId, session);
      
      // In a real implementation, you would connect to Lyria RealTime WebSocket here
      // For now, we'll simulate the connection
      await this.simulateLyriaConnection(session);
      
      return session;
    } catch (error) {
      console.error('Failed to create Lyria session:', error);
      throw error;
    }
  }

  // Create prompts from parameters
  createPromptsFromParams(params) {
    const { mood, instruments = [] } = params;
    
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
    if (instruments && instruments.length > 0) {
      const instrumentPrompts = instruments.map(inst => ({
        text: inst.name || inst.id || inst,
        weight: 1.0
      }));
      prompts = [...prompts, ...instrumentPrompts];
    }

    return prompts;
  }

  // Create configuration from parameters
  createConfigFromParams(params) {
    const { bpm = 80, breathingPattern } = params;
    
    let calculatedBpm = bpm;
    if (breathingPattern) {
      const totalTime = breathingPattern.inhale + breathingPattern.hold1 + 
                       breathingPattern.exhale + breathingPattern.hold2;
      calculatedBpm = Math.round(60 / (totalTime / 4));
    }
    
    const clampedBpm = Math.max(60, Math.min(200, calculatedBpm));
    
    return {
      bpm: clampedBpm,
      density: 0.5,
      brightness: 0.4,
      guidance: 4.0,
      temperature: 1.1,
      mute_bass: false,
      mute_drums: false,
      only_bass_and_drums: false
    };
  }

  // Simulate Lyria connection (replace with actual WebSocket connection)
  async simulateLyriaConnection(session) {
    try {
      console.log('🎵 Simulating Lyria connection for session:', session.id);
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      session.status = 'connected';
      
      // Start generating audio chunks
      this.startAudioGeneration(session);
      
      console.log('✅ Lyria session connected:', session.id);
    } catch (error) {
      console.error('Failed to connect to Lyria:', error);
      session.status = 'error';
      throw error;
    }
  }

  // Start audio generation for a session
  startAudioGeneration(session) {
    const generateChunk = () => {
      if (session.status !== 'connected') return;
      
      // Generate a mock audio chunk (in real implementation, this would be from Lyria)
      const audioChunk = this.generateMockAudioChunk(session);
      session.audioChunks.push(audioChunk);
      
      // Continue generating chunks
      setTimeout(generateChunk, 100); // Generate every 100ms
    };
    
    generateChunk();
  }

  // Generate mock audio chunk (replace with actual Lyria audio processing)
  generateMockAudioChunk(session) {
    const sampleRate = 48000;
    const duration = 0.1; // 100ms
    const samples = Math.floor(sampleRate * duration);
    const audioData = new Float32Array(samples * 2); // Stereo

    // Generate a simple tone based on current mood/prompts
    const frequency = this.getFrequencyFromMood(session.params.mood);
    const time = Date.now() / 1000;
    
    for (let i = 0; i < samples; i++) {
      const sampleTime = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * sampleTime) * 0.1;
      audioData[i * 2] = sample; // Left channel
      audioData[i * 2 + 1] = sample; // Right channel
    }

    return {
      id: uuidv4(),
      timestamp: new Date(),
      data: audioData,
      sampleRate: sampleRate,
      channels: 2
    };
  }

  // Get frequency from mood
  getFrequencyFromMood(mood) {
    const frequencies = {
      'Anxiety Relief': 220, // A3
      'Meditate': 110, // A2
      'Wind Down': 165, // E3
      'Focus': 330 // E4
    };
    return frequencies[mood] || 220;
  }

  // Get session status
  getSessionStatus(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    return {
      id: session.id,
      status: session.status,
      createdAt: session.createdAt,
      audioChunksCount: session.audioChunks.length,
      params: session.params,
      prompts: session.prompts,
      config: session.config
    };
  }

  // Get audio chunks for a session
  getAudioChunks(sessionId, limit = 10) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { error: 'Session not found' };
    }

    return {
      chunks: session.audioChunks.slice(-limit),
      total: session.audioChunks.length
    };
  }

  // Update session parameters
  async updateSession(sessionId, newParams) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    // Update parameters
    session.params = { ...session.params, ...newParams };
    
    // Update prompts if mood or instruments changed
    if (newParams.mood || newParams.instruments) {
      session.prompts = this.createPromptsFromParams(session.params);
    }
    
    // Update config if BPM or breathing pattern changed
    if (newParams.bpm || newParams.breathingPattern) {
      session.config = this.createConfigFromParams(session.params);
    }

    console.log('✅ Session updated:', sessionId);
    return session;
  }

  // Stop a session
  async stopSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    session.status = 'stopped';
    console.log('✅ Session stopped:', sessionId);
    return session;
  }

  // Clean up a session
  async cleanupSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    session.status = 'cleaned';
    this.sessions.delete(sessionId);
    console.log('✅ Session cleaned up:', sessionId);
  }

  // Get all active sessions
  getAllSessions() {
    const sessions = [];
    for (const [id, session] of this.sessions) {
      sessions.push({
        id: session.id,
        status: session.status,
        createdAt: session.createdAt,
        params: session.params
      });
    }
    return sessions;
  }

  // Generate a complete audio file from chunks using spa-style music generation
  async generateAudioFile(sessionId, duration = 30) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    try {
      const sampleRate = 48000;
      const totalSamples = sampleRate * duration;
      const audioData = new Float32Array(totalSamples * 2); // Stereo
      
      // Generate rich spa-style audio based on mood
      for (let i = 0; i < totalSamples; i++) {
        const time = i / sampleRate;
        let leftSample = 0;
        let rightSample = 0;
        
        // Use our enhanced spa-style music generation functions
        switch (session.params.mood) {
          case 'Anxiety Relief':
            leftSample = this.generateAnxietyReliefSample(time, sampleRate);
            rightSample = this.generateAnxietyReliefSample(time, sampleRate) * 0.8;
            break;
          case 'Meditate':
            leftSample = this.generateMeditationSample(time, sampleRate);
            rightSample = this.generateMeditationSample(time, sampleRate) * 0.9;
            break;
          case 'Wind Down':
            leftSample = this.generateWindDownSample(time, sampleRate);
            rightSample = this.generateWindDownSample(time, sampleRate) * 0.7;
            break;
          case 'Focus':
            leftSample = this.generateFocusSample(time, sampleRate);
            rightSample = this.generateFocusSample(time, sampleRate) * 0.85;
            break;
          default:
            leftSample = this.generateAnxietyReliefSample(time, sampleRate);
            rightSample = this.generateAnxietyReliefSample(time, sampleRate) * 0.8;
        }
        
        // Apply gentle fade in/out
        const fadeIn = Math.min(1, time * 2);
        const fadeOut = Math.min(1, (duration - time) * 2);
        const fade = fadeIn * fadeOut;
        
        leftSample *= fade;
        rightSample *= fade;
        
        audioData[i * 2] = leftSample; // Left channel
        audioData[i * 2 + 1] = rightSample; // Right channel
      }

      // Save to file
      const filename = `lyria_${sessionId}_${Date.now()}.wav`;
      const filepath = path.join(this.audioStorage, filename);
      
      // Convert to WAV format and save
      const wavBuffer = this.createWAVBuffer(audioData, sampleRate);
      fs.writeFileSync(filepath, wavBuffer);

      return {
        filename: filename,
        filepath: filepath,
        duration: duration,
        sampleRate: sampleRate,
        size: wavBuffer.length
      };
    } catch (error) {
      console.error('Failed to generate audio file:', error);
      throw error;
    }
  }

  // Create WAV buffer from audio data
  createWAVBuffer(float32Array, sampleRate) {
    const numOfChan = 2; // Stereo
    const bytesPerSample = 2;
    const blockAlign = numOfChan * bytesPerSample;
    const buffer = new Buffer.alloc(44 + float32Array.length * bytesPerSample);

    // RIFF header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(36 + float32Array.length * bytesPerSample, 4);
    buffer.write('WAVE', 8);
    
    // fmt chunk
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // PCM
    buffer.writeUInt16LE(1, 20); // PCM format
    buffer.writeUInt16LE(numOfChan, 22);
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * blockAlign, 28);
    buffer.writeUInt16LE(blockAlign, 32);
    buffer.writeUInt16LE(bytesPerSample * 8, 34);
    
    // data chunk
    buffer.write('data', 36);
    buffer.writeUInt32LE(float32Array.length * bytesPerSample, 40);

    // PCM data
    let offset = 44;
    for (let i = 0; i < float32Array.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      buffer.writeInt16LE(s < 0 ? s * 0x8000 : s * 0x7fff, offset);
    }
    
    return buffer;
  }

  // Generate anxiety relief audio - Calming spa music with gentle chimes and soft pads
  generateAnxietyReliefSample(time, sampleRate) {
    // Prompt: "Produce a calming background music piece suitable for anxiety relief. 
    // Incorporate gentle chimes, soft pads, and flowing melodies to create a serene, 
    // relaxing atmosphere. Genres: Ambient, Relaxation; Vibes: Tranquil, Soothing, 
    // Serene; Instruments: Chimes, Pads, Soft Melodies"
    
    // Gentle chimes (high frequency, soft attack)
    const chime1 = Math.sin(2 * Math.PI * 523.25 * time) * 0.3; // C5
    const chime2 = Math.sin(2 * Math.PI * 659.25 * time) * 0.25; // E5
    const chime3 = Math.sin(2 * Math.PI * 783.99 * time) * 0.2; // G5
    
    // Soft pads (warm, enveloping)
    const pad1 = Math.sin(2 * Math.PI * 110 * time) * 0.4; // A2
    const pad2 = Math.sin(2 * Math.PI * 146.83 * time) * 0.3; // D3
    const pad3 = Math.sin(2 * Math.PI * 174.61 * time) * 0.25; // F3
    
    // Flowing melodies (gentle movement)
    const melody1 = Math.sin(2 * Math.PI * 220 * time) * 0.2; // A3
    const melody2 = Math.sin(2 * Math.PI * 261.63 * time) * 0.15; // C4
    const melody3 = Math.sin(2 * Math.PI * 329.63 * time) * 0.1; // E4
    
    // Gentle LFO for flowing movement
    const lfo1 = Math.sin(2 * Math.PI * 0.1 * time) * 0.1;
    const lfo2 = Math.sin(2 * Math.PI * 0.15 * time) * 0.08;
    
    // Soft reverb and atmosphere
    const reverb = Math.sin(2 * Math.PI * (110 + lfo1 * 15) * time) * 0.12;
    const atmosphere = Math.sin(2 * Math.PI * (220 + lfo2 * 20) * time) * 0.08;
    
    // Gentle fade in/out for chimes
    const chimeFade = Math.sin(2 * Math.PI * 0.5 * time) * 0.5 + 0.5;
    
    // Combine elements
    const chimes = (chime1 + chime2 + chime3) * chimeFade;
    const pads = pad1 + pad2 + pad3;
    const melodies = melody1 + melody2 + melody3;
    const ambient = reverb + atmosphere;
    
    return (chimes + pads + melodies + ambient) * 0.5;
  }

  // Generate meditation audio - Deep meditation spa music with singing bowls and chimes
  generateMeditationSample(time, sampleRate) {
    // Prompt: "Produce a deep meditation background music piece suitable for mindfulness practice. 
    // Incorporate singing bowl chimes, soft pads, and flowing melodies to create a serene, 
    // meditative atmosphere. Genres: Ambient, Meditation; Vibes: Tranquil, Soothing, 
    // Serene; Instruments: Singing Bowls, Chimes, Soft Pads, Flowing Melodies"
    
    // Singing bowl chimes (resonant, bell-like)
    const bowl1 = Math.sin(2 * Math.PI * 220 * time) * 0.4; // A3 - fundamental
    const bowl2 = Math.sin(2 * Math.PI * 440 * time) * 0.3; // A4 - octave
    const bowl3 = Math.sin(2 * Math.PI * 660 * time) * 0.2; // E5 - fifth
    
    // Gentle chimes (high frequency, soft)
    const chime1 = Math.sin(2 * Math.PI * 523.25 * time) * 0.25; // C5
    const chime2 = Math.sin(2 * Math.PI * 659.25 * time) * 0.2; // E5
    const chime3 = Math.sin(2 * Math.PI * 783.99 * time) * 0.15; // G5
    
    // Soft meditation pads (warm, enveloping)
    const pad1 = Math.sin(2 * Math.PI * 82.4 * time) * 0.35; // E2
    const pad2 = Math.sin(2 * Math.PI * 110 * time) * 0.3; // A2
    const pad3 = Math.sin(2 * Math.PI * 146.83 * time) * 0.25; // D3
    
    // Flowing meditation melodies (gentle, contemplative)
    const melody1 = Math.sin(2 * Math.PI * 174.61 * time) * 0.2; // F3
    const melody2 = Math.sin(2 * Math.PI * 196 * time) * 0.15; // G3
    const melody3 = Math.sin(2 * Math.PI * 261.63 * time) * 0.1; // C4
    
    // Very slow LFO for meditative movement
    const lfo1 = Math.sin(2 * Math.PI * 0.05 * time) * 0.15;
    const lfo2 = Math.sin(2 * Math.PI * 0.08 * time) * 0.1;
    
    // Soft reverb and atmosphere
    const reverb = Math.sin(2 * Math.PI * (220 + lfo1 * 20) * time) * 0.12;
    const atmosphere = Math.sin(2 * Math.PI * (440 + lfo2 * 25) * time) * 0.08;
    
    // Gentle fade in/out for chimes and bowls
    const chimeFade = Math.sin(2 * Math.PI * 0.3 * time) * 0.5 + 0.5;
    const bowlFade = Math.sin(2 * Math.PI * 0.2 * time) * 0.5 + 0.5;
    
    // Combine elements
    const bowls = (bowl1 + bowl2 + bowl3) * bowlFade;
    const chimes = (chime1 + chime2 + chime3) * chimeFade;
    const pads = pad1 + pad2 + pad3;
    const melodies = melody1 + melody2 + melody3;
    const ambient = reverb + atmosphere;
    
    return (bowls + chimes + pads + melodies + ambient) * 0.6;
  }

  // Generate wind down audio - Gentle evening spa music with soft chimes and pads
  generateWindDownSample(time, sampleRate) {
    // Prompt: "Produce a gentle wind down background music piece suitable for evening relaxation. 
    // Incorporate soft chimes, warm pads, and flowing melodies to create a serene, 
    // calming atmosphere. Genres: Ambient, Relaxation; Vibes: Tranquil, Soothing, 
    // Serene; Instruments: Soft Chimes, Warm Pads, Flowing Melodies"
    
    // Soft evening chimes (gentle, warm)
    const chime1 = Math.sin(2 * Math.PI * 392 * time) * 0.3; // G4
    const chime2 = Math.sin(2 * Math.PI * 440 * time) * 0.25; // A4
    const chime3 = Math.sin(2 * Math.PI * 523.25 * time) * 0.2; // C5
    const chime4 = Math.sin(2 * Math.PI * 587.33 * time) * 0.15; // D5
    
    // Warm pads (enveloping, cozy)
    const pad1 = Math.sin(2 * Math.PI * 87.3 * time) * 0.4; // F2
    const pad2 = Math.sin(2 * Math.PI * 98 * time) * 0.35; // G2
    const pad3 = Math.sin(2 * Math.PI * 110 * time) * 0.3; // A2
    const pad4 = Math.sin(2 * Math.PI * 123.47 * time) * 0.25; // B2
    
    // Flowing wind down melodies (gentle, descending)
    const melody1 = Math.sin(2 * Math.PI * 174.61 * time) * 0.25; // F3
    const melody2 = Math.sin(2 * Math.PI * 196 * time) * 0.2; // G3
    const melody3 = Math.sin(2 * Math.PI * 220 * time) * 0.15; // A3
    const melody4 = Math.sin(2 * Math.PI * 246.94 * time) * 0.1; // B3
    
    // Gentle LFO for flowing movement
    const lfo1 = Math.sin(2 * Math.PI * 0.08 * time) * 0.12;
    const lfo2 = Math.sin(2 * Math.PI * 0.12 * time) * 0.1;
    
    // Soft reverb and atmosphere
    const reverb = Math.sin(2 * Math.PI * (110 + lfo1 * 18) * time) * 0.15;
    const atmosphere = Math.sin(2 * Math.PI * (220 + lfo2 * 22) * time) * 0.1;
    
    // Gentle fade in/out for chimes
    const chimeFade = Math.sin(2 * Math.PI * 0.4 * time) * 0.5 + 0.5;
    
    // Combine elements
    const chimes = (chime1 + chime2 + chime3 + chime4) * chimeFade;
    const pads = pad1 + pad2 + pad3 + pad4;
    const melodies = melody1 + melody2 + melody3 + melody4;
    const ambient = reverb + atmosphere;
    
    return (chimes + pads + melodies + ambient) * 0.55;
  }

  // Generate focus audio - Concentrated spa music with clear chimes and structured pads
  generateFocusSample(time, sampleRate) {
    // Prompt: "Produce a focused background music piece suitable for concentration and deep work. 
    // Incorporate clear chimes, structured pads, and flowing melodies to create a serene, 
    // focused atmosphere. Genres: Ambient, Focus; Vibes: Tranquil, Soothing, 
    // Serene; Instruments: Clear Chimes, Structured Pads, Flowing Melodies"
    
    // Clear focus chimes (bright, precise)
    const chime1 = Math.sin(2 * Math.PI * 523.25 * time) * 0.35; // C5
    const chime2 = Math.sin(2 * Math.PI * 587.33 * time) * 0.3; // D5
    const chime3 = Math.sin(2 * Math.PI * 659.25 * time) * 0.25; // E5
    const chime4 = Math.sin(2 * Math.PI * 698.46 * time) * 0.2; // F5
    
    // Structured pads (organized, clear)
    const pad1 = Math.sin(2 * Math.PI * 110 * time) * 0.4; // A2
    const pad2 = Math.sin(2 * Math.PI * 146.83 * time) * 0.35; // D3
    const pad3 = Math.sin(2 * Math.PI * 174.61 * time) * 0.3; // F3
    const pad4 = Math.sin(2 * Math.PI * 196 * time) * 0.25; // G3
    
    // Flowing focus melodies (structured, purposeful)
    const melody1 = Math.sin(2 * Math.PI * 220 * time) * 0.25; // A3
    const melody2 = Math.sin(2 * Math.PI * 261.63 * time) * 0.2; // C4
    const melody3 = Math.sin(2 * Math.PI * 293.66 * time) * 0.15; // D4
    const melody4 = Math.sin(2 * Math.PI * 329.63 * time) * 0.1; // E4
    
    // Moderate LFO for focused movement
    const lfo1 = Math.sin(2 * Math.PI * 0.12 * time) * 0.1;
    const lfo2 = Math.sin(2 * Math.PI * 0.18 * time) * 0.08;
    
    // Clear reverb and atmosphere
    const reverb = Math.sin(2 * Math.PI * (220 + lfo1 * 15) * time) * 0.12;
    const atmosphere = Math.sin(2 * Math.PI * (440 + lfo2 * 20) * time) * 0.08;
    
    // Subtle rhythm for focus (gentle pulse)
    const rhythm = Math.sin(2 * Math.PI * 0.6 * time) * 0.05;
    const rhythm2 = Math.sin(2 * Math.PI * 0.9 * time) * 0.03;
    
    // Gentle fade in/out for chimes
    const chimeFade = Math.sin(2 * Math.PI * 0.6 * time) * 0.5 + 0.5;
    
    // Combine elements
    const chimes = (chime1 + chime2 + chime3 + chime4) * chimeFade;
    const pads = pad1 + pad2 + pad3 + pad4;
    const melodies = melody1 + melody2 + melody3 + melody4;
    const ambient = reverb + atmosphere;
    const rhythmElements = rhythm + rhythm2;
    
    return (chimes + pads + melodies + ambient + rhythmElements) * 0.5;
  }
}

module.exports = LyriaRealTimeService;
