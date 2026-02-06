import { create } from 'zustand';

interface SearchStore {
  showResults: boolean;
  inputValue: string;
  setShowResults: (show: boolean) => void;
  setInputValue: (value: string) => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  showResults: false,
  inputValue: '',
  setShowResults: (show) => set({ showResults: show }),
  setInputValue: (value) => set({ inputValue: value }),
}));
