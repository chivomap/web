import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mapStyles, defaultMapStyle, MapStyle } from '../data/mapStyles';

interface ThemeState {
  currentMapStyle: MapStyle;
  setMapStyle: (style: MapStyle) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      currentMapStyle: defaultMapStyle,
      setMapStyle: (style: MapStyle) => set({ currentMapStyle: style }),
    }),
    {
      name: 'chivomap-theme',
    }
  )
);
