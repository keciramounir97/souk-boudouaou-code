import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("UI error:", error, info);
    console.error("Error stack:", error?.stack);
    console.error("Component stack:", info?.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const error = this.state.error;
      return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center px-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-300 dark:border-gray-700 max-w-2xl w-full">
            <div className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">Une erreur est survenue</div>
            <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              Veuillez recharger la page ou contacter le support.
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 break-all mb-2 font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded">
              <strong>Error:</strong> {String(error?.message || error || "Unknown error")}
            </div>
            {error?.stack && (
              <div className="text-xs text-gray-600 dark:text-gray-400 break-all font-mono bg-gray-50 dark:bg-gray-900 p-3 rounded mt-2 max-h-60 overflow-auto">
                <strong>Stack:</strong> {error.stack}
              </div>
            )}
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Recharger la page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
