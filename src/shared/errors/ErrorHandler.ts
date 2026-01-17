import { AppError, ErrorType } from './AppError';
import { env, isDevelopment } from '../config/env';

interface ErrorLog {
  timestamp: string;
  type: ErrorType;
  code: string;
  message: string;
  userMessage: string;
  stack?: string;
}

class ErrorHandler {
  private errors: ErrorLog[] = [];

  public handle(error: unknown): AppError {
    const appError = this.normalizeError(error);
    this.logError(appError);
    return appError;
  }

  private normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      return new AppError(
        ErrorType.NETWORK,
        'FETCH_ERROR',
        error.message,
        'Error de conexión. Verifica tu internet.'
      );
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new AppError(
          ErrorType.TIMEOUT,
          'REQUEST_TIMEOUT',
          'Request was aborted due to timeout',
          'La operación tardó demasiado. Intenta de nuevo.'
        );
      }

      return new AppError(
        ErrorType.UNKNOWN,
        'GENERIC_ERROR',
        error.message,
        'Ha ocurrido un error inesperado'
      );
    }

    return new AppError(
      ErrorType.UNKNOWN,
      'UNKNOWN_ERROR',
      String(error),
      'Ha ocurrido un error inesperado'
    );
  }

  private logError(error: AppError): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      type: error.type,
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      stack: error.stack,
    };

    this.errors.push(errorLog);

    if (isDevelopment && env.ENABLE_CONSOLE_LOGS) {
      console.error('Error handled:', errorLog);
    }

    // Keep only last 50 errors to prevent memory leaks
    if (this.errors.length > 50) {
      this.errors = this.errors.slice(-50);
    }
  }

  public getRecentErrors(): ErrorLog[] {
    return [...this.errors];
  }

  public clearErrors(): void {
    this.errors = [];
  }
}

export const errorHandler = new ErrorHandler();
