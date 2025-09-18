-- Add first_name and last_name columns to users table
-- This script adds the necessary columns to store Clerk's first and last names

-- Add first_name column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS first_name TEXT;

-- Add last_name column  
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Add index for better performance on name searches
CREATE INDEX IF NOT EXISTS idx_users_first_name ON public.users(first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON public.users(last_name);

-- Update existing users with placeholder values if needed
UPDATE public.users 
SET first_name = 'User', last_name = 'User' 
WHERE first_name IS NULL OR last_name IS NULL;

-- Success message
SELECT 'Successfully added first_name and last_name columns to users table!' as message;
