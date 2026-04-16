import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class SafeErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#07090F] rounded-3xl border border-red-500/10 m-4">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center border border-red-500/20 mb-6">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
          
          <h2 className="text-2xl font-black text-white mb-2 tracking-tight">Component Crash Detected</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-8 font-medium leading-relaxed">
            Oops! The learning module encountered an unexpected glitch. Our engineers have been notified.
          </p>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-8 max-w-lg mx-auto text-left w-full overflow-hidden">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-2">Error Details</p>
            <p className="font-mono text-[11px] text-red-400 break-all leading-tight">
              {this.state.error?.message || "Unknown Error"}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button
              onClick={this.handleReset}
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
            >
              <RefreshCcw className="w-4 h-4" />
              Reset Module
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-8 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 border border-white/5"
            >
              <Home className="w-4 h-4" />
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
