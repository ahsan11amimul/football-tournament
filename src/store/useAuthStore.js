import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      profile: null,
      loading: true,
      language: localStorage.getItem('language') || 'bn',
      setUser: (user) => set({ user }),
      setProfile: (profile) => set({ profile }),
      setLanguage: (language) => {
        localStorage.setItem('language', language);
        set({ language });
      },
      setLoading: (loading) => set({ loading }),
      logout: () => set({ user: null, profile: null }),
    }),
    {
      name: 'auth-storage',
      getStorage: () => localStorage,
    }
  )
);

export default useAuthStore;
