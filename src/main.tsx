import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { ErrorBoundary } from './shared/components/ErrorBoundary'
import './index.css'

// Remover splash screen cuando React carga
const AppWithSplashRemoval = () => {
  useEffect(() => {
    const splash = document.getElementById('splash');
    if (splash) {
      splash.style.opacity = '0';
      splash.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => splash.remove(), 300);
    }
  }, []);

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AppWithSplashRemoval />
    </ErrorBoundary>
  </StrictMode>,
)
