import { GoogleGenerativeAI } from '@google/generative-ai';
import { Audio } from 'expo-av';
import { db } from '../supabase';

class AIMusicGenerator {
  constructor() {
    this.client = null;
    this.currentSession = null;
    this.isGenerating = false;
    this.sessionCount = 0;
    this.userId = null;
    this.mood = null;
    this.breathingPattern = null;
  }

  // Initialize the AI client
  async initialize(apiKey) {
    try {
      this.client = new GoogleGenerativeAI(apiKey);
      console.log('AI Music Generator initialized');
    } catch (error) {
      console.error('Failed to initialize AI Music Generator:', error);
      throw error;
    }
  }

  // Set user context for tracking
  setUserContext(userId, mood, breathingPattern) {
    this.userId = userId;
    this.mood = mood;
    this.breathingPattern = breathingPattern;
  }

  // Generate music based on mood and breathing pattern
  async generateMusic() {
    if (!this.client) {
      throw new Error('AI Music Generator not initialized');
    }

    if (this.isGenerating) {
      console.log('Music generation already in progress');
      return;
    }

    try {
      this.isGenerating = true;
      this.sessionCount++;

      // Get music prompt based on mood and breathing pattern
      const prompt = this.generateMusicPrompt();
      
      // Check if we should use cached music (after 10 sessions)
      if (this.sessionCount >= 10) {
        const cachedMusic = await this.getCachedMusic();
        if (cachedMusic) {
          console.log('Using cached AI-generated music');
          return cachedMusic;
        }
      }

      // Generate new music using Lyria RealTime API
      const musicData = await this.generateRealTimeMusic(prompt);
      
      // Store the generated music if this is the 10th session
      if (this.sessionCount === 10) {
        await this.storeGeneratedMusic(musicData, prompt);
      }

      return musicData;

    } catch (error) {
      console.error('Error generating AI music:', error);
      // Fallback to local music
      return this.getFallbackMusic();
    } finally {
      this.isGenerating = false;
    }
  }

  // Generate music prompt based on mood and breathing pattern
  generateMusicPrompt() {
    const moodPrompts = {
      'Anxious': 'Calming ambient music with soft pads, gentle strings, and minimal percussion. Slow tempo to reduce anxiety.',
      'Distracted': 'Focus music with steady rhythm, subtle electronic elements, and consistent beat to improve concentration.',
      'Sleepy': 'Sleep-inducing ambient music with deep bass, soft melodies, and nature sounds. Very slow tempo.',
      'Stressed': 'Relaxing music with warm tones, gentle piano, and soft strings to reduce stress and tension.',
      'Calm': 'Peaceful ambient music with flowing melodies, soft synthesizers, and gentle atmospheric sounds.',
      'Focused': 'Concentration music with steady rhythm, minimal distractions, and consistent tempo for deep focus.'
    };

    const breathingPrompts = {
      'slow': 'Very slow tempo (60-70 BPM) with long, sustained notes',
      'medium': 'Moderate tempo (80-90 BPM) with balanced rhythm',
      'fast': 'Faster tempo (100-120 BPM) with more energetic rhythm'
    };

    const basePrompt = moodPrompts[this.mood] || moodPrompts['Calm'];
    const breathingPrompt = this.getBreathingSpeed();
    const breathingStyle = breathingPrompts[breathingPrompt] || breathingPrompts['medium'];

    return `${basePrompt} ${breathingStyle}. Generate 5 minutes of continuous music.`;
  }

  // Determine breathing speed based on pattern
  getBreathingSpeed() {
    if (!this.breathingPattern) return 'medium';
    
    const totalTime = this.breathingPattern.inhale + this.breathingPattern.hold1 + 
                     this.breathingPattern.exhale + this.breathingPattern.hold2;
    
    if (totalTime <= 8) return 'fast';
    if (totalTime <= 12) return 'medium';
    return 'slow';
  }

  // Generate real-time music using Lyria API
  async generateRealTimeMusic(prompt) {
    try {
      // Note: This is a simplified version. In a real implementation,
      // you would use the Lyria RealTime API as shown in your example
      
      // For now, we'll simulate the music generation
      // In production, you would implement the actual Lyria API call
      
      const musicConfig = {
        prompt: prompt,
        duration: 300, // 5 minutes
        bpm: this.getBPMFromBreathing(),
        mood: this.mood,
        breathingPattern: this.breathingPattern
      };

      // Simulate music generation
      const generatedMusic = await this.simulateMusicGeneration(musicConfig);
      
      return generatedMusic;

    } catch (error) {
      console.error('Error in real-time music generation:', error);
      throw error;
    }
  }

  // Simulate music generation (replace with actual Lyria API)
  async simulateMusicGeneration(config) {
    return new Promise((resolve) => {
      // This is a placeholder - in production, you would:
      // 1. Connect to Lyria RealTime API
      // 2. Set up audio streaming
      // 3. Generate actual music based on the prompt
      
      setTimeout(() => {
        resolve({
          id: `ai_${Date.now()}`,
          name: `AI Generated - ${config.mood}`,
          category: 'AI Generated',
          duration: '5:00',
          prompt: config.prompt,
          bpm: config.bpm,
          generated_at: new Date().toISOString(),
          is_ai_generated: true,
          user_id: this.userId,
          mood: config.mood,
          breathing_pattern: config.breathingPattern
        });
      }, 2000); // Simulate generation time
    });
  }

  // Get BPM based on breathing pattern
  getBPMFromBreathing() {
    if (!this.breathingPattern) return 80;
    
    const totalTime = this.breathingPattern.inhale + this.breathingPattern.hold1 + 
                     this.breathingPattern.exhale + this.breathingPattern.hold2;
    
    // Convert breathing cycle time to BPM
    const bpm = Math.round(60 / (totalTime / 4)); // 4 beats per cycle
    return Math.max(60, Math.min(120, bpm)); // Clamp between 60-120 BPM
  }

  // Get cached AI-generated music
  async getCachedMusic() {
    try {
      if (!this.userId) return null;
      
      const { data, error } = await db.supabase
        .from('ai_generated_music')
        .select('*')
        .eq('user_id', this.userId)
        .eq('mood', this.mood)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        console.log('No cached music found:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching cached music:', error);
      return null;
    }
  }

  // Store generated music in Supabase
  async storeGeneratedMusic(musicData, prompt) {
    try {
      if (!this.userId) return;

      const musicRecord = {
        user_id: this.userId,
        mood: this.mood,
        breathing_pattern: this.breathingPattern,
        prompt: prompt,
        bpm: musicData.bpm,
        duration: musicData.duration,
        generated_at: new Date().toISOString(),
        is_ai_generated: true,
        // In production, you would also store the actual audio file
        audio_url: `ai_generated_${this.userId}_${Date.now()}.wav`
      };

      const { error } = await db.supabase
        .from('ai_generated_music')
        .insert([musicRecord]);

      if (error) {
        console.error('Error storing generated music:', error);
      } else {
        console.log('AI-generated music stored successfully');
      }

    } catch (error) {
      console.error('Error storing generated music:', error);
    }
  }

  // Get fallback music when AI generation fails
  getFallbackMusic() {
    const fallbackMusic = {
      id: 'fallback_ai',
      name: `Fallback - ${this.mood}`,
      category: 'Fallback',
      duration: '5:00',
      is_ai_generated: false,
      fallback: true
    };

    return fallbackMusic;
  }

  // Reset session count
  resetSessionCount() {
    this.sessionCount = 0;
  }

  // Get current session count
  getSessionCount() {
    return this.sessionCount;
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
