const express = require('express');
const router = express.Router();
const LyriaRealTimeService = require('../services/lyriaService');
const { v4: uuidv4 } = require('uuid');

/**
 * @swagger
 * components:
 *   schemas:
 *     MusicGenerationRequest:
 *       type: object
 *       required:
 *         - mood
 *       properties:
 *         mood:
 *           type: string
 *           enum: [Anxiety Relief, Meditate, Wind Down, Focus]
 *           description: Mood for music generation
 *           example: Anxiety Relief
 *         bpm:
 *           type: integer
 *           minimum: 60
 *           maximum: 200
 *           description: Beats per minute
 *           example: 80
 *         instruments:
 *           type: array
 *           items:
 *             type: string
 *           description: List of instruments to include
 *           example: [Soft Pads, Ocean Waves]
 *         breathingPattern:
 *           type: object
 *           properties:
 *             inhale:
 *               type: integer
 *               example: 4
 *             hold1:
 *               type: integer
 *               example: 4
 *             exhale:
 *               type: integer
 *               example: 6
 *             hold2:
 *               type: integer
 *               example: 2
 *           description: Breathing pattern for BPM calculation
 *         duration:
 *           type: integer
 *           minimum: 10
 *           maximum: 300
 *           description: Duration in seconds
 *           example: 30
 */

// Initialize Lyria service
const lyriaService = new LyriaRealTimeService();

// Initialize the service with API key
lyriaService.initialize(process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY);

/**
 * @swagger
 * /api/music/generate:
 *   post:
 *     summary: Generate AI music using Lyria RealTime
 *     description: Create a new music generation session with specified mood, BPM, and instruments
 *     tags: [Music Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MusicGenerationRequest'
 *           examples:
 *             anxiety_relief:
 *               summary: Anxiety Relief Music
 *               value:
 *                 mood: "Anxiety Relief"
 *                 bpm: 80
 *                 instruments: ["Soft Pads", "Ocean Waves"]
 *                 breathingPattern:
 *                   inhale: 4
 *                   hold1: 4
 *                   exhale: 6
 *                   hold2: 2
 *                 duration: 30
 *             meditate:
 *               summary: Meditation Music
 *               value:
 *                 mood: "Meditate"
 *                 bpm: 60
 *                 instruments: ["Singing Bowls", "Soft Bells"]
 *                 duration: 60
 *     responses:
 *       200:
 *         description: Music generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 sessionId:
 *                   type: string
 *                   format: uuid
 *                   example: "ec82517c-0f72-43ea-82bb-fb5c618b7a33"
 *                 music:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "ec82517c-0f72-43ea-82bb-fb5c618b7a33"
 *                     name:
 *                       type: string
 *                       example: "AI Generated - Anxiety Relief"
 *                     mood:
 *                       type: string
 *                       example: "Anxiety Relief"
 *                     bpm:
 *                       type: integer
 *                       example: 80
 *                     instruments:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Soft Pads", "Ocean Waves"]
 *                     duration:
 *                       type: integer
 *                       example: 30
 *                     generated_at:
 *                       type: string
 *                       format: date-time
 *                     is_lyria_generated:
 *                       type: boolean
 *                       example: true
 *                     prompts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *                             example: "Ambient"
 *                           weight:
 *                             type: number
 *                             example: 1.0
 *                     config:
 *                       type: object
 *                       properties:
 *                         bpm:
 *                           type: integer
 *                           example: 80
 *                         density:
 *                           type: number
 *                           example: 0.5
 *                         brightness:
 *                           type: number
 *                           example: 0.4
 *                         guidance:
 *                           type: number
 *                           example: 4.0
 *                         temperature:
 *                           type: number
 *                           example: 1.1
 *                     audio_file:
 *                       type: object
 *                       properties:
 *                         filename:
 *                           type: string
 *                           example: "lyria_uuid_1234567890.wav"
 *                         duration:
 *                           type: integer
 *                           example: 30
 *                         sampleRate:
 *                           type: integer
 *                           example: 48000
 *                         size:
 *                           type: integer
 *                           example: 5760044
 *       400:
 *         description: Bad request - missing or invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Missing required parameter: mood"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to generate music"
 *                 details:
 *                   type: string
 *                   example: "Lyria service unavailable"
 */
router.post('/generate', async (req, res) => {
  try {
    const { mood, bpm, instruments, breathingPattern, duration = 30 } = req.body;

    // Validate required parameters
    if (!mood) {
      return res.status(400).json({ 
        error: 'Missing required parameter: mood' 
      });
    }

    // Create session ID
    const sessionId = uuidv4();

    // Prepare parameters
    const params = {
      mood,
      bpm: parseInt(bpm) || 80,
      instruments: instruments || [],
      breathingPattern: breathingPattern || null,
      duration: parseInt(duration) || 30
    };

    console.log('🎵 Generating music with parameters:', params);

    // Create Lyria session
    const session = await lyriaService.createSession(sessionId, params);

    // Generate audio file
    const audioFile = await lyriaService.generateAudioFile(sessionId, duration);

    res.status(200).json({
      success: true,
      sessionId: sessionId,
      music: {
        id: sessionId,
        name: `AI Generated - ${mood}`,
        mood: mood,
        bpm: params.bpm,
        instruments: instruments,
        duration: duration,
        generated_at: new Date().toISOString(),
        is_lyria_generated: true,
        prompts: session.prompts,
        config: session.config,
        audio_file: {
          filename: audioFile.filename,
          duration: audioFile.duration,
          sampleRate: audioFile.sampleRate,
          size: audioFile.size
        }
      }
    });

  } catch (error) {
    console.error('Error generating music:', error);
    res.status(500).json({ 
      error: 'Failed to generate music',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/music/session/{sessionId}:
 *   get:
 *     summary: Get session status
 *     description: Retrieve the current status and details of a music generation session
 *     tags: [Session Management]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Unique session identifier
 *         example: "ec82517c-0f72-43ea-82bb-fb5c618b7a33"
 *     responses:
 *       200:
 *         description: Session status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 session:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "ec82517c-0f72-43ea-82bb-fb5c618b7a33"
 *                     status:
 *                       type: string
 *                       enum: [initializing, connected, stopped, error]
 *                       example: "connected"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     audioChunksCount:
 *                       type: integer
 *                       example: 150
 *                     params:
 *                       $ref: '#/components/schemas/MusicGenerationRequest'
 *                     prompts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           text:
 *                             type: string
 *                           weight:
 *                             type: number
 *                     config:
 *                       type: object
 *                       properties:
 *                         bpm:
 *                           type: integer
 *                         density:
 *                           type: number
 *                         brightness:
 *                           type: number
 *                         guidance:
 *                           type: number
 *                         temperature:
 *                           type: number
 *       404:
 *         description: Session not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Session not found"
 *       500:
 *         description: Internal server error
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const status = lyriaService.getSessionStatus(sessionId);

    if (status.error) {
      return res.status(404).json(status);
    }

    res.status(200).json({
      success: true,
      session: status
    });

  } catch (error) {
    console.error('Error getting session status:', error);
    res.status(500).json({ 
      error: 'Failed to get session status',
      details: error.message 
    });
  }
});

// GET /api/music/session/:sessionId/chunks - Get audio chunks
router.get('/session/:sessionId/chunks', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 10 } = req.query;
    
    const chunks = lyriaService.getAudioChunks(sessionId, parseInt(limit));

    if (chunks.error) {
      return res.status(404).json(chunks);
    }

    res.status(200).json({
      success: true,
      chunks: chunks.chunks,
      total: chunks.total
    });

  } catch (error) {
    console.error('Error getting audio chunks:', error);
    res.status(500).json({ 
      error: 'Failed to get audio chunks',
      details: error.message 
    });
  }
});

// PUT /api/music/session/:sessionId - Update session parameters
router.put('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const updates = req.body;

    const session = await lyriaService.updateSession(sessionId, updates);

    res.status(200).json({
      success: true,
      session: {
        id: session.id,
        status: session.status,
        params: session.params,
        prompts: session.prompts,
        config: session.config
      }
    });

  } catch (error) {
    console.error('Error updating session:', error);
    res.status(500).json({ 
      error: 'Failed to update session',
      details: error.message 
    });
  }
});

// POST /api/music/session/:sessionId/stop - Stop session
router.post('/session/:sessionId/stop', async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await lyriaService.stopSession(sessionId);

    res.status(200).json({
      success: true,
      session: {
        id: session.id,
        status: session.status
      }
    });

  } catch (error) {
    console.error('Error stopping session:', error);
    res.status(500).json({ 
      error: 'Failed to stop session',
      details: error.message 
    });
  }
});

// DELETE /api/music/session/:sessionId - Clean up session
router.delete('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    await lyriaService.cleanupSession(sessionId);

    res.status(200).json({
      success: true,
      message: 'Session cleaned up successfully'
    });

  } catch (error) {
    console.error('Error cleaning up session:', error);
    res.status(500).json({ 
      error: 'Failed to clean up session',
      details: error.message 
    });
  }
});

// GET /api/music/sessions - Get all active sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = lyriaService.getAllSessions();

    res.status(200).json({
      success: true,
      sessions: sessions,
      count: sessions.length
    });

  } catch (error) {
    console.error('Error getting sessions:', error);
    res.status(500).json({ 
      error: 'Failed to get sessions',
      details: error.message 
    });
  }
});

/**
 * @swagger
 * /api/music/audio/{filename}:
 *   get:
 *     summary: Download or stream audio file
 *     description: Download the generated audio file or stream it for playback in Swagger UI
 *     tags: [Audio Streaming]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: Audio filename to download
 *         example: "lyria_uuid_1234567890.wav"
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [wav, mp3, stream, demo]
 *           default: wav
 *         description: Audio format preference
 *       - in: query
 *         name: play
 *         required: false
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Stream for immediate playback (returns JSON with audio URL)
 *     responses:
 *       200:
 *         description: Audio file served successfully
 *         content:
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *           audio/mpeg:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 audioUrl:
 *                   type: string
 *                   example: "http://localhost:3000/api/music/audio/lyria_uuid_1234567890.wav"
 *                 filename:
 *                   type: string
 *                   example: "lyria_uuid_1234567890.wav"
 *                 duration:
 *                   type: integer
 *                   example: 30
 *                 size:
 *                   type: integer
 *                   example: 5760044
 *                 format:
 *                   type: string
 *                   example: "wav"
 *                 playable:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Audio file not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Audio file not found"
 *       500:
 *         description: Internal server error
 */
router.get('/audio/:filename', (req, res) => {
  try {
    const { filename } = req.params;
    const { format = 'wav', play = false } = req.query;
    const filepath = require('path').join(__dirname, '../storage/audio', filename);

    // Check if file exists
    if (!require('fs').existsSync(filepath)) {
      // If file doesn't exist, create a demo audio file for Swagger testing
      if (format === 'demo' || play === 'true') {
        return createDemoAudio(res, filename, format);
      }
      return res.status(404).json({ error: 'Audio file not found' });
    }

    // If play=true, return JSON with audio URL for streaming
    if (play === 'true' || format === 'stream') {
      const audioUrl = `http://localhost:${process.env.PORT || 3000}/api/music/audio/${filename}?format=${format}`;
      return res.json({
        success: true,
        audioUrl: audioUrl,
        filename: filename,
        duration: 30,
        size: 5760044,
        format: format,
        playable: true,
        message: 'Audio ready for streaming - click the audioUrl to play'
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Type', 'audio/wav');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Send file
    res.sendFile(filepath);

  } catch (error) {
    console.error('Error serving audio file:', error);
    res.status(500).json({ 
      error: 'Failed to serve audio file',
      details: error.message 
    });
  }
});

// Helper function to create demo audio for Swagger testing
function createDemoAudio(res, filename, format) {
  try {
    // Create a simple WAV header for demo (2 seconds of generated tone)
    const sampleRate = 48000;
    const duration = 2; // 2 seconds for demo
    const numSamples = sampleRate * duration;
    const dataSize = numSamples * 4; // 4 bytes per sample (2 channels * 2 bytes)
    const bufferSize = 44 + dataSize; // WAV header + audio data
    
    const buffer = Buffer.alloc(bufferSize);
    
    // WAV header
    buffer.write('RIFF', 0);
    buffer.writeUInt32LE(bufferSize - 8, 4);
    buffer.write('WAVE', 8);
    buffer.write('fmt ', 12);
    buffer.writeUInt32LE(16, 16); // PCM format
    buffer.writeUInt16LE(1, 20);  // PCM
    buffer.writeUInt16LE(2, 22);  // Stereo
    buffer.writeUInt32LE(sampleRate, 24);
    buffer.writeUInt32LE(sampleRate * 2 * 2, 28); // Byte rate
    buffer.writeUInt16LE(4, 32);  // Block align
    buffer.writeUInt16LE(16, 34); // Bits per sample
    buffer.write('data', 36);
    buffer.writeUInt32LE(dataSize, 40);
    
    // Generate a simple tone (440Hz A note) instead of silence
    const frequency = 440; // A4 note
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.3;
      const sampleValue = Math.floor(sample * 32767);
      
      // Write stereo samples (left and right channel)
      const offset = 44 + (i * 4); // 4 bytes per sample (2 bytes per channel)
      if (offset + 3 < bufferSize) {
        buffer.writeInt16LE(sampleValue, offset);     // Left channel
        buffer.writeInt16LE(sampleValue, offset + 2); // Right channel
      }
    }
    
    if (format === 'stream') {
      res.json({
        success: true,
        audioUrl: `http://localhost:${process.env.PORT || 3000}/api/music/audio/${filename}?format=demo`,
        filename: filename,
        duration: duration,
        size: bufferSize,
        format: 'wav',
        playable: true,
        message: 'Demo audio generated - click audioUrl to play'
      });
    } else {
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to create demo audio', details: error.message });
  }
}

/**
 * @swagger
 * /api/music/test-audio:
 *   get:
 *     summary: Test audio generation and playback
 *     description: Generate a test audio file and return it for immediate playback in Swagger UI
 *     tags: [Audio Streaming]
 *     parameters:
 *       - in: query
 *         name: mood
 *         required: false
 *         schema:
 *           type: string
 *           enum: [Anxiety Relief, Meditate, Wind Down, Focus]
 *           default: Anxiety Relief
 *         description: Mood for test audio generation
 *       - in: query
 *         name: duration
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *           default: 3
 *         description: Duration in seconds (max 10 for demo)
 *       - in: query
 *         name: format
 *         required: false
 *         schema:
 *           type: string
 *           enum: [wav, stream]
 *           default: stream
 *         description: Return format - wav for download, stream for JSON with URL
 *     responses:
 *       200:
 *         description: Test audio generated successfully
 *         content:
 *           audio/wav:
 *             schema:
 *               type: string
 *               format: binary
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 audioUrl:
 *                   type: string
 *                   example: "http://localhost:3000/api/music/audio/test_anxiety_relief.wav"
 *                 filename:
 *                   type: string
 *                   example: "test_anxiety_relief.wav"
 *                 mood:
 *                   type: string
 *                   example: "Anxiety Relief"
 *                 duration:
 *                   type: integer
 *                   example: 3
 *                 size:
 *                   type: integer
 *                   example: 288000
 *                 format:
 *                   type: string
 *                   example: "wav"
 *                 playable:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Test audio generated - click audioUrl to play in browser"
 *       500:
 *         description: Internal server error
 */
router.get('/test-audio', (req, res) => {
  try {
    const { mood = 'Anxiety Relief', duration = 3, format = 'stream' } = req.query;
    const filename = `test_${mood.toLowerCase().replace(' ', '_')}.wav`;
    
    // Generate test audio based on mood
    const testAudio = generateTestAudio(mood, parseInt(duration));
    
    if (format === 'stream') {
      res.json({
        success: true,
        audioUrl: `http://localhost:${process.env.PORT || 3000}/api/music/audio/${filename}?format=demo`,
        filename: filename,
        mood: mood,
        duration: parseInt(duration),
        size: testAudio.length,
        format: 'wav',
        playable: true,
        message: `Test ${mood} audio generated - click audioUrl to play in browser`
      });
    } else {
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(testAudio);
    }
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to generate test audio', 
      details: error.message 
    });
  }
});

// Helper function to generate test audio based on mood with prompts
function generateTestAudio(mood, duration) {
  const sampleRate = 48000;
  const numSamples = sampleRate * duration;
  const dataSize = numSamples * 4; // 4 bytes per sample (2 channels * 2 bytes)
  const bufferSize = 44 + dataSize; // WAV header + audio data
  
  const buffer = Buffer.alloc(bufferSize);
  
  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(bufferSize - 8, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16); // PCM format
  buffer.writeUInt16LE(1, 20);  // PCM
  buffer.writeUInt16LE(2, 22);  // Stereo
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2 * 2, 28); // Byte rate
  buffer.writeUInt16LE(4, 32);  // Block align
  buffer.writeUInt16LE(16, 34); // Bits per sample
  buffer.write('data', 36);
  buffer.writeUInt32LE(dataSize, 40);
  
  // Generate complex audio based on mood prompts
  for (let i = 0; i < numSamples; i++) {
    const time = i / sampleRate;
    let leftSample = 0;
    let rightSample = 0;
    
    switch (mood) {
      case 'Anxiety Relief':
        // Calming pad with soft reverb
        leftSample = generateAnxietyReliefSample(time, sampleRate);
        rightSample = generateAnxietyReliefSample(time, sampleRate) * 0.8;
        break;
      case 'Meditate':
        // Singing bowl with harmonics
        leftSample = generateMeditationSample(time, sampleRate);
        rightSample = generateMeditationSample(time, sampleRate) * 0.9;
        break;
      case 'Wind Down':
        // Deep drone with ocean waves
        leftSample = generateWindDownSample(time, sampleRate);
        rightSample = generateWindDownSample(time, sampleRate) * 0.7;
        break;
      case 'Focus':
        // Clear tones with subtle rhythm
        leftSample = generateFocusSample(time, sampleRate);
        rightSample = generateFocusSample(time, sampleRate) * 0.85;
        break;
      default:
        leftSample = Math.sin(2 * Math.PI * 440 * time) * 0.1;
        rightSample = Math.sin(2 * Math.PI * 440 * time) * 0.1;
    }
    
    // Apply gentle fade in/out
    const fadeIn = Math.min(1, time * 2);
    const fadeOut = Math.min(1, (duration - time) * 2);
    const fade = fadeIn * fadeOut;
    
    leftSample *= fade;
    rightSample *= fade;
    
    // Convert to 16-bit PCM
    const leftValue = Math.floor(Math.max(-1, Math.min(1, leftSample)) * 32767);
    const rightValue = Math.floor(Math.max(-1, Math.min(1, rightSample)) * 32767);
    
    // Write stereo samples
    const offset = 44 + (i * 4);
    if (offset + 3 < bufferSize) {
      buffer.writeInt16LE(leftValue, offset);
      buffer.writeInt16LE(rightValue, offset + 2);
    }
  }
  
  return buffer;
}

// Generate anxiety relief audio - Calming spa music with gentle chimes and soft pads
function generateAnxietyReliefSample(time, sampleRate) {
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
function generateMeditationSample(time, sampleRate) {
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
function generateWindDownSample(time, sampleRate) {
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
function generateFocusSample(time, sampleRate) {
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

// POST /api/music/prompts - Get suggested prompts for mood
router.post('/prompts', (req, res) => {
  try {
    const { mood, instruments = [] } = req.body;

    if (!mood) {
      return res.status(400).json({ 
        error: 'Missing required parameter: mood' 
      });
    }

    // Create a temporary session to get prompts
    const tempSession = { params: { mood, instruments } };
    const prompts = lyriaService.createPromptsFromParams(tempSession.params);

    res.status(200).json({
      success: true,
      mood: mood,
      instruments: instruments,
      prompts: prompts
    });

  } catch (error) {
    console.error('Error getting prompts:', error);
    res.status(500).json({ 
      error: 'Failed to get prompts',
      details: error.message 
    });
  }
});

module.exports = router;
