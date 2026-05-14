import { create } from 'zustand';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

const useBrandingStore = create((set) => ({
  branding: {
    tournamentName: "Talora Baiguni Premier League",
    sponsorName: "Sponsored by Torun Somaj",
    logoUrl: "",
    bannerUrl: ""
  },
  loading: true,
  
  fetchBranding: async () => {
    try {
      const docRef = doc(db, 'settings', 'branding');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        set({ branding: docSnap.data(), loading: false });
      } else {
        set({ loading: false });
      }
    } catch (error) {
      console.error("Error fetching branding:", error);
      set({ loading: false });
    }
  },

  subscribeBranding: () => {
    const unsub = onSnapshot(doc(db, 'settings', 'branding'), (snapshot) => {
      if (snapshot.exists()) {
        set({ branding: snapshot.data(), loading: false });
      }
    });
    return unsub;
  }
}));

export default useBrandingStore;
