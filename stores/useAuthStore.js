// stores/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      selectedMood: null,
      setUser: (user) => set({ user }),
      setSelectedMood: (mood) => set({ selectedMood: mood }),
      clearMood: () => set({ selectedMood: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

export default useAuthStore;

