// stores/useSupabaseAuth.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';
import { supabase, db } from '../supabase';

const storage = {
  getItem: async (name) => {
    return await SecureStore.getItemAsync(name);
  },
  setItem: async (name, value) => {
    await SecureStore.setItemAsync(name, value);
  },
  removeItem: async (name) => {
    await SecureStore.deleteItemAsync(name);
  },
};

const useSupabaseAuth = create(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      loading: true,
      userProfile: null,
      
      // Initialize auth state
      initialize: async () => {
        try {
          set({ loading: true });
          
          // Get current session
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error getting session:', error);
            set({ user: null, session: null, loading: false });
            return;
          }
          
          if (session?.user) {
            set({ user: session.user, session });
            
            // Load user profile
            await get().loadUserProfile(session.user.id);
          } else {
            set({ user: null, session: null, userProfile: null });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
          set({ user: null, session: null, userProfile: null });
        } finally {
          set({ loading: false });
        }
      },
      
      // Load user profile from database
      loadUserProfile: async (userId) => {
        try {
          const profile = await db.getUserProfile(userId);
          set({ userProfile: profile });
          return profile;
        } catch (error) {
          console.error('Error loading user profile:', error);
          // If profile doesn't exist, create it
          if (error.code === 'PGRST116') {
            return await get().createUserProfile(userId);
          }
          throw error;
        }
      },
      
      // Create user profile
      createUserProfile: async (userId, userData = {}) => {
        try {
          const profile = await db.createUserProfile(userId, {
            username: userData.username || userData.email?.split('@')[0] || 'user',
            email: userData.email,
            ...userData
          });
          set({ userProfile: profile });
          return profile;
        } catch (error) {
          console.error('Error creating user profile:', error);
          throw error;
        }
      },
      
      // Sign up with email and password
      signUp: async (email, password, userData = {}) => {
        try {
          set({ loading: true });
          
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: userData
            }
          });
          
          if (error) {
            throw error;
          }
          
          if (data.user) {
            set({ user: data.user, session: data.session });
            
            // Create user profile
            if (data.session) {
              await get().createUserProfile(data.user.id, {
                username: userData.username || email.split('@')[0],
                email: email,
                ...userData
              });
            }
          }
          
          return { user: data.user, session: data.session };
        } catch (error) {
          console.error('Sign up error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      // Sign in with email and password
      signIn: async (email, password) => {
        try {
          set({ loading: true });
          
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (error) {
            throw error;
          }
          
          if (data.user) {
            set({ user: data.user, session: data.session });
            
            // Load user profile
            await get().loadUserProfile(data.user.id);
          }
          
          return { user: data.user, session: data.session };
        } catch (error) {
          console.error('Sign in error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      // Sign out
      signOut: async () => {
        try {
          set({ loading: true });
          
          const { error } = await supabase.auth.signOut();
          if (error) {
            throw error;
          }
          
          set({ user: null, session: null, userProfile: null });
        } catch (error) {
          console.error('Sign out error:', error);
          throw error;
        } finally {
          set({ loading: false });
        }
      },
      
      // Update user profile
      updateProfile: async (updates) => {
        try {
          const { user } = get();
          if (!user) throw new Error('No user logged in');
          
          const updatedProfile = await db.updateUserProfile(user.id, updates);
          set({ userProfile: updatedProfile });
          return updatedProfile;
        } catch (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
      },
      
      // Get current user ID
      getUserId: () => {
        const { user } = get();
        return user?.id;
      },
      
      // Check if user is authenticated
      isAuthenticated: () => {
        const { user, session } = get();
        return !!(user && session);
      }
    }),
    {
      name: 'supabase-auth-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        userProfile: state.userProfile
      })
    }
  )
);

// Set up auth state listener
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event, session?.user?.id);
  
  if (event === 'SIGNED_IN' && session?.user) {
    useSupabaseAuth.getState().setUser(session.user);
    useSupabaseAuth.getState().setSession(session);
    await useSupabaseAuth.getState().loadUserProfile(session.user.id);
  } else if (event === 'SIGNED_OUT') {
    useSupabaseAuth.getState().setUser(null);
    useSupabaseAuth.getState().setSession(null);
    useSupabaseAuth.getState().setUserProfile(null);
  }
});

export default useSupabaseAuth;
