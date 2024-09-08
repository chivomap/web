'use client';
import { create, StateCreator } from 'zustand';
import { persist, PersistOptions, StateStorage } from 'zustand/middleware';

export interface LayoutStates {
  search: boolean;
  department: boolean;
  earthquake: boolean;
}

interface LayoutState {
  layoutStates: LayoutStates;
  updateLayoutStates: (newLayoutStates: LayoutStates) => void;
}

// Custom storage getter that returns a valid storage or a fallback
const getStorage = (): StateStorage => {
  if (typeof window !== 'undefined') {
    return localStorage;
  }
  
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
};

type LayoutStatePersist = (
  config: StateCreator<LayoutState>,
  options: PersistOptions<LayoutState>
) => StateCreator<LayoutState>;

export const useLayoutStore = create<LayoutState>(
  (persist as LayoutStatePersist)(
    (set) => ({
      layoutStates: {
        search: true,
        department: false,
        earthquake: false,
      },
      updateLayoutStates: (newLayoutStates: LayoutStates) => set(() => ({ layoutStates: newLayoutStates })),
    }),
    {
      name: 'layout-storage', 
      getStorage,
    }
  )
);
