'use client';

import { Component } from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('[ZURI] ErrorBoundary caught:', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 flex items-center justify-center mb-4">
            <span className="text-2xl text-danger">!</span>
          </div>
          <p className="text-text-primary font-semibold mb-1">Une erreur est survenue</p>
          <p className="text-text-muted text-sm mb-4 max-w-md">
            Le studio a rencontré une erreur. Recharge la page ou réessaie.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg bg-primary text-deep text-sm font-medium hover:bg-primary-hover transition-colors"
          >
            Recharger la page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
