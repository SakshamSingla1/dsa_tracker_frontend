import { Component } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";

/** Catches render errors anywhere below it so one broken component doesn't blank the whole
 *  app to a white screen. Error boundaries must be class components -- no hook equivalent. */
export default class ErrorBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // No external error-tracking service wired up (local personal tool) -- console is the log.
    console.error("Unhandled render error:", error, info?.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper p-4">
        <div className="max-w-md w-full bg-paper-raised border border-line rounded-xl shadow-lg p-6 text-center">
          <span className="inline-flex h-12 w-12 rounded-full bg-hard-soft text-hard items-center justify-center text-xl mb-4" aria-hidden="true">
            <FiAlertTriangle />
          </span>
          <h1 className="text-[17px] font-semibold text-ink mb-2">Something went wrong</h1>
          <p className="text-[13.5px] text-ink-soft leading-relaxed mb-3">
            The app hit an unexpected error and couldn&rsquo;t continue rendering this screen. Your data is safe
            server-side -- reloading usually fixes it.
          </p>
          <p className="mono text-[11.5px] text-ink-soft/70 bg-ink/5 rounded-lg p-2.5 mb-4 break-all">
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-accent text-accent-ink text-[13px] font-medium hover:brightness-110"
          >
            <FiRefreshCw aria-hidden="true" /> Reload
          </button>
        </div>
      </div>
    );
  }
}
