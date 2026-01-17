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
        return <BiWifi className="text-red-500 text-xl" />;
      default:
        return <BiErrorCircle className="text-red-500 text-xl" />;
    }
  };

  const getBgColor = () => {
    switch (currentError.type) {
      case ErrorType.NETWORK:
        return 'bg-orange-50 border-orange-200';
      case ErrorType.TIMEOUT:
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm p-4 border rounded-lg shadow-lg ${getBgColor()}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">
            {currentError.userMessage}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            Código: {currentError.code}
          </p>
        </div>
        <button
          onClick={clearError}
          className="text-gray-400 hover:text-gray-600"
        >
          <BiX className="text-lg" />
        </button>
      </div>
    </div>
  );
};
