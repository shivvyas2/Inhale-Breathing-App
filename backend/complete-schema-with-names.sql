-- Supabase Migration Fix for Inhale Meditation App
-- This script handles existing tables and creates missing ones

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS public.user_music_preferences CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.streaks CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.music CASCADE;

-- Create users table (stores Clerk user data) - UPDATED WITH FIRST_NAME AND LAST_NAME
CREATE TABLE public.users (
    id TEXT PRIMARY KEY, -- Clerk user ID (not UUID)
    username TEXT NOT NULL,
    first_name TEXT, -- Added for Clerk first name
    last_name TEXT, -- Added for Clerk last name
    email TEXT,
    level INTEGER DEFAULT 0,
    points INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    total_minutes INTEGER DEFAULT 0,
    last_session_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table to track individual meditation sessions
CREATE TABLE public.sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Clerk user ID
    session_type TEXT NOT NULL, -- 'breathing', 'meditation', 'mindfulness'
    duration_minutes INTEGER NOT NULL,
    points_earned INTEGER DEFAULT 10,
    mood_id TEXT,
    activity_id TEXT,
    breathing_pattern TEXT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create streaks table to track daily streaks
CREATE TABLE public.streaks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Clerk user ID
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create music table for breathing session audio files
CREATE TABLE public.music (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE, -- Add unique constraint for ON CONFLICT
    file_path TEXT NOT NULL, -- Path in Supabase Storage
    file_url TEXT NOT NULL, -- Public URL for the file
    duration_seconds INTEGER,
    category TEXT DEFAULT 'breathing', -- 'breathing', 'meditation', 'nature'
    mood TEXT, -- 'calm', 'energetic', 'peaceful', etc.
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_music_preferences table for user's music choices
CREATE TABLE public.user_music_preferences (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE NOT NULL, -- Clerk user ID
    music_id UUID REFERENCES public.music(id) ON DELETE CASCADE NOT NULL,
    is_favorite BOOLEAN DEFAULT false,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, music_id)
);

-- Create indexes for better performance
CREATE INDEX idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX idx_sessions_completed_at ON public.sessions(completed_at);
CREATE INDEX idx_streaks_user_id ON public.streaks(user_id);
CREATE INDEX idx_music_category ON public.music(category);
CREATE INDEX idx_music_mood ON public.music(mood);
CREATE INDEX idx_user_music_user_id ON public.user_music_preferences(user_id);

-- Add indexes for first_name and last_name
CREATE INDEX idx_users_first_name ON public.users(first_name);
CREATE INDEX idx_users_last_name ON public.users(last_name);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_music_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can insert own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can view own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can update own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Users can insert own streaks" ON public.streaks;
DROP POLICY IF EXISTS "Music is publicly readable" ON public.music;
DROP POLICY IF EXISTS "Users can view own music preferences" ON public.user_music_preferences;
DROP POLICY IF EXISTS "Users can manage own music preferences" ON public.user_music_preferences;

-- Create a function to get the current user ID (this will be set by your app)
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  -- This will be set by your app when making requests
  -- For now, we'll use a session variable
  RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql;

-- Create RLS policies for Clerk integration
-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (id = get_current_user_id());

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (id = get_current_user_id());

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (id = get_current_user_id());

-- Sessions policies
CREATE POLICY "Users can view own sessions" ON public.sessions
    FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own sessions" ON public.sessions
    FOR INSERT WITH CHECK (user_id = get_current_user_id());

-- Streaks policies
CREATE POLICY "Users can view own streaks" ON public.streaks
    FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can update own streaks" ON public.streaks
    FOR UPDATE USING (user_id = get_current_user_id());

CREATE POLICY "Users can insert own streaks" ON public.streaks
    FOR INSERT WITH CHECK (user_id = get_current_user_id());

-- Music is public (read-only for all users)
CREATE POLICY "Music is publicly readable" ON public.music
    FOR SELECT USING (true);

-- User music preferences policies
CREATE POLICY "Users can view own music preferences" ON public.user_music_preferences
    FOR SELECT USING (user_id = get_current_user_id());

CREATE POLICY "Users can manage own music preferences" ON public.user_music_preferences
    FOR ALL USING (user_id = get_current_user_id());

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS update_user_streak() CASCADE;
DROP FUNCTION IF EXISTS get_user_streak(TEXT) CASCADE;

-- Create functions for streak management
CREATE OR REPLACE FUNCTION update_user_streak()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
    streak_record RECORD;
    last_session_date DATE;
    current_date DATE := CURRENT_DATE;
    days_diff INTEGER;
BEGIN
    -- Get user's last session date
    SELECT last_session_date INTO last_session_date
    FROM public.users
    WHERE id = NEW.user_id;
    
    -- Calculate days difference
    IF last_session_date IS NULL THEN
        days_diff := 1; -- First session
    ELSE
        days_diff := current_date - last_session_date;
    END IF;
    
    -- Get or create streak record
    SELECT * INTO streak_record
    FROM public.streaks
    WHERE user_id = NEW.user_id;
    
    IF NOT FOUND THEN
        -- Create new streak record
        INSERT INTO public.streaks (user_id, current_streak, longest_streak, last_activity_date)
        VALUES (NEW.user_id, 1, 1, current_date);
    ELSE
        -- Update existing streak
        IF days_diff = 1 THEN
            -- Consecutive day, increment streak
            UPDATE public.streaks
            SET current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1),
                last_activity_date = current_date,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        ELSIF days_diff > 1 THEN
            -- Streak broken, reset to 1
            UPDATE public.streaks
            SET current_streak = 1,
                last_activity_date = current_date,
                updated_at = NOW()
            WHERE user_id = NEW.user_id;
        END IF;
    END IF;
    
    -- Update user's last session date and total minutes
    UPDATE public.users
    SET last_session_date = current_date,
        total_minutes = total_minutes + NEW.duration_minutes,
        points = points + NEW.points_earned,
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update streaks when a session is completed
DROP TRIGGER IF EXISTS trigger_update_streak ON public.sessions;
CREATE TRIGGER trigger_update_streak
    AFTER INSERT ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_streak();

-- Create function to get user's current streak
CREATE OR REPLACE FUNCTION get_user_streak(user_id_param TEXT)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER;
BEGIN
    SELECT s.current_streak INTO current_streak
    FROM public.streaks s
    WHERE s.user_id = user_id_param;
    
    RETURN COALESCE(current_streak, 0);
END;
$$ LANGUAGE plpgsql;

-- Insert sample music data (only if they don't exist)
INSERT INTO public.music (name, file_path, file_url, duration_seconds, category, mood) 
SELECT * FROM (VALUES
    ('Ocean Waves', 'music/ocean-waves.mp3', 'https://mkumjzxgocrfmpgxnpmn.supabase.co/storage/v1/object/public/music/ocean-waves.mp3', 300, 'breathing', 'calm'),
    ('Forest Sounds', 'music/forest-sounds.mp3', 'https://mkumjzxgocrfmpgxnpmn.supabase.co/storage/v1/object/public/music/forest-sounds.mp3', 600, 'breathing', 'peaceful'),
    ('Rain Drops', 'music/rain-drops.mp3', 'https://mkumjzxgocrfmpgxnpmn.supabase.co/storage/v1/object/public/music/rain-drops.mp3', 480, 'breathing', 'relaxing'),
    ('Tibetan Bowls', 'music/tibetan-bowls.mp3', 'https://mkumjzxgocrfmpgxnpmn.supabase.co/storage/v1/object/public/music/tibetan-bowls.mp3', 720, 'meditation', 'spiritual'),
    ('White Noise', 'music/white-noise.mp3', 'https://mkumjzxgocrfmpgxnpmn.supabase.co/storage/v1/object/public/music/white-noise.mp3', 1800, 'breathing', 'focused')
) AS v(name, file_path, file_url, duration_seconds, category, mood)
WHERE NOT EXISTS (SELECT 1 FROM public.music WHERE music.name = v.name);

-- Success message
SELECT 'Database schema successfully created/updated with first_name and last_name columns!' as message;
