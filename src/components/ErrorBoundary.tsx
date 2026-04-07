import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center text-white">
          <div className="text-center space-y-4">
            <p className="text-white/60">Something went wrong.</p>
            <button
              type="button"
              onClick={() => {
                window.location.href = "/chat";
              }}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 text-cyan-400"
            >
              Go back to chat
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
