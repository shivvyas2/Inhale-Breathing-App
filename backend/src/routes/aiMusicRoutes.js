const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');
const Joi = require('joi');

// Validation schemas
const musicGenerationSchema = Joi.object({
  user_id: Joi.string().required(),
  mood: Joi.string().required(),
  breathing_pattern: Joi.object({
    inhale: Joi.number().required(),
    hold1: Joi.number().required(),
    exhale: Joi.number().required(),
    hold2: Joi.number().required()
  }).required(),
  prompt: Joi.string().optional(),
  bpm: Joi.number().integer().min(60).max(200).optional()
});

const musicPreferenceSchema = Joi.object({
  user_id: Joi.string().required(),
  preferred_mood: Joi.string().optional(),
  preferred_bpm_min: Joi.number().integer().min(60).max(200).optional(),
  preferred_bpm_max: Joi.number().integer().min(60).max(200).optional(),
  preferred_duration: Joi.number().integer().min(60).max(1800).optional(),
  ai_generation_enabled: Joi.boolean().optional()
});

// Get AI generated music for a user
router.get('/:userId/music', async (req, res) => {
  try {
    const { userId } = req.params;
    const { mood, limit = 10 } = req.query;

    let query = supabase
      .from('ai_generated_music')
      .select('*')
      .eq('user_id', userId)
      .order('generated_at', { ascending: false })
      .limit(parseInt(limit));

    if (mood) {
      query = query.eq('mood', mood);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      message: 'AI generated music retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching AI generated music:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Store AI generated music
router.post('/music', async (req, res) => {
  try {
    const { error: validationError, value } = musicGenerationSchema.validate(req.body);
    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError.details[0].message
      });
    }

    const musicData = {
      ...value,
      generated_at: new Date().toISOString(),
      is_ai_generated: true
    };

    const { data, error } = await supabase
      .from('ai_generated_music')
      .insert([musicData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'AI generated music stored successfully'
    });
  } catch (error) {
    console.error('Error storing AI generated music:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get user music preferences
router.get('/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('user_music_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({
      success: true,
      data: data || null,
      message: 'User music preferences retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching user music preferences:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update user music preferences
router.put('/:userId/preferences', async (req, res) => {
  try {
    const { userId } = req.params;
    const { error: validationError, value } = musicPreferenceSchema.validate({
      ...req.body,
      user_id: userId
    });

    if (validationError) {
      return res.status(400).json({
        success: false,
        error: validationError.details[0].message
      });
    }

    const { data, error } = await supabase
      .from('user_music_preferences')
      .upsert([value])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      data,
      message: 'User music preferences updated successfully'
    });
  } catch (error) {
    console.error('Error updating user music preferences:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Log music generation session
router.post('/sessions', async (req, res) => {
  try {
    const sessionData = {
      ...req.body,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('music_generation_sessions')
      .insert([sessionData])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      data,
      message: 'Music generation session logged successfully'
    });
  } catch (error) {
    console.error('Error logging music generation session:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get music generation statistics
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('music_generation_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const stats = {
      totalSessions: data?.length || 0,
      successfulSessions: data?.filter(s => s.success).length || 0,
      averageGenerationTime: data?.reduce((acc, s) => acc + (s.generation_time_ms || 0), 0) / (data?.length || 1),
      mostUsedMood: data?.reduce((acc, s) => {
        acc[s.mood] = (acc[s.mood] || 0) + 1;
        return acc;
      }, {}),
      lastGeneration: data?.[0]?.created_at
    };

    res.json({
      success: true,
      data: stats,
      message: 'Music generation statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching music generation stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Generate music prompt based on mood and breathing pattern
router.post('/generate-prompt', async (req, res) => {
  try {
    const { mood, breathing_pattern } = req.body;

    if (!mood || !breathing_pattern) {
      return res.status(400).json({
        success: false,
        error: 'Mood and breathing pattern are required'
      });
    }

    const prompt = generateMusicPrompt(mood, breathing_pattern);
    const bpm = calculateBPM(breathing_pattern);

    res.json({
      success: true,
      data: {
        prompt,
        bpm,
        mood,
        breathing_pattern
      },
      message: 'Music prompt generated successfully'
    });
  } catch (error) {
    console.error('Error generating music prompt:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to generate music prompt
function generateMusicPrompt(mood, breathingPattern) {
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

  const basePrompt = moodPrompts[mood] || moodPrompts['Calm'];
  const breathingSpeed = getBreathingSpeed(breathingPattern);
  const breathingStyle = breathingPrompts[breathingSpeed] || breathingPrompts['medium'];

  return `${basePrompt} ${breathingStyle}. Generate 5 minutes of continuous music.`;
}

// Helper function to calculate BPM from breathing pattern
function calculateBPM(breathingPattern) {
  const totalTime = breathingPattern.inhale + breathingPattern.hold1 + 
                   breathingPattern.exhale + breathingPattern.hold2;
  
  // Convert breathing cycle time to BPM
  const bpm = Math.round(60 / (totalTime / 4)); // 4 beats per cycle
  return Math.max(60, Math.min(120, bpm)); // Clamp between 60-120 BPM
}

// Helper function to determine breathing speed
function getBreathingSpeed(breathingPattern) {
  const totalTime = breathingPattern.inhale + breathingPattern.hold1 + 
                   breathingPattern.exhale + breathingPattern.hold2;
  
  if (totalTime <= 8) return 'fast';
  if (totalTime <= 12) return 'medium';
  return 'slow';
}

module.exports = router;
