import { create } from 'zustand';
import { AppError } from '../errors/AppError';

interface ErrorState {
  currentError: AppError | null;
  isLoading: boolean;
  showError: (error: AppError) => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  currentError: null,
  isLoading: false,
  
  showError: (error: AppError) => set({ currentError: error, isLoading: false }),
  
  clearError: () => set({ currentError: null }),
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
