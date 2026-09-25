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
      <div className="error-boundary-shell">
        <div className="glass-card error-boundary-card">
          <span className="error-boundary-icon" aria-hidden="true">
            <FiAlertTriangle />
          </span>
          <h1>Something went wrong</h1>
          <p>
            The app hit an unexpected error and couldn&rsquo;t continue rendering this screen. Your data is safe
            server-side -- reloading usually fixes it.
          </p>
          <p className="error-boundary-message mono">{String(this.state.error?.message || this.state.error)}</p>
          <button className="submit-btn" onClick={() => window.location.reload()}>
            <FiRefreshCw aria-hidden="true" /> Reload
          </button>
        </div>
      </div>
    );
  }
}
