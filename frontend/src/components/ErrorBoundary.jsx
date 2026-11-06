import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen bg-ink-900 text-fog flex items-center justify-center p-8">
          <div className="hairline rounded-xl bg-ink-800 p-8 max-w-md">
            <p className="mono-label text-beacon mb-3">System fault</p>
            <p className="text-slate-200 text-sm font-mono break-words">
              {String(this.state.error)}
            </p>
            <button
              data-testid="error-reload-button"
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-beacon px-5 py-2 text-ink-900 text-sm font-semibold"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
