import React from 'react';
import { BiX, BiErrorCircle, BiWifi } from 'react-icons/bi';
import { useErrorStore } from '../../store/errorStore';
import { ErrorType } from '../../errors/AppError';

export const ErrorNotification: React.FC = () => {
  const { currentError, clearError } = useErrorStore();

  if (!currentError) return null;

  const getIcon = () => {
    switch (currentError.type) {
      case ErrorType.NETWORK:
        return <BiWifi className="text-secondary text-xl" />;
      default:
        return <BiErrorCircle className="text-secondary text-xl" />;
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[200] max-w-sm animate-in slide-in-from-top-2 fade-in duration-300">
      <div className="bg-primary/95 backdrop-blur-md border border-secondary/30 rounded-xl shadow-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
            {getIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">
              {currentError.userMessage}
            </p>
            {currentError.code && (
              <p className="text-xs text-white/50 mt-1">
                Código: {currentError.code}
              </p>
            )}
          </div>
          <button
            onClick={clearError}
            className="flex-shrink-0 p-1 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white"
          >
            <BiX className="text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};
