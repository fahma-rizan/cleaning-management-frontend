import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can log the error to an external reporting service here
    // For now, we'll just log it to the console
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  // A function to reset the error state and try re-rendering
  private handleTryAgain = () => {
    this.setState({ hasError: false, error: undefined });
  };

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, render it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Otherwise, render a default fallback UI
      return (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
          <div className="flex">
            <div className="py-1">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3" />
            </div>
            <div>
              <p className="font-bold">Something went wrong</p>
              <p className="text-sm">This part of the application has encountered an error.</p>
              <button
                onClick={this.handleTryAgain}
                className="mt-2 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded hover:bg-red-600"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;