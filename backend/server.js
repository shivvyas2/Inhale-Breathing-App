const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');
const musicRoutes = require('./routes/musicRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Inhale Music API Documentation'
}));

// Audio Player Demo Page
app.get('/audio-player', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'public/audio-player.html'));
});

// Routes
app.use('/api/music', musicRoutes);

// Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check
 *     description: Check if the API server is running and healthy
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "Server is running"
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Update user streak endpoint
app.post('/api/users/:userId/streak', async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionDuration, mood, breathingPattern } = req.body;

    console.log(`Updating streak for user: ${userId}`);
    console.log('Session data:', { sessionDuration, mood, breathingPattern });

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    if (!sessionDuration || sessionDuration <= 0) {
      return res.status(400).json({ error: 'Valid session duration is required' });
    }

    // Get current user data
    const { data: userData, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError) {
      console.error('Error fetching user:', fetchError);
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate new streak
    const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const lastSessionDate = userData.last_session_date ? 
      new Date(userData.last_session_date).toISOString().split('T')[0] : null;
    
    let newStreak = userData.streak || 0;
    let newTotalMinutes = (userData.total_minutes || 0) + Math.round(sessionDuration / 60);

    // Check if this is a new day
    if (lastSessionDate !== currentDate) {
      // Check if it's consecutive (yesterday)
      if (lastSessionDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        if (lastSessionDate === yesterdayStr) {
          // Consecutive day - increment streak
          newStreak += 1;
        } else {
          // Not consecutive - reset streak to 1
          newStreak = 1;
        }
      } else {
        // First session ever
        newStreak = 1;
      }
    }
    // If same day, keep current streak (don't increment)

    // Insert session record using RPC function
    const { data: sessionId, error: sessionError } = await supabase
      .rpc('insert_session', {
        p_user_id: userId,
        p_session_duration: Math.round(sessionDuration),
        p_mood: mood,
        p_breathing_pattern: breathingPattern
      });

    if (sessionError) {
      console.error('Error inserting session:', sessionError);
      // Continue with user update even if session insert fails
    } else {
      console.log('✅ Session recorded with ID:', sessionId);
    }

    // Update user data
    const updateData = {
      streak: newStreak,
      total_minutes: newTotalMinutes,
      last_session_date: currentDate,
      current_mood: mood || userData.current_mood,
      breathing_pattern: breathingPattern ? JSON.stringify(breathingPattern) : userData.breathing_pattern,
      updated_at: new Date().toISOString()
    };

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating user streak:', updateError);
      return res.status(500).json({ error: 'Failed to update streak' });
    }

    console.log(`✅ Streak updated successfully: ${newStreak} days, ${newTotalMinutes} total minutes`);

    res.json({
      success: true,
      data: {
        userId: updatedUser.id,
        streak: updatedUser.streak,
        totalMinutes: updatedUser.total_minutes,
        lastSessionDate: updatedUser.last_session_date,
        message: `Streak updated to ${newStreak} days!`
      }
    });

  } catch (error) {
    console.error('Error in streak update endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user data endpoint
app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error in get user endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📈 Streak API: http://localhost:${PORT}/api/users/:userId/streak`);
  console.log(`🎵 Music API: http://localhost:${PORT}/api/music/generate`);
  console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  console.log(`🎧 Audio Player: http://localhost:${PORT}/audio-player`);
});

module.exports = app;
