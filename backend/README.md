# Inhale Backend API

Backend API for the Inhale breathing app that handles user streak tracking and session data.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp env.example .env
   ```

3. **Configure environment variables:**
   Edit `.env` file with your Supabase credentials:
   ```
   SUPABASE_URL=your_supabase_url_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   PORT=3000
   ```

4. **Start the server:**
   ```bash
   npm start
   # or
   node start-server.js
   ```

## API Endpoints

### Health Check
- **GET** `/health`
- Returns server status

### Update User Streak
- **POST** `/api/users/:userId/streak`
- Updates user streak after session completion
- **Body:**
  ```json
  {
    "sessionDuration": 120,
    "mood": "Meditate",
    "breathingPattern": {
      "inhale": 4,
      "hold1": 7,
      "exhale": 8,
      "hold2": 0
    }
  }
  ```

### Get User Data
- **GET** `/api/users/:userId`
- Returns user data including current streak

## Streak Logic

- **Consecutive Days**: Streak increments only for consecutive days
- **Same Day**: Multiple sessions on same day don't increase streak
- **Missed Day**: Streak resets to 1 if a day is missed
- **Minimum Duration**: Sessions must be at least 30 seconds to count

## Database Schema

The API expects a `users` table with:
- `id` (string): User ID
- `streak` (integer): Current streak count
- `total_minutes` (integer): Total minutes meditated
- `last_session_date` (date): Last session date
- `current_mood` (string): Current mood
- `breathing_pattern` (json): Breathing pattern settings