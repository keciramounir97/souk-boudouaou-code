import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
} from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  // Ref to keep track of timeouts so we can clear them (optional)
  const timersRef = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const addToast = useCallback(
    (message, type = "info", duration = 4000) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2);
      const newToast = { id, message, type };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        timersRef.current[id] = setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = (msg, duration) => addToast(msg, "success", duration);
  const error = (msg, duration) => addToast(msg, "error", duration);
  const info = (msg, duration) => addToast(msg, "info", duration);
  const warning = (msg, duration) => addToast(msg, "warning", duration);

  return (
    <ToastContext.Provider
      value={{ success, error, info, warning, addToast, removeToast }}
    >
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within a ToastProvider");
  return context;
}

function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3 w-full max-w-[360px] pointer-events-none p-4 md:p-0">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  const { type, message } = toast;

  // Appearance map with theme-aware colors
  const styles = {
    success: {
      borderColor: "rgba(34, 197, 94, 0.3)", // green-500/30
      iconColor: "#22c55e", // green-500
      icon: CheckCircle2,
    },
    error: {
      borderColor: "rgba(239, 68, 68, 0.3)", // red-500/30
      iconColor: "#ef4444", // red-500
      icon: AlertCircle,
    },
    warning: {
      borderColor: "rgba(234, 179, 8, 0.3)", // yellow-500/30
      iconColor: "#eab308", // yellow-500
      icon: AlertTriangle,
    },
    info: {
      borderColor: "rgba(59, 130, 246, 0.3)", // blue-500/30
      iconColor: "#3b82f6", // blue-500
      icon: Info,
    },
  };

  const style = styles[type] || styles.info;
  const Icon = style.icon;

  return (
    <div
      className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border animate-in slide-in-from-bottom-5 fade-in duration-300 hover:scale-[1.02] transition-transform"
      style={{
        backgroundColor: "var(--color-surface)",
        color: "var(--color-text)",
        borderColor: style.borderColor,
      }}
      role="alert"
    >
      <Icon 
        className="w-5 h-5 flex-shrink-0 mt-0.5" 
        style={{ color: style.iconColor }}
      />
      <div className="flex-1 text-sm font-medium leading-relaxed" style={{ color: "var(--color-text)" }}>
        {message}
      </div>
      <button
        onClick={onRemove}
        className="transition-colors"
        style={{ 
          color: "var(--color-text-muted)",
        }}
        onMouseEnter={(e) => {
          e.target.style.color = "var(--color-text)";
        }}
        onMouseLeave={(e) => {
          e.target.style.color = "var(--color-text-muted)";
        }}
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
}
