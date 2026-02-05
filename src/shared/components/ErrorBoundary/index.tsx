import React, { Component, ReactNode } from 'react';
import { errorHandler } from '../../errors/ErrorHandler';
import { AppError, ErrorType } from '../../errors/AppError';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: AppError | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    const appError = new AppError(
      ErrorType.UNKNOWN,
      'REACT_ERROR_BOUNDARY',
      error.message,
      'Ha ocurrido un error inesperado en la aplicación'
    );
    
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError = new AppError(
      ErrorType.UNKNOWN,
      'REACT_ERROR_BOUNDARY',
      `${error.message}\n${errorInfo.componentStack}`,
      'Ha ocurrido un error inesperado en la aplicación'
    );
    
    errorHandler.handle(appError);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-primary">
          <div className="max-w-md w-full bg-primary/95 backdrop-blur-md shadow-2xl rounded-xl p-8 border border-secondary/30">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 w-16 h-16 rounded-full bg-secondary/20 flex items-center justify-center">
                <svg className="h-10 w-10 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Error en la aplicación
              </h3>
              <p className="text-sm text-white/70 mb-6">
                {this.state.error?.userMessage || 'Ha ocurrido un error inesperado'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-secondary hover:bg-secondary/90 text-primary font-semibold py-3 px-6 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-secondary/50 shadow-lg hover:shadow-xl hover:scale-[1.02]"
              >
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
