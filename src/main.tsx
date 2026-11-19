import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const raw = error?.message || 'An unexpected interface error occurred.';
    try {
      const parsed = JSON.parse(raw) as {
        error?: string;
        operationType?: string;
        path?: string;
      };
      if (parsed && typeof parsed.error === 'string' && parsed.operationType) {
        return {
          hasError: true,
          message: `Database ${parsed.operationType} on ${parsed.path || 'record'} failed: ${parsed.error}`,
        };
      }
    } catch {
      // Non-JSON error message
    }
    return {
      hasError: true,
      message: raw,
    };
  }

  handleResetAndReload = () => {
    try {
      localStorage.removeItem('admitbridge_custom_colleges_v2');
      localStorage.removeItem('admitbridge_custom_colleges_v3');
    } catch {
      // Ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4">
            <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Portal Display Recovery
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={this.handleResetAndReload}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-700 text-white hover:bg-blue-800 transition-colors cursor-pointer"
            >
              Reset Local Cache & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <AppErrorBoundary>
    <App />
  </AppErrorBoundary>
);
