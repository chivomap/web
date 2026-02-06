import { create } from 'zustand';

interface NetworkStore {
  isOnline: boolean;
  setIsOnline: (online: boolean) => void;
}

export const useNetworkStore = create<NetworkStore>((set) => ({
  isOnline: navigator.onLine,
  setIsOnline: (online) => set({ isOnline: online }),
}));

// Initialize network listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useNetworkStore.getState().setIsOnline(true);
  });

  window.addEventListener('offline', () => {
    useNetworkStore.getState().setIsOnline(false);
  });
}
