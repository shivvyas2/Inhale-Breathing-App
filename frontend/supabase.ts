import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, processLock } from '@supabase/supabase-js';

// Types for our database
export interface User {
  id: string;
  username: string;
  email?: string;
  level: number;
  points: number;
  streak: number;
  total_minutes: number;
  last_session_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: string;
  session_type: string;
  duration_minutes: number;
  points_earned: number;
  mood_id?: string;
  activity_id?: string;
  breathing_pattern?: string;
  completed_at: string;
  created_at: string;
}

export interface Streak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Music {
  id: string;
  name: string;
  file_path: string;
  file_url: string;
  duration_seconds: number;
  category: string;
  mood?: string;
  is_active: boolean;
  created_at: string;
}

export interface UserMusicPreference {
  id: string;
  user_id: string;
  music_id: string;
  is_favorite: boolean;
  last_used: string;
  created_at: string;
  music?: Music;
}

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://mkumjzxgocrfmpgxnpmn.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1rdW1qenhnb2NyZm1wZ3hucG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgxNDU4MTYsImV4cCI6MjA3MzcyMTgxNn0.sd4PtprQuSh8Ol8v0UcDvQUkxg3zc-pLZ5LcZfHUMDI';

console.log('=== SUPABASE DEBUG ===');
console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key length:', supabaseKey ? supabaseKey.length : 'Missing');
console.log('Supabase Key first 20 chars:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'Missing');
console.log('=====================');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing environment variables:');
  console.error('URL present:', !!supabaseUrl);
  console.error('Key present:', !!supabaseKey);
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      lock: processLock,
    },
  }
);

// Helper function to set user context for RLS
const setUserContext = async (userId: string): Promise<void> => {
  try {
    // Try to set the user context using the RPC function
    const { error } = await supabase.rpc('set_config', {
      setting_name: 'app.current_user_id',
      setting_value: userId
    });
    
    if (error) {
      console.warn('Failed to set user context via RPC:', error);
      // The RPC function might not exist or might not be working
      // This is expected if the database doesn't have the set_config function
    } else {
      console.log('User context set successfully for:', userId);
    }
  } catch (error) {
    console.warn('Failed to set user context:', error);
    // This is expected if the RPC function doesn't exist
  }
};

// Database helper functions
export const db = {
  // User functions
  async getUserProfile(userId: string): Promise<User> {
    try {
      console.log('Getting user profile for:', userId);
      await setUserContext(userId);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Supabase error:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }
      
      console.log('Successfully retrieved user profile:', data);
      return data;
    } catch (error) {
      console.error('Error in getUserProfile:', error);
      throw error;
    }
  },

  async createUserProfile(userId: string, userData: Partial<User>): Promise<User> {
    await setUserContext(userId);
    
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        username: userData.username || 'user',
        email: userData.email,
        level: userData.level || 0,
        points: userData.points || 0,
        streak: userData.streak || 0,
        total_minutes: userData.total_minutes || 0,
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    return data;
  },

  async updateUserProfile(userId: string, updates: Partial<User>): Promise<User> {
    await setUserContext(userId);
    
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    return data;
  },

  // Session functions
  async createSession(sessionData: Omit<Session, 'id' | 'created_at' | 'completed_at'>): Promise<Session> {
    await setUserContext(sessionData.user_id);
    
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        ...sessionData,
        completed_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    // Update streak after session creation
    await this.updateUserStreak(sessionData.user_id);
    
    return data;
  },

  async getUserSessions(userId: string, limit: number = 10): Promise<Session[]> {
    await setUserContext(userId);
    
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      throw error;
    }
    return data || [];
  },

  // Streak functions
  async getUserStreak(userId: string): Promise<Streak | null> {
    await setUserContext(userId);
    
    const { data, error } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error; // PGRST116 = no rows found
    }
    return data;
  },

  async getCurrentStreak(userId: string): Promise<number> {
    await setUserContext(userId);
    
    const { data, error } = await supabase
      .rpc('get_user_streak', { user_id_param: userId });
    
    if (error) {
      throw error;
    }
    return data || 0;
  },

  // Update user streak based on session activity
  async updateUserStreak(userId: string): Promise<void> {
    await setUserContext(userId);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Get current streak data
    const { data: streakData, error: streakError } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (streakError && streakError.code !== 'PGRST116') {
      throw streakError;
    }
    
    // Get user's last session date from sessions table
    const { data: lastSession, error: sessionError } = await supabase
      .from('sessions')
      .select('completed_at')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false })
      .limit(1)
      .single();
    
    if (sessionError && sessionError.code !== 'PGRST116') {
      throw sessionError;
    }
    
    const lastSessionDate = lastSession?.completed_at ? 
      new Date(lastSession.completed_at).toISOString().split('T')[0] : null;
    
    let newCurrentStreak = 1;
    let newLongestStreak = 1;
    
    if (streakData) {
      const lastActivityDate = streakData.last_activity_date;
      const daysSinceLastActivity = lastActivityDate ? 
        Math.floor((new Date(today).getTime() - new Date(lastActivityDate).getTime()) / (1000 * 60 * 60 * 24)) : 1;
      
      if (daysSinceLastActivity === 1) {
        // Consecutive day - increment streak
        newCurrentStreak = streakData.current_streak + 1;
        newLongestStreak = Math.max(newCurrentStreak, streakData.longest_streak);
      } else if (daysSinceLastActivity > 1) {
        // Streak broken - reset to 1
        newCurrentStreak = 1;
        newLongestStreak = streakData.longest_streak;
      } else {
        // Same day - keep current streak
        newCurrentStreak = streakData.current_streak;
        newLongestStreak = streakData.longest_streak;
      }
      
      // Update existing streak
      const { error: updateError } = await supabase
        .from('streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_activity_date: today,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (updateError) throw updateError;
    } else {
      // Create new streak record
      const { error: createError } = await supabase
        .from('streaks')
        .insert({
          user_id: userId,
          current_streak: 1,
          longest_streak: 1,
          last_activity_date: today
        });
      
      if (createError) throw createError;
    }
    
    // Update user's streak field and last_session_date in users table
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({
        streak: newCurrentStreak,
        last_session_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);
    
    if (userUpdateError) throw userUpdateError;
  },

  // Get comprehensive streak data
  async getStreakData(userId: string): Promise<{current: number, longest: number, lastActivity: string | null}> {
    await setUserContext(userId);
    
    const { data, error } = await supabase
      .from('streaks')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return {
      current: data?.current_streak || 0,
      longest: data?.longest_streak || 0,
      lastActivity: data?.last_activity_date || null
    };
  },

  // Music functions
  async getMusic(category?: string, mood?: string): Promise<Music[]> {
    let query = supabase
      .from('music')
      .select('*')
      .eq('is_active', true);
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (mood) {
      query = query.eq('mood', mood);
    }
    
    const { data, error } = await query.order('name');
    
    if (error) {
      throw error;
    }
    return data || [];
  },

  async getUserMusicPreferences(userId: string): Promise<UserMusicPreference[]> {
    await setUserContext(userId);
    
    const { data, error } = await supabase
      .from('user_music_preferences')
      .select(`
        *,
        music (*)
      `)
      .eq('user_id', userId);
    
    if (error) {
      throw error;
    }
    return data || [];
  },

  async updateMusicPreference(userId: string, musicId: string, isFavorite: boolean = true): Promise<UserMusicPreference> {
    await setUserContext(userId);
    
    const { data, error } = await supabase
      .from('user_music_preferences')
      .upsert({
        user_id: userId,
        music_id: musicId,
        is_favorite: isFavorite,
        last_used: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    return data;
  },

  // Analytics functions
  async getUserStats(userId: string): Promise<User & { sessions: Session[], streaks: Streak[] }> {
    await setUserContext(userId);
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        sessions (id, duration_minutes, points_earned, completed_at),
        streaks (*)
      `)
      .eq('id', userId)
      .single();
    
    if (error) {
      throw error;
    }
    return data;
  },

  async getWeeklyStats(userId: string): Promise<Session[]> {
    await setUserContext(userId);
    
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const { data, error } = await supabase
      .from('sessions')
      .select('duration_minutes, points_earned, completed_at')
      .eq('user_id', userId)
      .gte('completed_at', oneWeekAgo.toISOString())
      .order('completed_at', { ascending: false });
    
    if (error) {
      throw error;
    }
    return data || [];
  }
};

// Export types for use in other files
export type { User, Session, Streak, Music, UserMusicPreference };

