import { Component } from 'react';

/**
 * Catches rendering errors in child components and displays a fallback UI
 * instead of a blank screen. Errors during React's commit phase are not caught
 * by try/catch in render functions.
 */
export default class ErrorBoundary extends Component {
  state = { error: null, errorInfo: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    const { error, errorInfo } = this.state;
    const { children, fallback } = this.props;

    if (error) {
      if (fallback) return fallback;
      return (
        <div className="empty-state error-state" style={{ padding: 24 }}>
          <h2>Something went wrong</h2>
          <p>{error.message || 'A rendering error occurred.'}</p>
          {errorInfo?.componentStack && (
            <details style={{ marginTop: 16, textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>Error details</summary>
              <pre style={{ fontSize: 12, marginTop: 8, padding: 12, backgroundColor: '#f5f5f5', overflow: 'auto', maxHeight: 200 }}>
                {errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => this.setState({ error: null, errorInfo: null })}
            className="reload-button"
            style={{ marginTop: 16 }}
          >
            Try again
          </button>
        </div>
      );
    }

    return children;
  }
}
