// AI Music Generation Configuration
export const AI_MUSIC_CONFIG = {
  // Google Gemini API Configuration
  GEMINI_API_KEY: process.env.EXPO_PUBLIC_GEMINI_API_KEY,
  API_VERSION: 'v1alpha',
  MODEL: 'models/lyria-realtime-exp',
  
  // Music Generation Settings
  DEFAULT_DURATION: 300, // 5 minutes in seconds
  DEFAULT_BPM: 80,
  TEMPERATURE: 1.0,
  AUDIO_FORMAT: 'pcm16',
  SAMPLE_RATE: 44100,
  
  // Session Tracking
  CACHE_THRESHOLD: 10, // Generate new music after 10 sessions
  MAX_CACHED_MUSIC: 5, // Maximum cached AI music per user
  
  // Mood to Music Prompt Mapping
  MOOD_PROMPTS: {
    'Anxious': {
      base: 'Calming ambient music with soft pads, gentle strings, and minimal percussion',
      tempo: 'Slow tempo (60-70 BPM) to reduce anxiety',
      elements: ['soft pads', 'gentle strings', 'minimal percussion', 'warm tones']
    },
    'Distracted': {
      base: 'Focus music with steady rhythm, subtle electronic elements, and consistent beat',
      tempo: 'Moderate tempo (80-90 BPM) to improve concentration',
      elements: ['steady rhythm', 'electronic elements', 'consistent beat', 'minimal vocals']
    },
    'Sleepy': {
      base: 'Sleep-inducing ambient music with deep bass, soft melodies, and nature sounds',
      tempo: 'Very slow tempo (50-60 BPM) for relaxation',
      elements: ['deep bass', 'soft melodies', 'nature sounds', 'atmospheric pads']
    },
    'Stressed': {
      base: 'Relaxing music with warm tones, gentle piano, and soft strings',
      tempo: 'Slow tempo (65-75 BPM) to reduce stress',
      elements: ['warm tones', 'gentle piano', 'soft strings', 'breathing space']
    },
    'Calm': {
      base: 'Peaceful ambient music with flowing melodies, soft synthesizers, and gentle atmospheric sounds',
      tempo: 'Moderate tempo (75-85 BPM) for tranquility',
      elements: ['flowing melodies', 'soft synthesizers', 'atmospheric sounds', 'gentle progression']
    },
    'Focused': {
      base: 'Concentration music with steady rhythm, minimal distractions, and consistent tempo',
      tempo: 'Moderate tempo (80-90 BPM) for deep focus',
      elements: ['steady rhythm', 'minimal distractions', 'consistent tempo', 'subtle variations']
    }
  },
  
  // Breathing Pattern to BPM Mapping
  BREATHING_BPM_MAP: {
    'slow': { min: 60, max: 70, description: 'Very slow, meditative' },
    'medium': { min: 75, max: 90, description: 'Moderate, balanced' },
    'fast': { min: 95, max: 120, description: 'Energetic, invigorating' }
  },
  
  // Audio Quality Settings
  AUDIO_QUALITY: {
    channels: 2, // Stereo
    bitDepth: 16, // 16-bit PCM
    sampleRate: 44100, // 44.1 kHz
    compression: 'none' // No compression for real-time generation
  },
  
  // Error Handling
  FALLBACK_MUSIC: {
    enabled: true,
    duration: 300,
    category: 'Fallback',
    message: 'Using fallback music due to AI generation error'
  },
  
  // User Preferences Defaults
  DEFAULT_PREFERENCES: {
    preferred_mood: 'Calm',
    preferred_bpm_min: 60,
    preferred_bpm_max: 120,
    preferred_duration: 300,
    ai_generation_enabled: true
  }
};

// Helper function to get breathing speed category
export const getBreathingSpeed = (breathingPattern) => {
  if (!breathingPattern) return 'medium';
  
  const totalTime = breathingPattern.inhale + breathingPattern.hold1 + 
                   breathingPattern.exhale + breathingPattern.hold2;
  
  if (totalTime <= 8) return 'fast';
  if (totalTime <= 12) return 'medium';
  return 'slow';
};

// Helper function to calculate BPM from breathing pattern
export const calculateBPM = (breathingPattern) => {
  if (!breathingPattern) return AI_MUSIC_CONFIG.DEFAULT_BPM;
  
  const totalTime = breathingPattern.inhale + breathingPattern.hold1 + 
                   breathingPattern.exhale + breathingPattern.hold2;
  
  // Convert breathing cycle time to BPM
  const bpm = Math.round(60 / (totalTime / 4)); // 4 beats per cycle
  return Math.max(60, Math.min(120, bpm)); // Clamp between 60-120 BPM
};

// Helper function to generate music prompt
export const generateMusicPrompt = (mood, breathingPattern) => {
  const moodConfig = AI_MUSIC_CONFIG.MOOD_PROMPTS[mood] || AI_MUSIC_CONFIG.MOOD_PROMPTS['Calm'];
  const breathingSpeed = getBreathingSpeed(breathingPattern);
  const bpmConfig = AI_MUSIC_CONFIG.BREATHING_BPM_MAP[breathingSpeed];
  
  const prompt = `${moodConfig.base}. ${moodConfig.tempo}. ${bpmConfig.description}. Generate 5 minutes of continuous music with ${moodConfig.elements.join(', ')}.`;
  
  return prompt;
};

// Helper function to get audio configuration
export const getAudioConfig = (breathingPattern) => {
  const bpm = calculateBPM(breathingPattern);
  const breathingSpeed = getBreathingSpeed(breathingPattern);
  
  return {
    bpm,
    temperature: AI_MUSIC_CONFIG.TEMPERATURE,
    audioFormat: AI_MUSIC_CONFIG.AUDIO_FORMAT,
    sampleRateHz: AI_MUSIC_CONFIG.SAMPLE_RATE,
    breathingSpeed,
    duration: AI_MUSIC_CONFIG.DEFAULT_DURATION
  };
};

export default AI_MUSIC_CONFIG;
