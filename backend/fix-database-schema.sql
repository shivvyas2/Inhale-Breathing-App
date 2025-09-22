-- Fix Database Schema for Inhale Meditation App
-- This script adds missing columns and functions

-- Add missing columns to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS current_mood TEXT,
ADD COLUMN IF NOT EXISTS current_activity TEXT,
ADD COLUMN IF NOT EXISTS breathing_pattern TEXT;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_users_first_name ON public.users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON public.users(last_name);
CREATE INDEX IF NOT EXISTS idx_users_current_mood ON public.users(current_mood);

-- Create the set_config function if it doesn't exist
CREATE OR REPLACE FUNCTION public.set_config(setting_name TEXT, setting_value TEXT)
RETURNS VOID AS $$
BEGIN
    PERFORM set_config(setting_name, setting_value, false);
END;
$$ LANGUAGE plpgsql;

-- Create or replace the get_current_user_id function
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS TEXT AS $$
BEGIN
  -- This will be set by your app when making requests
  -- For now, we'll use a session variable
  RETURN current_setting('app.current_user_id', true);
END;
$$ LANGUAGE plpgsql;

-- Create or replace the update_user_streak function
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
        streak = (SELECT current_streak FROM public.streaks WHERE user_id = NEW.user_id),
        updated_at = NOW()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create or replace the get_user_streak function
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

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS trigger_update_streak ON public.sessions;
CREATE TRIGGER trigger_update_streak
    AFTER INSERT ON public.sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_streak();

-- Success message
SELECT 'Database schema successfully updated with missing columns and functions!' as message;
