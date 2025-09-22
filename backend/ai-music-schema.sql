-- AI Generated Music Schema
-- This script creates tables for storing AI-generated music and user preferences

-- Create ai_generated_music table
CREATE TABLE IF NOT EXISTS public.ai_generated_music (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    breathing_pattern JSONB NOT NULL,
    prompt TEXT NOT NULL,
    bpm INTEGER NOT NULL,
    duration TEXT NOT NULL,
    audio_url TEXT,
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_ai_generated BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_music_preferences table
CREATE TABLE IF NOT EXISTS public.user_music_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    preferred_mood TEXT,
    preferred_bpm_min INTEGER DEFAULT 60,
    preferred_bpm_max INTEGER DEFAULT 120,
    preferred_duration INTEGER DEFAULT 300, -- in seconds
    ai_generation_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create music_generation_sessions table to track usage
CREATE TABLE IF NOT EXISTS public.music_generation_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mood TEXT NOT NULL,
    breathing_pattern JSONB NOT NULL,
    prompt_used TEXT NOT NULL,
    bpm INTEGER NOT NULL,
    duration_seconds INTEGER NOT NULL,
    generation_time_ms INTEGER, -- time taken to generate
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_generated_music_user_id ON public.ai_generated_music(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_generated_music_mood ON public.ai_generated_music(mood);
CREATE INDEX IF NOT EXISTS idx_ai_generated_music_generated_at ON public.ai_generated_music(generated_at);
CREATE INDEX IF NOT EXISTS idx_user_music_preferences_user_id ON public.user_music_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_music_generation_sessions_user_id ON public.music_generation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_music_generation_sessions_created_at ON public.music_generation_sessions(created_at);

-- Add RLS policies
ALTER TABLE public.ai_generated_music ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_music_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.music_generation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_generated_music
CREATE POLICY "Users can view their own AI generated music" ON public.ai_generated_music
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own AI generated music" ON public.ai_generated_music
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own AI generated music" ON public.ai_generated_music
    FOR UPDATE USING (auth.uid()::text = user_id);

-- RLS policies for user_music_preferences
CREATE POLICY "Users can view their own music preferences" ON public.user_music_preferences
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own music preferences" ON public.user_music_preferences
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own music preferences" ON public.user_music_preferences
    FOR UPDATE USING (auth.uid()::text = user_id);

-- RLS policies for music_generation_sessions
CREATE POLICY "Users can view their own generation sessions" ON public.music_generation_sessions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own generation sessions" ON public.music_generation_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_ai_generated_music_updated_at 
    BEFORE UPDATE ON public.ai_generated_music 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_music_preferences_updated_at 
    BEFORE UPDATE ON public.user_music_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.user_music_preferences (user_id, preferred_mood, preferred_bpm_min, preferred_bpm_max, preferred_duration, ai_generation_enabled)
SELECT 
    id as user_id,
    'Calm' as preferred_mood,
    60 as preferred_bpm_min,
    90 as preferred_bpm_max,
    300 as preferred_duration,
    true as ai_generation_enabled
FROM public.users
WHERE NOT EXISTS (
    SELECT 1 FROM public.user_music_preferences 
    WHERE user_id = users.id
);

-- Success message
SELECT 'AI Music Generation schema created successfully!' as message;
