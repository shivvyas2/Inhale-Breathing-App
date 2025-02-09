// stores/useAuthStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import * as SecureStore from 'expo-secure-store';

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

const useAuthStore = create(
  persist(
    (set) => ({
      mood: null,
      activity: null,
      breathingPattern: null,
      setSelectedMood: (data) => set((state) => ({
        mood: {
          id: data.mood.id,
          label: data.mood.label,
          icon: data.mood.icon
        },
        activity: {
          id: data.activity.id,
          label: data.activity.label
        },
        breathingPattern: data.breathingPattern
      })),
      clearMood: () => set({ mood: null, activity: null, breathingPattern: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => storage),
      partialize: (state) => ({
        mood: state.mood,
        activity: state.activity,
        breathingPattern: state.breathingPattern
      })
    }
  )
);

export default useAuthStore;

