import { Component, ErrorInfo, ReactNode } from 'react';
import { BiError } from 'react-icons/bi';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="fixed inset-0 bg-primary flex items-center justify-center p-4">
          <div className="bg-primary/95 backdrop-blur-sm border border-white/10 rounded-xl p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <BiError className="text-red-500 text-3xl flex-shrink-0" />
              <h2 className="text-xl font-bold text-white">Algo salió mal</h2>
            </div>
            
            <p className="text-white/70 text-sm mb-4">
              La aplicación encontró un error inesperado. Por favor, recarga la página.
            </p>
            
            {this.state.error && (
              <details className="mb-4">
                <summary className="text-xs text-white/50 cursor-pointer hover:text-white/70">
                  Detalles técnicos
                </summary>
                <pre className="mt-2 text-xs text-white/60 bg-black/20 p-2 rounded overflow-auto max-h-32">
                  {this.state.error.message}
                </pre>
              </details>
            )}
            
            <button
              onClick={this.handleReset}
              className="w-full bg-secondary hover:bg-secondary/80 text-primary font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
