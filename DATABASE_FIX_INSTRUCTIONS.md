# 🚨 URGENT: Database Fix Required

## Current Issues
The app is showing these errors because the database migration hasn't been run:
- ❌ `set_config` function not found
- ❌ `breathing_pattern` column missing
- ❌ User profile doesn't exist

## 🔧 Quick Fix (5 minutes)

### Step 1: Open Supabase Dashboard
1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your Inhale project

### Step 2: Run Database Migration
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New Query"**
3. Copy the entire contents of `QUICK_DATABASE_FIX.sql`
4. Paste it into the SQL editor
5. Click **"Run"** button

### Step 3: Verify Fix
1. You should see: `"Database schema successfully updated! Streak tracking is now active."`
2. If you see any errors, let me know and I'll help fix them

### Step 4: Test the App
1. Go back to your React Native app
2. Try to complete a breathing session
3. Check if the streak tracking works
4. Check if the mood selection works

## 🎯 What This Fix Does

✅ **Adds Missing Columns:**
- `first_name`, `last_name` (for Clerk integration)
- `current_mood`, `current_activity`, `breathing_pattern` (for app functionality)

✅ **Creates Required Functions:**
- `set_config()` - for user context
- `update_user_streak()` - for automatic streak updates
- `get_user_streak()` - for fetching streak data

✅ **Sets Up Automatic Streak Tracking:**
- Creates database trigger that runs when sessions are completed
- Automatically updates streaks based on consecutive days
- Handles first-time users and streak resets

## 🚀 After the Fix

Once you run the migration:
1. **Streak tracking will work automatically**
2. **Mood selection will save properly**
3. **User profiles will be created automatically**
4. **AI music generation will be ready**

## 📞 Need Help?

If you encounter any issues:
1. Copy the error message
2. Let me know what step failed
3. I'll provide a specific solution

The migration is safe to run multiple times - it won't break anything!
