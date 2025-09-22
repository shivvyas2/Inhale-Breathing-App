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
  
  // Mood to Music Prompt Mapping - Endel-style adaptive music
  MOOD_PROMPTS: {
    'Anxiety Relief': {
      base: 'Create a deeply calming ambient soundscape with soft, warm pads, gentle string swells, and subtle nature sounds',
      tempo: 'Slow tempo (60-70 BPM) with grounding frequencies around 40-60 Hz',
      elements: ['soft warm pads', 'gentle string swells', 'nature sounds', 'rain or ocean waves', 'deep resonant frequencies'],
      description: 'Music that feels like a warm embrace, helping to slow down racing thoughts and reduce anxiety'
    },
    'Meditate': {
      base: 'Generate a minimalist meditation track with sustained tones, Tibetan singing bowls, and subtle harmonic drones',
      tempo: 'Very slow tempo (50-60 BPM) with frequencies that promote deep focus',
      elements: ['sustained tones', 'Tibetan singing bowls', 'harmonic drones', 'gentle chimes', 'soft bells', 'breath-like textures'],
      description: 'Music that supports deep breathing and mindfulness practice with spacious arrangements'
    },
    'Wind Down': {
      base: 'Create a peaceful bedtime ambient track with warm, soft synthesizers, gentle piano, and cozy textures',
      tempo: 'Slow tempo (50-65 BPM) with lower frequencies to signal relaxation',
      elements: ['warm synthesizers', 'gentle piano', 'cozy textures', 'crickets', 'gentle wind', 'soft rain'],
      description: 'Music that feels like a lullaby for adults, promoting sleep and rest'
    },
    'Focus': {
      base: 'Generate a concentration-enhancing ambient track with steady, unobtrusive rhythms and subtle electronic elements',
      tempo: 'Moderate tempo (70-80 BPM) with binaural beats around 40 Hz for focus',
      elements: ['steady rhythms', 'subtle electronics', 'soft arpeggios', 'gentle percussion', 'atmospheric pads'],
      description: 'Music that supports deep work without being distracting, like Endel focus mode'
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
  // Map old mood names to new ones for backward compatibility
  const moodMapping = {
    'Anxious': 'Anxiety Relief',
    'Anxiety Relief': 'Anxiety Relief',
    'Meditate': 'Meditate',
    'Wind Down': 'Wind Down',
    'Focus': 'Focus',
    'Calm': 'Anxiety Relief', // Default to Anxiety Relief
    'Focused': 'Focus',
    'Sleepy': 'Wind Down',
    'Stressed': 'Anxiety Relief'
  };
  
  const mappedMood = moodMapping[mood] || 'Anxiety Relief';
  const moodConfig = AI_MUSIC_CONFIG.MOOD_PROMPTS[mappedMood] || AI_MUSIC_CONFIG.MOOD_PROMPTS['Anxiety Relief'];
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
