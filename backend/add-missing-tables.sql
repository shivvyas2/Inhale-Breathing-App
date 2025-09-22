-- Add missing tables for AI music generation
-- Run this in Supabase Dashboard → SQL Editor

-- Create ai_generated_music table
CREATE TABLE IF NOT EXISTS public.ai_generated_music (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    mood TEXT,
    audio_url TEXT, -- URL or base64 data of the generated audio
    category TEXT,
    duration INTEGER, -- in seconds
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_music_preferences table
CREATE TABLE IF NOT EXISTS public.user_music_preferences (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_mood TEXT,
    preferred_bpm_range TEXT,
    preferred_duration INTEGER,
    ai_generation_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create music_generation_sessions table (for tracking usage and caching)
CREATE TABLE IF NOT EXISTS public.music_generation_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mood TEXT,
    breathing_pattern JSONB,
    success BOOLEAN DEFAULT FALSE,
    error_message TEXT,
    generation_time_ms INTEGER,
    reused_cached BOOLEAN DEFAULT FALSE,
    cached_music_id UUID REFERENCES public.ai_generated_music(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for ai_generated_music
ALTER TABLE public.ai_generated_music ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their own AI generated music." ON public.ai_generated_music
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own AI generated music." ON public.ai_generated_music
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own AI generated music." ON public.ai_generated_music
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can delete their own AI generated music." ON public.ai_generated_music
  FOR DELETE USING (auth.uid() = user_id);

-- Add RLS policies for user_music_preferences
ALTER TABLE public.user_music_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their own music preferences." ON public.user_music_preferences
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own music preferences." ON public.user_music_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can update their own music preferences." ON public.user_music_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for music_generation_sessions
ALTER TABLE public.music_generation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Users can view their own music generation sessions." ON public.music_generation_sessions
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can insert their own music generation sessions." ON public.music_generation_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Success message
SELECT 'Missing tables successfully created! AI music generation is now ready.' as message;
