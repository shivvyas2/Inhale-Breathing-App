# Lyria RealTime Music API

This backend provides a REST API for generating AI music using Lyria RealTime. The API accepts mood, BPM, and instruments parameters to create personalized music for breathing exercises.

## Features

- 🎵 **Real-time Music Generation**: Generate music based on mood and breathing patterns
- 🎛️ **Dynamic Parameters**: Adjust BPM, instruments, and prompts in real-time
- 📊 **Session Management**: Track and manage multiple music generation sessions
- 🎧 **Audio Streaming**: Get audio chunks and complete audio files
- 🔄 **Live Updates**: Update music parameters during generation

## API Endpoints

### 1. Generate Music
**POST** `/api/music/generate`

Generate new music with specified parameters.

**Request Body:**
```json
{
  "mood": "Anxiety Relief",
  "bpm": 80,
  "instruments": ["Soft Pads", "Ocean Waves"],
  "breathingPattern": {
    "inhale": 4,
    "hold1": 4,
    "exhale": 6,
    "hold2": 2
  },
  "duration": 30
}
```

**Response:**
```json
{
  "success": true,
  "sessionId": "uuid-session-id",
  "music": {
    "id": "uuid-session-id",
    "name": "AI Generated - Anxiety Relief",
    "mood": "Anxiety Relief",
    "bpm": 80,
    "instruments": ["Soft Pads", "Ocean Waves"],
    "duration": 30,
    "generated_at": "2024-01-01T00:00:00.000Z",
    "is_lyria_generated": true,
    "prompts": [
      { "text": "Ambient", "weight": 1.0 },
      { "text": "Soft Pads", "weight": 1.5 },
      { "text": "Calming", "weight": 1.2 },
      { "text": "Ocean Waves", "weight": 0.8 }
    ],
    "config": {
      "bpm": 80,
      "density": 0.5,
      "brightness": 0.4,
      "guidance": 4.0,
      "temperature": 1.1
    },
    "audio_file": {
      "filename": "lyria_uuid_1234567890.wav",
      "duration": 30,
      "sampleRate": 48000,
      "size": 5292000
    }
  }
}
```

### 2. Get Session Status
**GET** `/api/music/session/:sessionId`

Get the current status of a music generation session.

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "uuid-session-id",
    "status": "connected",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "audioChunksCount": 150,
    "params": { ... },
    "prompts": [ ... ],
    "config": { ... }
  }
}
```

### 3. Get Audio Chunks
**GET** `/api/music/session/:sessionId/chunks?limit=10`

Get recent audio chunks from a session.

**Query Parameters:**
- `limit` (optional): Number of chunks to return (default: 10)

**Response:**
```json
{
  "success": true,
  "chunks": [
    {
      "id": "chunk-uuid",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "data": "Float32Array data",
      "sampleRate": 48000,
      "channels": 2
    }
  ],
  "total": 150
}
```

### 4. Update Session
**PUT** `/api/music/session/:sessionId`

Update session parameters in real-time.

**Request Body:**
```json
{
  "bpm": 100,
  "instruments": ["Warm Synths", "Gentle Piano"],
  "mood": "Wind Down"
}
```

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "uuid-session-id",
    "status": "connected",
    "params": { ... },
    "prompts": [ ... ],
    "config": { ... }
  }
}
```

### 5. Stop Session
**POST** `/api/music/session/:sessionId/stop`

Stop music generation for a session.

**Response:**
```json
{
  "success": true,
  "session": {
    "id": "uuid-session-id",
    "status": "stopped"
  }
}
```

### 6. Clean Up Session
**DELETE** `/api/music/session/:sessionId`

Clean up a session and free resources.

**Response:**
```json
{
  "success": true,
  "message": "Session cleaned up successfully"
}
```

### 7. Get All Sessions
**GET** `/api/music/sessions`

Get all active sessions.

**Response:**
```json
{
  "success": true,
  "sessions": [
    {
      "id": "uuid-session-id",
      "status": "connected",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "params": { ... }
    }
  ],
  "count": 1
}
```

### 8. Serve Audio File
**GET** `/api/music/audio/:filename`

Download a generated audio file.

**Response:** Binary audio file (WAV format)

### 9. Get Suggested Prompts
**POST** `/api/music/prompts`

Get suggested prompts for a mood and instruments.

**Request Body:**
```json
{
  "mood": "Meditate",
  "instruments": ["Singing Bowls", "Harmonic Drones"]
}
```

**Response:**
```json
{
  "success": true,
  "mood": "Meditate",
  "instruments": ["Singing Bowls", "Harmonic Drones"],
  "prompts": [
    { "text": "Minimalist", "weight": 1.0 },
    { "text": "Singing Bowls", "weight": 1.5 },
    { "text": "Harmonic Drones", "weight": 1.2 },
    { "text": "Soft Bells", "weight": 0.8 }
  ]
}
```

## Supported Moods

- **Anxiety Relief**: Calming ambient music with soft pads and ocean waves
- **Meditate**: Minimalist music with singing bowls and harmonic drones
- **Wind Down**: Chill ambient music with warm synths and nature sounds
- **Focus**: Deep ambient music with steady rhythms and atmospheric pads

## Supported Instruments

- Soft Pads, Warm Synths, Gentle Piano
- Singing Bowls, Harmonic Drones, Soft Bells
- Ocean Waves, Nature Sounds, Atmospheric Pads
- Steady Rhythms, Subtle Electronics
- And many more...

## Configuration Parameters

- **BPM**: 60-200 (beats per minute)
- **Density**: 0.0-1.0 (musical note density)
- **Brightness**: 0.0-1.0 (tonal quality)
- **Guidance**: 0.0-6.0 (prompt adherence)
- **Temperature**: 0.0-3.0 (creativity level)

## Usage Examples

### Generate Music for Anxiety Relief
```bash
curl -X POST http://localhost:3000/api/music/generate \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "Anxiety Relief",
    "bpm": 80,
    "instruments": ["Soft Pads", "Ocean Waves"],
    "duration": 30
  }'
```

### Update Session BPM
```bash
curl -X PUT http://localhost:3000/api/music/session/session-id \
  -H "Content-Type: application/json" \
  -d '{"bpm": 100}'
```

### Get Session Status
```bash
curl http://localhost:3000/api/music/session/session-id
```

## Testing

Run the test script to verify the API:

```bash
node test-music-api.js
```

This will test all endpoints with different moods and parameters.

## Environment Variables

Make sure to set these environment variables:

```bash
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_key
PORT=3000
```

## File Storage

Generated audio files are stored in `backend/storage/audio/` directory. Files are automatically cleaned up when sessions are deleted.

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:

- `400`: Bad Request (missing or invalid parameters)
- `404`: Not Found (session not found)
- `500`: Internal Server Error (server-side errors)

## Rate Limiting

Currently no rate limiting is implemented. Consider adding rate limiting for production use.

## Security

- CORS is enabled for cross-origin requests
- Input validation is performed on all parameters
- Session IDs are UUIDs for security
- Audio files are stored securely and served with appropriate headers
