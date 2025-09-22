-- Fix RLS policies for sessions table
-- This script fixes the RLS policy violation error

-- First, check if sessions table exists and create if needed
CREATE TABLE IF NOT EXISTS public.sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_duration INTEGER NOT NULL,
    mood TEXT,
    breathing_pattern JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can update their own sessions" ON public.sessions;
DROP POLICY IF EXISTS "Users can delete their own sessions" ON public.sessions;

-- Create new RLS policies
CREATE POLICY "Users can view their own sessions" ON public.sessions
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own sessions" ON public.sessions
    FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own sessions" ON public.sessions
    FOR DELETE USING (auth.uid()::text = user_id);

-- Enable RLS on sessions table
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON public.sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON public.sessions(created_at);

-- Grant necessary permissions
GRANT ALL ON public.sessions TO authenticated;
GRANT ALL ON public.sessions TO service_role;

-- Create a function to insert session with service role (for backend API)
CREATE OR REPLACE FUNCTION insert_session(
    p_user_id TEXT,
    p_session_duration INTEGER,
    p_mood TEXT DEFAULT NULL,
    p_breathing_pattern JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_id UUID;
BEGIN
    INSERT INTO public.sessions (
        user_id,
        session_duration,
        mood,
        breathing_pattern
    ) VALUES (
        p_user_id,
        p_session_duration,
        p_mood,
        p_breathing_pattern
    ) RETURNING id INTO session_id;
    
    RETURN session_id;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION insert_session TO service_role;
GRANT EXECUTE ON FUNCTION insert_session TO authenticated;
