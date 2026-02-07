import { create } from 'zustand';
import { LngLat } from 'maplibre-gl';

interface PinState {
  pin: LngLat | null;
  setPin: (location: LngLat | null) => void;
  clearPin: () => void;
}

export const usePinStore = create<PinState>((set) => ({
  pin: null,
  setPin: (location) => set({ pin: location }),
  clearPin: () => set({ pin: null }),
}));
