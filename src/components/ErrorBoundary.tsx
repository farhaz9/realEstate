
'use client'

import React from 'react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
          <div className="max-w-md">
            <h1 className="text-4xl font-bold text-destructive">Oops!</h1>
            <h2 className="mt-4 text-2xl font-semibold">Something went wrong.</h2>
            <p className="mt-2 text-muted-foreground">
              We're sorry for the inconvenience. An unexpected error occurred on our end.
              Please try refreshing the page or come back later.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 p-4 bg-muted rounded-lg text-left text-xs overflow-auto">
                    <p className="font-bold">Error Details:</p>
                    <pre className="whitespace-pre-wrap">{this.state.error.stack || this.state.error.message}</pre>
                </div>
            )}
            <Button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-6"
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
